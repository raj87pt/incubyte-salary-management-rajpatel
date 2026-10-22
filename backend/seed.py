"""High-performance seed script to generate 10,000 realistic employee records with salary data.

Generates:
- 10,000 employees across 10 global countries and 8 departments
- Realistic local currencies and salary distributions
- Historical salary revisions for ~2,500 employees
- Monthly payroll records, bonuses, leaves, and reimbursements
- Fast batch insertion into SQLite via async SQLAlchemy
"""

import asyncio
import random
import sys
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import List, Dict, Any

from faker import Faker
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory, engine, Base
from app.models.employee import (
    Employee,
    SalaryRevision,
    PayrollRecord,
    Bonus,
    Leave,
    Reimbursement,
)

fake = Faker()
Faker.seed(42)
random.seed(42)

TOTAL_EMPLOYEES = 10000
BATCH_SIZE = 1000

COUNTRIES_DATA = [
    {
        "country": "United States",
        "currency": "USD",
        "cities": ["San Francisco", "New York", "Seattle", "Austin", "Chicago", "Boston"],
        "min_salary": 60000,
        "max_salary": 260000,
        "weight": 35,
    },
    {
        "country": "United Kingdom",
        "currency": "GBP",
        "cities": ["London", "Manchester", "Edinburgh", "Bristol", "Cambridge"],
        "min_salary": 45000,
        "max_salary": 160000,
        "weight": 15,
    },
    {
        "country": "Germany",
        "currency": "EUR",
        "cities": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne"],
        "min_salary": 50000,
        "max_salary": 170000,
        "weight": 12,
    },
    {
        "country": "India",
        "currency": "INR",
        "cities": ["Bengaluru", "Hyderabad", "Pune", "Delhi", "Mumbai"],
        "min_salary": 800000,
        "max_salary": 4500000,
        "weight": 15,
    },
    {
        "country": "Canada",
        "currency": "CAD",
        "cities": ["Toronto", "Vancouver", "Montreal", "Ottawa"],
        "min_salary": 65000,
        "max_salary": 190000,
        "weight": 8,
    },
    {
        "country": "France",
        "currency": "EUR",
        "cities": ["Paris", "Lyon", "Marseille", "Toulouse"],
        "min_salary": 45000,
        "max_salary": 150000,
        "weight": 5,
    },
    {
        "country": "Singapore",
        "currency": "SGD",
        "cities": ["Singapore"],
        "min_salary": 70000,
        "max_salary": 230000,
        "weight": 4,
    },
    {
        "country": "Australia",
        "currency": "AUD",
        "cities": ["Sydney", "Melbourne", "Brisbane", "Perth"],
        "min_salary": 75000,
        "max_salary": 220000,
        "weight": 3,
    },
    {
        "country": "Switzerland",
        "currency": "CHF",
        "cities": ["Zurich", "Geneva", "Basel", "Bern"],
        "min_salary": 90000,
        "max_salary": 260000,
        "weight": 2,
    },
    {
        "country": "Japan",
        "currency": "JPY",
        "cities": ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
        "min_salary": 5500000,
        "max_salary": 18000000,
        "weight": 1,
    },
]

DEPARTMENTS = [
    {
        "name": "Engineering",
        "roles": [
            "Software Engineer",
            "Senior Software Engineer",
            "Staff Engineer",
            "Principal Engineer",
            "Engineering Manager",
            "DevOps Engineer",
            "QA Automation Engineer",
            "Data Engineer",
            "Security Engineer",
        ],
        "weight": 35,
    },
    {
        "name": "Product",
        "roles": [
            "Associate Product Manager",
            "Product Manager",
            "Senior Product Manager",
            "VP of Product",
            "Product Operations Lead",
        ],
        "weight": 10,
    },
    {
        "name": "Design",
        "roles": [
            "UI/UX Designer",
            "Product Designer",
            "Senior Product Designer",
            "Design Lead",
            "Brand Designer",
        ],
        "weight": 8,
    },
    {
        "name": "Sales",
        "roles": [
            "Business Development Rep",
            "Account Executive",
            "Senior Account Executive",
            "Enterprise Account Director",
            "Sales Manager",
        ],
        "weight": 15,
    },
    {
        "name": "Marketing",
        "roles": [
            "Content Specialist",
            "Growth Marketing Manager",
            "Product Marketing Manager",
            "Head of Marketing",
            "SEO Manager",
        ],
        "weight": 10,
    },
    {
        "name": "Customer Support",
        "roles": [
            "Support Specialist",
            "Customer Success Manager",
            "Senior CSM",
            "Technical Support Engineer",
            "Support Lead",
        ],
        "weight": 10,
    },
    {
        "name": "Human Resources",
        "roles": [
            "HR Specialist",
            "Talent Acquisition Partner",
            "HR Business Partner",
            "People Ops Manager",
            "Compensation Analyst",
        ],
        "weight": 6,
    },
    {
        "name": "Finance & Legal",
        "roles": [
            "Financial Analyst",
            "Senior Accountant",
            "Controller",
            "Legal Counsel",
            "Finance Director",
        ],
        "weight": 6,
    },
]

