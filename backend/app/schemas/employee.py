"""Pydantic schemas for Employee and associated records validation and serialization."""

from datetime import date, datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, EmailStr, Field, ConfigDict, computed_field

from app.utils.currency import convert_to_base_currency

T = TypeVar("T")


class SalaryRevisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    old_salary: float
    new_salary: float
    currency: str
    effective_date: date
    reason: Optional[str] = None
    created_at: datetime


class PayrollRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    month: int
    year: int
    gross_salary: float
    deductions: float
    net_salary: float
    currency: str
    payment_date: date
    payment_method: str
    status: str
    created_at: datetime


class BonusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    amount: float
    currency: str
    bonus_type: str
    date_awarded: date
    reason: Optional[str] = None
    created_at: datetime


class LeaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    leave_type: str
    start_date: date
    end_date: date
    days: int
    status: str
    created_at: datetime


class ReimbursementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    amount: float
    currency: str
    category: str
    date_submitted: date
    status: str
    created_at: datetime


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=2, max_length=30)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)
    designation: str = Field(..., min_length=1, max_length=150)
    country: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    gender: str = Field(default="Other")
    date_of_birth: date
    date_of_joining: date
    employment_type: str = Field(default="full-time")
    status: str = Field(default="active")
    manager_id: Optional[str] = None
    base_salary: float = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    salary_effective_date: date


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    date_of_joining: Optional[date] = None
    employment_type: Optional[str] = None
    status: Optional[str] = None
    manager_id: Optional[str] = None
    base_salary: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    salary_effective_date: Optional[date] = None
    salary_revision_reason: Optional[str] = None  # Reason if salary changes


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    first_name: str
    last_name: str
    email: str
    department: str
    designation: str
    country: str
    city: str
    gender: str
    date_of_birth: date
    date_of_joining: date
    employment_type: str
    status: str
    manager_id: Optional[str] = None
    base_salary: float
    currency: str
    salary_effective_date: date
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @computed_field
    @property
    def base_salary_usd(self) -> float:
        return convert_to_base_currency(self.base_salary, self.currency)


class EmployeeDetailResponse(EmployeeResponse):
    salary_revisions: List[SalaryRevisionResponse] = []
    payroll_records: List[PayrollRecordResponse] = []
    bonuses: List[BonusResponse] = []
    leaves: List[LeaveResponse] = []
    reimbursements: List[ReimbursementResponse] = []


class EmployeeFilter(BaseModel):
    search: Optional[str] = None
    department: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    employment_type: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: Optional[str] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"  # asc or desc
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
