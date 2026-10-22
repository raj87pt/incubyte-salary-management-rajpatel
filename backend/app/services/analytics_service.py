"""Analytics service for aggregating salary data across departments, geographies, and currencies."""

import statistics
from collections import Counter, defaultdict
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.schemas.analytics import (
    DashboardMetricsResponse,
    DepartmentStatResponse,
    CountryStatResponse,
    SalaryBucketResponse,
)
from app.utils.currency import convert_to_base_currency


class AnalyticsService:
    """Calculates compensation and headcount analytics normalized to USD."""

    @staticmethod
    async def get_dashboard_metrics(db: AsyncSession) -> DashboardMetricsResponse:
        """Calculate high-level compensation KPIs for HR dashboard."""
        query = select(Employee.base_salary, Employee.currency, Employee.status, Employee.department, Employee.country)
        result = await db.execute(query)
        rows = result.all()

        if not rows:
            return DashboardMetricsResponse(
                total_employees=0,
                active_employees=0,
                total_departments=0,
                total_countries=0,
                total_payroll_usd=0.0,
                average_salary_usd=0.0,
                median_salary_usd=0.0,
                min_salary_usd=0.0,
                max_salary_usd=0.0,
                currency_breakdown={},
            )

        total_employees = len(rows)
        active_employees = sum(1 for r in rows if r.status == "active")
        departments = {r.department for r in rows if r.department}
        countries = {r.country for r in rows if r.country}

        currency_counter = Counter(r.currency for r in rows)

        # Normalize salaries to USD
        salaries_usd = [
            convert_to_base_currency(r.base_salary, r.currency)
            for r in rows
            if r.status == "active" or active_employees == 0
        ]
        if not salaries_usd:
            salaries_usd = [convert_to_base_currency(r.base_salary, r.currency) for r in rows]

        total_payroll_usd = round(sum(salaries_usd), 2)
        avg_salary_usd = round(statistics.mean(salaries_usd), 2) if salaries_usd else 0.0
        median_salary_usd = round(statistics.median(salaries_usd), 2) if salaries_usd else 0.0
        min_salary_usd = round(min(salaries_usd), 2) if salaries_usd else 0.0
        max_salary_usd = round(max(salaries_usd), 2) if salaries_usd else 0.0

        return DashboardMetricsResponse(
            total_employees=total_employees,
            active_employees=active_employees,
            total_departments=len(departments),
            total_countries=len(countries),
            total_payroll_usd=total_payroll_usd,
            average_salary_usd=avg_salary_usd,
            median_salary_usd=median_salary_usd,
            min_salary_usd=min_salary_usd,
            max_salary_usd=max_salary_usd,
            currency_breakdown=dict(currency_counter),
        )

    @staticmethod
    async def get_department_breakdown(db: AsyncSession) -> List[DepartmentStatResponse]:
        """Aggregate headcount and salary statistics by department."""
        query = select(Employee.department, Employee.base_salary, Employee.currency)
        result = await db.execute(query)
        rows = result.all()

        dept_salaries: Dict[str, List[float]] = defaultdict(list)
        for r in rows:
            usd_val = convert_to_base_currency(r.base_salary, r.currency)
            dept_salaries[r.department].append(usd_val)

        stats: List[DepartmentStatResponse] = []
        for dept, salaries in dept_salaries.items():
            stats.append(
                DepartmentStatResponse(
                    department=dept,
                    employee_count=len(salaries),
                    total_salary_usd=round(sum(salaries), 2),
                    average_salary_usd=round(statistics.mean(salaries), 2),
                    min_salary_usd=round(min(salaries), 2),
                    max_salary_usd=round(max(salaries), 2),
                )
            )

        # Sort by total salary descending
        stats.sort(key=lambda s: s.total_salary_usd, reverse=True)
        return stats

    @staticmethod
    async def get_country_breakdown(db: AsyncSession) -> List[CountryStatResponse]:
        """Aggregate headcount and salary statistics by country."""
        query = select(Employee.country, Employee.base_salary, Employee.currency)
        result = await db.execute(query)
        rows = result.all()

        country_data: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"salaries": [], "currencies": Counter()})
        for r in rows:
            usd_val = convert_to_base_currency(r.base_salary, r.currency)
            country_data[r.country]["salaries"].append(usd_val)
            country_data[r.country]["currencies"][r.currency] += 1

        stats: List[CountryStatResponse] = []
        for country, data in country_data.items():
            salaries = data["salaries"]
            top_currency = data["currencies"].most_common(1)[0][0] if data["currencies"] else "USD"
            stats.append(
                CountryStatResponse(
                    country=country,
                    employee_count=len(salaries),
                    total_salary_usd=round(sum(salaries), 2),
                    average_salary_usd=round(statistics.mean(salaries), 2),
                    primary_currency=top_currency,
                )
            )

        stats.sort(key=lambda s: s.employee_count, reverse=True)
        return stats

    @staticmethod
    async def get_salary_distribution(db: AsyncSession) -> List[SalaryBucketResponse]:
        """Group normalized salaries into distribution buckets."""
        query = select(Employee.base_salary, Employee.currency)
        result = await db.execute(query)
        rows = result.all()

        salaries_usd = [convert_to_base_currency(r.base_salary, r.currency) for r in rows]

        buckets_config = [
            ("< $50k", 0.0, 50000.0),
            ("$50k - $80k", 50000.0, 80000.0),
            ("$80k - $120k", 80000.0, 120000.0),
            ("$120k - $160k", 120000.0, 160000.0),
            ("$160k - $200k", 160000.0, 200000.0),
            ("> $200k", 200000.0, None),
        ]

        buckets: List[SalaryBucketResponse] = []
        for label, min_val, max_val in buckets_config:
            if max_val is not None:
                count = sum(1 for s in salaries_usd if min_val <= s < max_val)
            else:
                count = sum(1 for s in salaries_usd if s >= min_val)

            buckets.append(
                SalaryBucketResponse(
                    bucket=label,
                    min_val=min_val,
                    max_val=max_val,
                    count=count,
                )
            )

        return buckets
