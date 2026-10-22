"""CSV import and export service with validation and batch processing."""

import csv
import io
from datetime import datetime, date
from typing import List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.schemas.analytics import CSVImportResponse
from app.schemas.employee import EmployeeCreate, EmployeeFilter
from app.services.employee_service import EmployeeService


CSV_COLUMNS = [
    "employee_id",
    "first_name",
    "last_name",
    "email",
    "department",
    "designation",
    "country",
    "city",
    "gender",
    "date_of_birth",
    "date_of_joining",
    "employment_type",
    "status",
    "base_salary",
    "currency",
    "salary_effective_date",
]


class CSVService:
    """Handles bulk CSV export and validation-driven import."""

    @staticmethod
    async def export_employees(db: AsyncSession) -> str:
        """Export all employees to a CSV string."""
        query = select(Employee).order_by(Employee.employee_id.asc())
        result = await db.execute(query)
        employees = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(CSV_COLUMNS)

        for emp in employees:
            writer.writerow([
                emp.employee_id,
                emp.first_name,
                emp.last_name,
                emp.email,
                emp.department,
                emp.designation,
                emp.country,
                emp.city,
                emp.gender,
                emp.date_of_birth.isoformat() if emp.date_of_birth else "",
                emp.date_of_joining.isoformat() if emp.date_of_joining else "",
                emp.employment_type,
                emp.status,
                float(emp.base_salary),
                emp.currency,
                emp.salary_effective_date.isoformat() if emp.salary_effective_date else "",
            ])

        return output.getvalue()

    @staticmethod
    async def import_employees(db: AsyncSession, csv_content: str) -> CSVImportResponse:
        """Parse, validate, and bulk insert employees from CSV string."""
        input_stream = io.StringIO(csv_content.strip())
        reader = csv.DictReader(input_stream)

        imported = 0
        failed = 0
        errors: List[str] = []
        row_idx = 1

        for row in reader:
            row_idx += 1
            try:
                # Clean up whitespace
                clean_row = {k.strip(): v.strip() for k, v in row.items() if k}

                # Parse dates
                dob = datetime.strptime(clean_row["date_of_birth"], "%Y-%m-%d").date()
                doj = datetime.strptime(clean_row["date_of_joining"], "%Y-%m-%d").date()
                eff = datetime.strptime(clean_row["salary_effective_date"], "%Y-%m-%d").date()

                payload = EmployeeCreate(
                    employee_id=clean_row["employee_id"],
                    first_name=clean_row["first_name"],
                    last_name=clean_row["last_name"],
                    email=clean_row["email"],
                    department=clean_row["department"],
                    designation=clean_row["designation"],
                    country=clean_row["country"],
                    city=clean_row["city"],
                    gender=clean_row.get("gender", "Other"),
                    date_of_birth=dob,
                    date_of_joining=doj,
                    employment_type=clean_row.get("employment_type", "full-time"),
                    status=clean_row.get("status", "active"),
                    base_salary=float(clean_row["base_salary"]),
                    currency=clean_row.get("currency", "USD"),
                    salary_effective_date=eff,
                )

                # Check for duplicate
                existing = await EmployeeService.get_employee_by_emp_id(db, payload.employee_id)
                if existing:
                    failed += 1
                    errors.append(f"Row {row_idx}: Employee ID '{payload.employee_id}' already exists")
                    continue

                await EmployeeService.create_employee(db, payload)
                imported += 1

            except Exception as e:
                failed += 1
                errors.append(f"Row {row_idx}: {str(e)}")

        return CSVImportResponse(
            total_rows=imported + failed,
            imported=imported,
            failed=failed,
            errors=errors[:50],  # Return up to 50 errors
        )
