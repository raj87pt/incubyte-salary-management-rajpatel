"""Tests for Analytics and CSV Import/Export endpoints and services."""

import io
import pytest
from datetime import date
from app.schemas.employee import EmployeeCreate
from app.services.employee_service import EmployeeService


@pytest.fixture
async def sample_employees(db_session):
    """Seed a sample set of employees across multiple countries and departments."""
    employees = [
        EmployeeCreate(
            employee_id="EMP-A001",
            first_name="Alice",
            last_name="Johnson",
            email="alice.j@acme.org",
            department="Engineering",
            designation="Software Engineer",
            country="United States",
            city="Seattle",
            gender="Female",
            date_of_birth=date(1990, 1, 1),
            date_of_joining=date(2020, 1, 1),
            employment_type="full-time",
            status="active",
            base_salary=120000.0,
            currency="USD",
            salary_effective_date=date(2023, 1, 1),
        ),
        EmployeeCreate(
            employee_id="EMP-A002",
            first_name="Bob",
            last_name="Williams",
            email="bob.w@acme.org",
            department="Engineering",
            designation="Senior Engineer",
            country="United States",
            city="San Francisco",
            gender="Male",
            date_of_birth=date(1985, 5, 20),
            date_of_joining=date(2018, 3, 15),
            employment_type="full-time",
            status="active",
            base_salary=180000.0,
            currency="USD",
            salary_effective_date=date(2023, 1, 1),
        ),
        EmployeeCreate(
            employee_id="EMP-A003",
            first_name="Chloe",
            last_name="Dupont",
            email="chloe.d@acme.org",
            department="Marketing",
            designation="Marketing Director",
            country="France",
            city="Paris",
            gender="Female",
            date_of_birth=date(1987, 8, 12),
            date_of_joining=date(2019, 7, 1),
            employment_type="full-time",
            status="active",
            base_salary=90000.0,
            currency="EUR",  # 90000 * 1.08 = 97200 USD
            salary_effective_date=date(2023, 1, 1),
        ),
        EmployeeCreate(
            employee_id="EMP-A004",
            first_name="Deepak",
            last_name="Sharma",
            email="deepak.s@acme.org",
            department="Support",
            designation="Support Specialist",
            country="India",
            city="Bengaluru",
            gender="Male",
            date_of_birth=date(1995, 11, 25),
            date_of_joining=date(2022, 10, 1),
            employment_type="full-time",
            status="active",
            base_salary=1500000.0,
            currency="INR",  # 1500000 * 0.012 = 18000 USD
            salary_effective_date=date(2022, 10, 1),
        ),
    ]
    created = []
    for emp in employees:
        c = await EmployeeService.create_employee(db_session, emp)
        created.append(c)
    return created


async def test_analytics_dashboard_metrics(client, sample_employees):
    """GET /api/v1/analytics/dashboard should return accurate aggregate metrics."""
    res = await client.get("/api/v1/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()

    assert data["total_employees"] == 4
    assert data["total_departments"] == 3  # Engineering, Marketing, Support
    assert data["total_countries"] == 3    # United States, France, India
    assert data["total_payroll_usd"] > 0
    assert data["average_salary_usd"] > 0
    assert "currency_breakdown" in data


async def test_analytics_department_breakdown(client, sample_employees):
    """GET /api/v1/analytics/departments should return stats grouped by department."""
    res = await client.get("/api/v1/analytics/departments")
    assert res.status_code == 200
    data = res.json()

    eng = next((d for d in data if d["department"] == "Engineering"), None)
    assert eng is not None
    assert eng["employee_count"] == 2
    assert eng["average_salary_usd"] == 150000.0  # (120k + 180k)/2


async def test_analytics_country_breakdown(client, sample_employees):
    """GET /api/v1/analytics/countries should return stats grouped by country."""
    res = await client.get("/api/v1/analytics/countries")
    assert res.status_code == 200
    data = res.json()

    us = next((c for c in data if c["country"] == "United States"), None)
    assert us is not None
    assert us["employee_count"] == 2


async def test_analytics_salary_distribution(client, sample_employees):
    """GET /api/v1/analytics/salary-distribution should return histogram bins."""
    res = await client.get("/api/v1/analytics/salary-distribution")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "bucket" in data[0]
    assert "count" in data[0]


async def test_csv_export(client, sample_employees):
    """GET /api/v1/employees/export should return downloadable CSV."""
    res = await client.get("/api/v1/employees/export")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.text
    lines = content.strip().split("\n")
    # 1 header line + 4 employee lines
    assert len(lines) == 5
    assert "employee_id,first_name,last_name" in lines[0]
    assert "EMP-A001" in content


async def test_csv_import(client):
    """POST /api/v1/employees/import should parse and insert valid CSV rows."""
    csv_content = """employee_id,first_name,last_name,email,department,designation,country,city,gender,date_of_birth,date_of_joining,employment_type,status,base_salary,currency,salary_effective_date
EMP-CSV-01,Tara,King,tara.k@acme.org,HR,HR Partner,United Kingdom,London,Female,1992-04-10,2021-05-01,full-time,active,60000.0,GBP,2023-01-01
EMP-CSV-02,Neil,Armstrong,neil.a@acme.org,Operations,Logistics,United States,Houston,Male,1980-08-05,2015-09-01,full-time,active,85000.0,USD,2022-01-01
"""
    files = {"file": ("employees.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    res = await client.post("/api/v1/employees/import", files=files)
    assert res.status_code == 200
    result = res.json()
    assert result["imported"] == 2
    assert result["failed"] == 0

    # Verify they exist via API
    check = await client.get("/api/v1/employees?search=Tara")
    assert check.status_code == 200
    assert check.json()["total"] == 1
