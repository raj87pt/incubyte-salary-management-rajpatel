"""Employee business logic service handling CRUD, revisions, filtering, and pagination."""

from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import (
    Employee,
    SalaryRevision,
    PayrollRecord,
    Bonus,
    Leave,
    Reimbursement,
)
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeFilter


class EmployeeService:
    """Service handling all employee and salary audit domain operations."""

    @staticmethod
    async def create_employee(db: AsyncSession, payload: EmployeeCreate) -> Employee:
        """Create a new employee record."""
        employee_data = payload.model_dump()
        employee = Employee(**employee_data)
        db.add(employee)
        await db.flush()
        await db.refresh(employee)
        return employee

    @staticmethod
    async def get_employee_by_id(
        db: AsyncSession, employee_id: str, load_details: bool = False
    ) -> Optional[Employee]:
        """Fetch employee by UUID primary key, optionally including related records."""
        query = select(Employee).where(Employee.id == employee_id)
        if load_details:
            query = query.options(
                selectinload(Employee.salary_revisions),
                selectinload(Employee.payroll_records),
                selectinload(Employee.bonuses),
                selectinload(Employee.leaves),
                selectinload(Employee.reimbursements),
            )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_employee_by_emp_id(
        db: AsyncSession, employee_id: str
    ) -> Optional[Employee]:
        """Fetch employee by business EMP code (e.g., EMP-0001)."""
        query = select(Employee).where(Employee.employee_id == employee_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_employee(
        db: AsyncSession, employee_id: str, payload: EmployeeUpdate
    ) -> Optional[Employee]:
        """Update an employee.

        If base_salary changes, automatically record a SalaryRevision audit entry.
        """
        employee = await EmployeeService.get_employee_by_id(db, employee_id)
        if not employee:
            return None

        update_dict = payload.model_dump(exclude_unset=True)
        salary_revision_reason = update_dict.pop("salary_revision_reason", None)

        # Check if salary is being revised
        new_salary = update_dict.get("base_salary")
        if new_salary is not None and float(new_salary) != float(employee.base_salary):
            revision = SalaryRevision(
                employee_id=employee.id,
                old_salary=employee.base_salary,
                new_salary=new_salary,
                currency=update_dict.get("currency") or employee.currency,
                effective_date=update_dict.get("salary_effective_date") or date.today(),
                reason=salary_revision_reason or "Salary revision",
            )
            db.add(revision)

        for key, value in update_dict.items():
            setattr(employee, key, value)

        await db.flush()
        await db.refresh(employee)
        return employee

    @staticmethod
    async def delete_employee(db: AsyncSession, employee_id: str) -> bool:
        """Delete an employee and cascade delete all child records."""
        employee = await EmployeeService.get_employee_by_id(db, employee_id)
        if not employee:
            return False
        await db.delete(employee)
        await db.flush()
        return True

    @staticmethod
    async def get_salary_revisions(
        db: AsyncSession, employee_id: str
    ) -> List[SalaryRevision]:
        """Retrieve audit history of salary revisions for an employee."""
        query = (
            select(SalaryRevision)
            .where(SalaryRevision.employee_id == employee_id)
            .order_by(desc(SalaryRevision.effective_date))
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def list_employees(
        db: AsyncSession, filters: EmployeeFilter
    ) -> Tuple[List[Employee], int]:
        """Filter, sort, search, and paginate employees."""
        query = select(Employee)
        count_query = select(func.count()).select_from(Employee)

        # Search query across full name, email, employee_id
        if filters.search:
            search_pattern = f"%{filters.search.strip()}%"
            search_cond = or_(
                Employee.first_name.ilike(search_pattern),
                Employee.last_name.ilike(search_pattern),
                Employee.email.ilike(search_pattern),
                Employee.employee_id.ilike(search_pattern),
                Employee.designation.ilike(search_pattern),
            )
            query = query.where(search_cond)
            count_query = count_query.where(search_cond)

        # Filters
        if filters.department:
            query = query.where(Employee.department == filters.department)
            count_query = count_query.where(Employee.department == filters.department)

        if filters.country:
            query = query.where(Employee.country == filters.country)
            count_query = count_query.where(Employee.country == filters.country)

        if filters.status:
            query = query.where(Employee.status == filters.status)
            count_query = count_query.where(Employee.status == filters.status)

        if filters.employment_type:
            query = query.where(Employee.employment_type == filters.employment_type)
            count_query = count_query.where(Employee.employment_type == filters.employment_type)

        if filters.currency:
            query = query.where(Employee.currency == filters.currency)
            count_query = count_query.where(Employee.currency == filters.currency)

        if filters.min_salary is not None:
            query = query.where(Employee.base_salary >= filters.min_salary)
            count_query = count_query.where(Employee.base_salary >= filters.min_salary)

        if filters.max_salary is not None:
            query = query.where(Employee.base_salary <= filters.max_salary)
            count_query = count_query.where(Employee.base_salary <= filters.max_salary)

        # Total count execution
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Sorting
        sort_column_map = {
            "first_name": Employee.first_name,
            "last_name": Employee.last_name,
            "employee_id": Employee.employee_id,
            "department": Employee.department,
            "country": Employee.country,
            "base_salary": Employee.base_salary,
            "date_of_joining": Employee.date_of_joining,
            "created_at": Employee.created_at,
        }
        sort_attr = sort_column_map.get(filters.sort_by, Employee.created_at)
        if filters.sort_order.lower() == "asc":
            query = query.order_by(asc(sort_attr))
        else:
            query = query.order_by(desc(sort_attr))

        # Pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)

        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total
