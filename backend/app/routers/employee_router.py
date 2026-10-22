"""FastAPI router for Employee management endpoints."""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.analytics import CSVImportResponse
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeDetailResponse,
    EmployeeFilter,
    PaginatedResponse,
    SalaryRevisionResponse,
    PayrollRecordResponse,
    BonusResponse,
    LeaveResponse,
    ReimbursementResponse,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/api/v1/employees", tags=["Employees"])


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
async def list_employees(
    search: Optional[str] = Query(None, description="Search term for name, email, employee ID"),
    department: Optional[str] = Query(None, description="Filter by department"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status (active/inactive)"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    min_salary: Optional[float] = Query(None, description="Minimum base salary"),
    max_salary: Optional[float] = Query(None, description="Maximum base salary"),
    currency: Optional[str] = Query(None, description="Filter by currency"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a paginated list of employees matching specified criteria."""
    filters = EmployeeFilter(
        search=search,
        department=department,
        country=country,
        status=status,
        employment_type=employment_type,
        min_salary=min_salary,
        max_salary=max_salary,
        currency=currency,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    items, total = await EmployeeService.list_employees(db, filters)
    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return PaginatedResponse(
        items=[EmployeeResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/export")
async def export_employees_csv(db: AsyncSession = Depends(get_db)):
    """Export all employees to a CSV file."""
    from fastapi.responses import Response
    from app.services.csv_service import CSVService

    csv_data = await CSVService.export_employees(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees.csv"},
    )


@router.post("/import", response_model=CSVImportResponse)
async def import_employees_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Import employees from an uploaded CSV file."""
    from app.services.csv_service import CSVService

    contents = await file.read()
    csv_text = contents.decode("utf-8")
    result = await CSVService.import_employees(db, csv_text)
    return result


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new employee record."""
    # Check if employee_id already exists
    existing = await EmployeeService.get_employee_by_emp_id(db, payload.employee_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{payload.employee_id}' already exists",
        )
    created = await EmployeeService.create_employee(db, payload)
    return EmployeeResponse.model_validate(created)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get employee by UUID."""
    employee = await EmployeeService.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    return EmployeeResponse.model_validate(employee)


@router.get("/{employee_id}/details", response_model=EmployeeDetailResponse)
async def get_employee_details(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed employee information including salary revisions, payroll, bonuses, and leaves."""
    employee = await EmployeeService.get_employee_by_id(db, employee_id, load_details=True)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    return EmployeeDetailResponse.model_validate(employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update employee details.

    If base salary changes, a historical salary revision audit record is logged.
    """
    updated = await EmployeeService.update_employee(db, employee_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    return EmployeeResponse.model_validate(updated)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete employee and cascading records."""
    success = await EmployeeService.delete_employee(db, employee_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    return None


@router.get("/{employee_id}/salary-history", response_model=List[SalaryRevisionResponse])
async def get_salary_history(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all past salary revisions for an employee."""
    employee = await EmployeeService.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )
    revisions = await EmployeeService.get_salary_revisions(db, employee_id)
    return [SalaryRevisionResponse.model_validate(r) for r in revisions]
