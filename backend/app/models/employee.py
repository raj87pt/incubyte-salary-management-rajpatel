"""SQLAlchemy ORM models for Employee and related salary records."""

from datetime import date, datetime, timezone
import uuid
from typing import Optional, List

from sqlalchemy import (
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Employee(Base):
    """Core Employee entity."""

    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    department: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    designation: Mapped[str] = mapped_column(String(150), nullable=False)
    country: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    date_of_joining: Mapped[date] = mapped_column(Date, nullable=False)
    employment_type: Mapped[str] = mapped_column(String(30), default="full-time", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True, nullable=False)
    manager_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    # Salary information
    base_salary: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    salary_effective_date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    manager: Mapped[Optional["Employee"]] = relationship("Employee", remote_side=[id], backref="direct_reports")
    salary_revisions: Mapped[List["SalaryRevision"]] = relationship("SalaryRevision", back_populates="employee", cascade="all, delete-orphan", order_by="desc(SalaryRevision.effective_date)")
    payroll_records: Mapped[List["PayrollRecord"]] = relationship("PayrollRecord", back_populates="employee", cascade="all, delete-orphan", order_by="desc(PayrollRecord.year), desc(PayrollRecord.month)")
    bonuses: Mapped[List["Bonus"]] = relationship("Bonus", back_populates="employee", cascade="all, delete-orphan", order_by="desc(Bonus.date_awarded)")
    leaves: Mapped[List["Leave"]] = relationship("Leave", back_populates="employee", cascade="all, delete-orphan", order_by="desc(Leave.start_date)")
    reimbursements: Mapped[List["Reimbursement"]] = relationship("Reimbursement", back_populates="employee", cascade="all, delete-orphan", order_by="desc(Reimbursement.date_submitted)")

    __table_args__ = (
        Index("ix_emp_dept_country", "department", "country"),
        Index("ix_emp_status_dept", "status", "department"),
    )


class SalaryRevision(Base):
    """Audit log of historical salary changes for an employee."""

    __tablename__ = "salary_revisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    old_salary: Mapped[float] = mapped_column(Float, nullable=False)
    new_salary: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="salary_revisions")


class PayrollRecord(Base):
    """Monthly payroll summary for an employee (read-only in UI)."""

    __tablename__ = "payroll_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    gross_salary: Mapped[float] = mapped_column(Float, nullable=False)
    deductions: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_salary: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="bank_transfer", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="paid", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="payroll_records")

    __table_args__ = (
        Index("ix_payroll_emp_year_month", "employee_id", "year", "month"),
    )


class Bonus(Base):
    """Bonus awarded to an employee (read-only in UI)."""

    __tablename__ = "bonuses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    bonus_type: Mapped[str] = mapped_column(String(50), nullable=False)  # performance, annual, spot, referral
    date_awarded: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="bonuses")


class Leave(Base):
    """Leave record for an employee (read-only in UI)."""

    __tablename__ = "leaves"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)  # annual, sick, maternity, unpaid
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    days: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="approved", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="leaves")


class Reimbursement(Base):
    """Expense reimbursement claim for an employee (read-only in UI)."""

    __tablename__ = "reimbursements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), index=True, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # travel, equipment, wellness, meal
    date_submitted: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="approved", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="reimbursements")
