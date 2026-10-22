"""Pydantic schemas for HR salary analytics, aggregations, and metrics."""

from typing import Dict, List, Optional
from pydantic import BaseModel


class DashboardMetricsResponse(BaseModel):
    total_employees: int
    active_employees: int
    total_departments: int
    total_countries: int
    total_payroll_usd: float
    average_salary_usd: float
    median_salary_usd: float
    min_salary_usd: float
    max_salary_usd: float
    currency_breakdown: Dict[str, int]


class DepartmentStatResponse(BaseModel):
    department: str
    employee_count: int
    total_salary_usd: float
    average_salary_usd: float
    min_salary_usd: float
    max_salary_usd: float


class CountryStatResponse(BaseModel):
    country: str
    employee_count: int
    total_salary_usd: float
    average_salary_usd: float
    primary_currency: str


class SalaryBucketResponse(BaseModel):
    bucket: str
    min_val: float
    max_val: Optional[float]
    count: int


class CSVImportResponse(BaseModel):
    total_rows: int
    imported: int
    failed: int
    errors: List[str] = []
