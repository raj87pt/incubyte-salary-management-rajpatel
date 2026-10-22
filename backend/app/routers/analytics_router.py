"""FastAPI router for Salary and Headcount Analytics endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.analytics import (
    DashboardMetricsResponse,
    DepartmentStatResponse,
    CountryStatResponse,
    SalaryBucketResponse,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """Retrieve overarching compensation, headcount, and currency metrics."""
    return await AnalyticsService.get_dashboard_metrics(db)


@router.get("/departments", response_model=List[DepartmentStatResponse])
async def get_department_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve compensation breakdown grouped by department."""
    return await AnalyticsService.get_department_breakdown(db)


@router.get("/countries", response_model=List[CountryStatResponse])
async def get_country_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve compensation breakdown grouped by country."""
    return await AnalyticsService.get_country_breakdown(db)


@router.get("/salary-distribution", response_model=List[SalaryBucketResponse])
async def get_salary_distribution(db: AsyncSession = Depends(get_db)):
    """Retrieve salary histogram buckets normalized to base currency (USD)."""
    return await AnalyticsService.get_salary_distribution(db)
