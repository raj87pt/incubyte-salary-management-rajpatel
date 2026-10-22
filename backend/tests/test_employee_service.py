"""Tests for Employee service (CRUD, search, filtering, pagination)."""

import pytest
from datetime import date
from uuid import uuid4

from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeFilter
from app.services.employee_service import EmployeeService


async def test_create_employee(db_session):
    """Test creating a new employee with valid payload."""
    payload = EmployeeCreate(
        employee_id="EMP-0001",
        first_name="Jane",
        last_name="Doe",
        email="jane.doe@acme.org",
        department="Engineering",
        designation="Senior Software Engineer",
        country="United States",
        city="San Francisco",
        gender="Female",
        date_of_birth=date(1990, 5, 15),
        date_of_joining=date(2020, 1, 10),
        employment_type="full-time",
        status="active",
        base_salary=145000.00,
        currency="USD",
        salary_effective_date=date(2023, 1, 1),
    )

    employee = await EmployeeService.create_employee(db_session, payload)

    assert employee.id is not None
    assert employee.employee_id == "EMP-0001"
    assert employee.first_name == "Jane"
    assert employee.last_name == "Doe"
    assert employee.email == "jane.doe@acme.org"
    assert employee.department == "Engineering"
    assert float(employee.base_salary) == 145000.00
    assert employee.currency == "USD"


async def test_get_employee_by_id(db_session):
    """Test fetching an existing employee by UUID."""
    payload = EmployeeCreate(
        employee_id="EMP-0002",
        first_name="John",
        last_name="Smith",
        email="john.smith@acme.org",
        department="Product",
        designation="Product Manager",
        country="United Kingdom",
        city="London",
        gender="Male",
        date_of_birth=date(1988, 8, 20),
        date_of_joining=date(2019, 3, 1),
        employment_type="full-time",
        status="active",
        base_salary=95000.00,
        currency="GBP",
        salary_effective_date=date(2023, 4, 1),
    )
    created = await EmployeeService.create_employee(db_session, payload)

    fetched = await EmployeeService.get_employee_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.employee_id == "EMP-0002"


async def test_update_employee_and_track_salary_revision(db_session):
    """Test updating employee salary automatically logs a salary revision."""
    payload = EmployeeCreate(
        employee_id="EMP-0003",
        first_name="Alice",
        last_name="Wong",
        email="alice.wong@acme.org",
        department="Design",
        designation="Product Designer",
        country="Canada",
        city="Toronto",
        gender="Female",
        date_of_birth=date(1992, 11, 5),
        date_of_joining=date(2021, 6, 15),
        employment_type="full-time",
        status="active",
        base_salary=80000.00,
        currency="CAD",
        salary_effective_date=date(2022, 1, 1),
    )
    created = await EmployeeService.create_employee(db_session, payload)

    # Update salary
    update_payload = EmployeeUpdate(
        base_salary=92000.00,
        salary_effective_date=date(2024, 1, 1),
        salary_revision_reason="Annual merit increase",
    )
    updated = await EmployeeService.update_employee(db_session, created.id, update_payload)

    assert float(updated.base_salary) == 92000.00
    
    # Check that a salary revision record was created
    revisions = await EmployeeService.get_salary_revisions(db_session, created.id)
    assert len(revisions) == 1
    assert float(revisions[0].old_salary) == 80000.00
    assert float(revisions[0].new_salary) == 92000.00
    assert revisions[0].reason == "Annual merit increase"


async def test_delete_employee(db_session):
    """Test deleting an employee."""
    payload = EmployeeCreate(
        employee_id="EMP-0004",
        first_name="Bob",
        last_name="Taylor",
        email="bob.taylor@acme.org",
        department="HR",
        designation="HR Specialist",
        country="United States",
        city="Austin",
        gender="Male",
        date_of_birth=date(1995, 2, 10),
        date_of_joining=date(2022, 8, 1),
        employment_type="full-time",
        status="active",
        base_salary=70000.00,
        currency="USD",
        salary_effective_date=date(2022, 8, 1),
    )
    created = await EmployeeService.create_employee(db_session, payload)

    success = await EmployeeService.delete_employee(db_session, created.id)
    assert success is True

    fetched = await EmployeeService.get_employee_by_id(db_session, created.id)
    assert fetched is None


async def test_list_employees_pagination_and_filtering(db_session):
    """Test listing employees with search, department filter, and pagination."""
    # Seed 3 employees in different departments and countries
    emps = [
        EmployeeCreate(
            employee_id="EMP-1001",
            first_name="Devin",
            last_name="Archer",
            email="devin@acme.org",
            department="Engineering",
            designation="DevOps Engineer",
            country="Germany",
            city="Berlin",
            gender="Male",
            date_of_birth=date(1991, 4, 12),
            date_of_joining=date(2021, 2, 1),
            employment_type="full-time",
            status="active",
            base_salary=85000.00,
            currency="EUR",
            salary_effective_date=date(2021, 2, 1),
        ),
        EmployeeCreate(
            employee_id="EMP-1002",
            first_name="Elena",
            last_name="Rostova",
            email="elena@acme.org",
            department="Engineering",
            designation="Frontend Lead",
            country="Germany",
            city="Munich",
            gender="Female",
            date_of_birth=date(1989, 7, 23),
            date_of_joining=date(2018, 5, 10),
            employment_type="full-time",
            status="active",
            base_salary=95000.00,
            currency="EUR",
            salary_effective_date=date(2022, 1, 1),
        ),
        EmployeeCreate(
            employee_id="EMP-1003",
            first_name="Carlos",
            last_name="Mendez",
            email="carlos@acme.org",
            department="Marketing",
            designation="Growth Lead",
            country="Spain",
            city="Madrid",
            gender="Male",
            date_of_birth=date(1993, 10, 30),
            date_of_joining=date(2020, 9, 1),
            employment_type="full-time",
            status="active",
            base_salary=65000.00,
            currency="EUR",
            salary_effective_date=date(2020, 9, 1),
        ),
    ]
    for emp in emps:
        await EmployeeService.create_employee(db_session, emp)

    # Filter by department Engineering
    filter_eng = EmployeeFilter(department="Engineering", page=1, page_size=10)
    items, total = await EmployeeService.list_employees(db_session, filter_eng)
    assert total == 2
    assert all(item.department == "Engineering" for item in items)

    # Search by name query "carlos"
    filter_search = EmployeeFilter(search="carlos", page=1, page_size=10)
    items, total = await EmployeeService.list_employees(db_session, filter_search)
    assert total == 1
    assert items[0].first_name == "Carlos"

    # Pagination test (page_size = 1)
    filter_page = EmployeeFilter(page=1, page_size=1)
    items, total = await EmployeeService.list_employees(db_session, filter_page)
    assert total == 3
    assert len(items) == 1
