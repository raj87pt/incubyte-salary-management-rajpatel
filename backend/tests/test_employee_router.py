"""Integration tests for Employee API routes."""

import pytest
from datetime import date


async def test_create_and_get_employee_via_api(client):
    """POST /api/v1/employees should create employee and return 201."""
    payload = {
        "employee_id": "EMP-9001",
        "first_name": "Sophia",
        "last_name": "Chen",
        "email": "sophia.chen@acme.org",
        "department": "Engineering",
        "designation": "Staff Engineer",
        "country": "Singapore",
        "city": "Singapore",
        "gender": "Female",
        "date_of_birth": "1992-03-14",
        "date_of_joining": "2021-06-01",
        "employment_type": "full-time",
        "status": "active",
        "base_salary": 160000.0,
        "currency": "SGD",
        "salary_effective_date": "2023-01-01",
    }

    create_res = await client.post("/api/v1/employees", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["id"] is not None
    assert created["employee_id"] == "EMP-9001"
    assert created["full_name"] == "Sophia Chen"
    # Check normalized USD calculation
    assert created["base_salary_usd"] == round(160000.0 * 0.75, 2)

    emp_uuid = created["id"]
    get_res = await client.get(f"/api/v1/employees/{emp_uuid}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == emp_uuid
    assert fetched["email"] == "sophia.chen@acme.org"


async def test_update_employee_salary_and_get_history_via_api(client):
    """PUT /api/v1/employees/{id} should update employee and log revision."""
    payload = {
        "employee_id": "EMP-9002",
        "first_name": "Liam",
        "last_name": "O'Connor",
        "email": "liam@acme.org",
        "department": "Sales",
        "designation": "Account Executive",
        "country": "Ireland",
        "city": "Dublin",
        "gender": "Male",
        "date_of_birth": "1994-09-10",
        "date_of_joining": "2022-01-15",
        "employment_type": "full-time",
        "status": "active",
        "base_salary": 65000.0,
        "currency": "EUR",
        "salary_effective_date": "2022-01-15",
    }
    create_res = await client.post("/api/v1/employees", json=payload)
    emp_uuid = create_res.json()["id"]

    # Update salary
    update_payload = {
        "base_salary": 75000.0,
        "salary_effective_date": "2024-01-01",
        "salary_revision_reason": "Promoted to Senior AE",
    }
    update_res = await client.put(f"/api/v1/employees/{emp_uuid}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["base_salary"] == 75000.0

    # Fetch salary history
    history_res = await client.get(f"/api/v1/employees/{emp_uuid}/salary-history")
    assert history_res.status_code == 200
    revisions = history_res.json()
    assert len(revisions) == 1
    assert revisions[0]["old_salary"] == 65000.0
    assert revisions[0]["new_salary"] == 75000.0
    assert revisions[0]["reason"] == "Promoted to Senior AE"


async def test_delete_employee_via_api(client):
    """DELETE /api/v1/employees/{id} should delete employee and return 204."""
    payload = {
        "employee_id": "EMP-9003",
        "first_name": "Marcus",
        "last_name": "Vance",
        "email": "marcus@acme.org",
        "department": "Support",
        "designation": "Support Engineer",
        "country": "United States",
        "city": "Denver",
        "gender": "Male",
        "date_of_birth": "1996-02-18",
        "date_of_joining": "2023-03-01",
        "employment_type": "full-time",
        "status": "active",
        "base_salary": 55000.0,
        "currency": "USD",
        "salary_effective_date": "2023-03-01",
    }
    create_res = await client.post("/api/v1/employees", json=payload)
    emp_uuid = create_res.json()["id"]

    del_res = await client.delete(f"/api/v1/employees/{emp_uuid}")
    assert del_res.status_code == 204

    # Verify 404 on fetch
    get_res = await client.get(f"/api/v1/employees/{emp_uuid}")
    assert get_res.status_code == 404


async def test_list_employees_pagination_via_api(client):
    """GET /api/v1/employees should support pagination and search."""
    # Create 2 employees
    for i in range(2):
        await client.post(
            "/api/v1/employees",
            json={
                "employee_id": f"EMP-PAGE-{i}",
                "first_name": f"User{i}",
                "last_name": "Test",
                "email": f"user{i}.test@acme.org",
                "department": "Finance",
                "designation": "Analyst",
                "country": "United States",
                "city": "New York",
                "gender": "Other",
                "date_of_birth": "1990-01-01",
                "date_of_joining": "2022-01-01",
                "employment_type": "full-time",
                "status": "active",
                "base_salary": 80000.0 + (i * 10000),
                "currency": "USD",
                "salary_effective_date": "2022-01-01",
            },
        )

    res = await client.get("/api/v1/employees?department=Finance&page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 10