GENDERS = ["Female", "Male", "Non-binary", "Other"]
GENDER_WEIGHTS = [46, 48, 4, 2]

EMPLOYMENT_TYPES = ["full-time", "part-time", "contract"]
EMP_TYPE_WEIGHTS = [90, 6, 4]

STATUSES = ["active", "inactive"]
STATUS_WEIGHTS = [94, 6]


def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]


async def seed_data(total_count: int = TOTAL_EMPLOYEES):
    print(f"\n🌱 Starting seed process for {total_count:,} employees...")
    start_time = time.time()

    # Re-create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    dept_items = DEPARTMENTS
    dept_weights = [d["weight"] for d in dept_items]

    country_items = COUNTRIES_DATA
    country_weights = [c["weight"] for c in country_items]

    all_employee_records: List[Dict[str, Any]] = []
    all_revisions: List[Dict[str, Any]] = []
    all_payrolls: List[Dict[str, Any]] = []
    all_bonuses: List[Dict[str, Any]] = []
    all_leaves: List[Dict[str, Any]] = []
    all_reimbursements: List[Dict[str, Any]] = []

    now_utc = datetime.now(timezone.utc)
    used_emails = set()

    print("⚡ Generating data in memory...")
    for i in range(1, total_count + 1):
        emp_uuid = str(uuid.uuid4())
        emp_code = f"EMP-{i:05d}"

        first_name = fake.first_name()
        last_name = fake.last_name()
        
        # Ensure unique email
        email_base = f"{first_name.lower()}.{last_name.lower()}"
        email = f"{email_base}{i}@acme.org"

        c_info = weighted_choice(country_items, country_weights)
        d_info = weighted_choice(dept_items, dept_weights)

        country = c_info["country"]
        city = random.choice(c_info["cities"])
        currency = c_info["currency"]
        department = d_info["name"]
        designation = random.choice(d_info["roles"])

        gender = weighted_choice(GENDERS, GENDER_WEIGHTS)
        emp_type = weighted_choice(EMPLOYMENT_TYPES, EMP_TYPE_WEIGHTS)
        status = weighted_choice(STATUSES, STATUS_WEIGHTS)

        # Dates
        age_years = random.randint(22, 62)
        dob = date.today() - timedelta(days=age_years * 365 + random.randint(0, 360))
        
        tenure_days = random.randint(30, 365 * 8)
        doj = date.today() - timedelta(days=tenure_days)

        # Salary calculation based on country scale and role seniority
        base_range = c_info["max_salary"] - c_info["min_salary"]
        seniority_boost = 1.0
        if "Senior" in designation or "Manager" in designation:
            seniority_boost = 1.3
        elif "Lead" in designation or "Director" in designation or "Principal" in designation or "Staff" in designation:
            seniority_boost = 1.6
        elif "VP" in designation:
            seniority_boost = 2.0

        raw_salary = c_info["min_salary"] + (random.random() * base_range * 0.7)
        final_salary = round(raw_salary * seniority_boost, -2)
        salary_eff_date = doj + timedelta(days=random.randint(0, min(365, tenure_days)))

        all_employee_records.append({
            "id": emp_uuid,
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "department": department,
            "designation": designation,
            "country": country,
            "city": city,
            "gender": gender,
            "date_of_birth": dob,
            "date_of_joining": doj,
            "employment_type": emp_type,
            "status": status,
            "manager_id": None,
            "base_salary": final_salary,
            "currency": currency,
            "salary_effective_date": salary_eff_date,
            "created_at": now_utc,
            "updated_at": now_utc,
        })

        # Add historical salary revisions for 25% of employees with tenure > 1 year
        if tenure_days > 400 and random.random() < 0.28:
            old_salary = round(final_salary * random.uniform(0.80, 0.92), -2)
            all_revisions.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "old_salary": old_salary,
                "new_salary": final_salary,
                "currency": currency,
                "effective_date": salary_eff_date,
                "reason": random.choice(["Annual performance increase", "Promotion merit increase", "Market compensation adjustment"]),
                "created_at": now_utc,
            })

        # Add payroll records for a subset of 3,000 employees (2 months of pay)
        if i <= 3000 and status == "active":
            monthly_gross = round(final_salary / 12, 2)
            deductions = round(monthly_gross * random.uniform(0.18, 0.28), 2)
            net = round(monthly_gross - deductions, 2)
            
            all_payrolls.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "month": 8,
                "year": 2026,
                "gross_salary": monthly_gross,
                "deductions": deductions,
                "net_salary": net,
                "currency": currency,
                "payment_date": date(2026, 8, 31),
                "payment_method": "bank_transfer",
                "status": "paid",
                "created_at": now_utc,
            })
            all_payrolls.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "month": 9,
                "year": 2026,
                "gross_salary": monthly_gross,
                "deductions": deductions,
                "net_salary": net,
                "currency": currency,
                "payment_date": date(2026, 9, 30),
                "payment_method": "bank_transfer",
                "status": "paid",
                "created_at": now_utc,
            })

        # Add bonuses for 15% of employees
        if random.random() < 0.15:
            all_bonuses.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "amount": round(final_salary * random.uniform(0.05, 0.15), -2),
                "currency": currency,
                "bonus_type": random.choice(["annual", "performance", "spot"]),
                "date_awarded": date(2026, 6, 15),
                "reason": "Outstanding contribution to Q2 org objectives",
                "created_at": now_utc,
            })

        # Add leave records for 20% of employees
        if random.random() < 0.20:
            leave_days = random.randint(1, 10)
            start_d = date(2026, 7, random.randint(1, 20))
            all_leaves.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "leave_type": random.choice(["annual", "sick", "unpaid"]),
                "start_date": start_d,
                "end_date": start_d + timedelta(days=leave_days),
                "days": leave_days,
                "status": "approved",
                "created_at": now_utc,
            })

        # Add reimbursements for 10% of employees
        if random.random() < 0.10:
            all_reimbursements.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "amount": round(random.uniform(50, 800), 2),
                "currency": currency,
                "category": random.choice(["travel", "equipment", "wellness", "meal"]),
                "date_submitted": date(2026, 8, 12),
                "status": "approved",
                "created_at": now_utc,
            })

    print(f"📦 Inserting {len(all_employee_records):,} employees in batches of {BATCH_SIZE}...")
    async with async_session_factory() as session:
        # Batch insert employees
        for idx in range(0, len(all_employee_records), BATCH_SIZE):
            chunk = all_employee_records[idx : idx + BATCH_SIZE]
            await session.run_sync(
                lambda s, c=chunk: s.bulk_insert_mappings(Employee, c)
            )
            print(f"   ✓ Inserted {min(idx + BATCH_SIZE, len(all_employee_records)):,} / {len(all_employee_records):,} employees")

        await session.commit()

        # Batch insert supporting records
        if all_revisions:
            print(f"📦 Inserting {len(all_revisions):,} salary revision history records...")
            for idx in range(0, len(all_revisions), BATCH_SIZE):
                chunk = all_revisions[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(SalaryRevision, c))
            await session.commit()

        if all_payrolls:
            print(f"📦 Inserting {len(all_payrolls):,} payroll records...")
            for idx in range(0, len(all_payrolls), BATCH_SIZE):
                chunk = all_payrolls[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(PayrollRecord, c))
            await session.commit()

        if all_bonuses:
            print(f"📦 Inserting {len(all_bonuses):,} bonus records...")
            for idx in range(0, len(all_bonuses), BATCH_SIZE):
                chunk = all_bonuses[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(Bonus, c))
            await session.commit()

        if all_leaves:
            print(f"📦 Inserting {len(all_leaves):,} leave records...")
            for idx in range(0, len(all_leaves), BATCH_SIZE):
                chunk = all_leaves[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(Leave, c))
            await session.commit()

        if all_reimbursements:
            print(f"📦 Inserting {len(all_reimbursements):,} reimbursement records...")
            for idx in range(0, len(all_reimbursements), BATCH_SIZE):
                chunk = all_reimbursements[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(Reimbursement, c))
            await session.commit()

    # Verify counts
    async with async_session_factory() as session:
        emp_count = (await session.execute(select(func.count(Employee.id)))).scalar_one()
        rev_count = (await session.execute(select(func.count(SalaryRevision.id)))).scalar_one()
        pay_count = (await session.execute(select(func.count(PayrollRecord.id)))).scalar_one()

    elapsed = round(time.time() - start_time, 2)
    print(f"\n🎉 Successfully seeded database in {elapsed}s!")
    print(f"   • Employees: {emp_count:,}")
    print(f"   • Salary Revisions: {rev_count:,}")
    print(f"   • Payroll Records: {pay_count:,}")
    print(f"   • Database file: ./data/salary_management.db\n")


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else TOTAL_EMPLOYEES
    # Ensure data directory exists
    import os
    os.makedirs("./data", exist_ok=True)
    asyncio.run(seed_data(count))
