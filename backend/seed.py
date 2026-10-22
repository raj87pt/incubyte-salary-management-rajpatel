"""High-performance seed script to generate 10,000 realistic employee records with salary data.

PayVantage Enterprise Compensation Intelligence
Generates:
- 10,000 employees across 10 global countries and 8 core departments
- Realistic multi-currency salary distributions with executive, senior, and junior bands
- Historical salary revisions reflecting merit cycles, market benchmark adjustments, and promotions
- Multi-month payroll records, performance bonuses, leave audits, and expense claims
- Fast asynchronous bulk insertion into SQLite via async SQLAlchemy
"""

import asyncio
import os
import random
import re
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

# Seed configuration: Use customizable seed (defaulting to a unique seed)
SEED_VAL = int(os.environ.get("SEED", 8742))
fake = Faker()
Faker.seed(SEED_VAL)
random.seed(SEED_VAL)

TOTAL_EMPLOYEES = 10000
BATCH_SIZE = 1000

# Enterprise corporate email domains
EMAIL_DOMAINS = [
    "payvantage.corp",
    "payvantage.io",
    "payvantage.global",
]

# 10 Jurisdictions across 9 Currencies
COUNTRIES_DATA = [
    {
        "country": "United States",
        "currency": "USD",
        "cities": [
            "San Francisco",
            "New York",
            "Seattle",
            "Austin",
            "Chicago",
            "Boston",
            "Denver",
            "Los Angeles",
            "Atlanta",
        ],
        "min_salary": 65000,
        "max_salary": 265000,
        "weight": 35,
    },
    {
        "country": "United Kingdom",
        "currency": "GBP",
        "cities": [
            "London",
            "Manchester",
            "Edinburgh",
            "Bristol",
            "Cambridge",
            "Oxford",
            "Leeds",
        ],
        "min_salary": 48000,
        "max_salary": 165000,
        "weight": 15,
    },
    {
        "country": "Germany",
        "currency": "EUR",
        "cities": [
            "Berlin",
            "Munich",
            "Frankfurt",
            "Hamburg",
            "Cologne",
            "Stuttgart",
            "Dusseldorf",
        ],
        "min_salary": 52000,
        "max_salary": 175000,
        "weight": 12,
    },
    {
        "country": "India",
        "currency": "INR",
        "cities": [
            "Bengaluru",
            "Hyderabad",
            "Pune",
            "Delhi",
            "Mumbai",
            "Gurugram",
            "Chennai",
            "Noida",
        ],
        "min_salary": 850000,
        "max_salary": 4600000,
        "weight": 15,
    },
    {
        "country": "Canada",
        "currency": "CAD",
        "cities": [
            "Toronto",
            "Vancouver",
            "Montreal",
            "Ottawa",
            "Calgary",
            "Edmonton",
        ],
        "min_salary": 68000,
        "max_salary": 195000,
        "weight": 8,
    },
    {
        "country": "France",
        "currency": "EUR",
        "cities": [
            "Paris",
            "Lyon",
            "Marseille",
            "Toulouse",
            "Bordeaux",
            "Nice",
        ],
        "min_salary": 46000,
        "max_salary": 155000,
        "weight": 5,
    },
    {
        "country": "Singapore",
        "currency": "SGD",
        "cities": ["Singapore"],
        "min_salary": 72000,
        "max_salary": 235000,
        "weight": 4,
    },
    {
        "country": "Australia",
        "currency": "AUD",
        "cities": [
            "Sydney",
            "Melbourne",
            "Brisbane",
            "Perth",
            "Canberra",
            "Adelaide",
        ],
        "min_salary": 78000,
        "max_salary": 225000,
        "weight": 3,
    },
    {
        "country": "Switzerland",
        "currency": "CHF",
        "cities": ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
        "min_salary": 92000,
        "max_salary": 268000,
        "weight": 2,
    },
    {
        "country": "Japan",
        "currency": "JPY",
        "cities": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Fukuoka", "Nagoya"],
        "min_salary": 5800000,
        "max_salary": 18500000,
        "weight": 1,
    },
]

# 8 Core Corporate Departments with Industry Titles
DEPARTMENTS = [
    {
        "name": "Engineering",
        "roles": [
            "Software Engineer",
            "Senior Software Engineer",
            "Staff Systems Architect",
            "Principal Infrastructure Engineer",
            "Engineering Manager",
            "Site Reliability Engineer",
            "Platform Engineer",
            "QA Automation Lead",
            "Data Pipeline Engineer",
            "Cloud Security Engineer",
            "Frontend Systems Specialist",
            "Backend Services Engineer",
        ],
        "weight": 35,
    },
    {
        "name": "Product",
        "roles": [
            "Associate Product Manager",
            "Product Manager",
            "Senior Product Manager",
            "Group Product Manager",
            "VP of Product Strategy",
            "Product Operations Lead",
            "Technical Product Specialist",
        ],
        "weight": 10,
    },
    {
        "name": "Design",
        "roles": [
            "UI/UX Designer",
            "Product Designer",
            "Senior Product Designer",
            "Design Systems Lead",
            "Principal Brand Designer",
            "UX Research Specialist",
            "Design Operations Lead",
        ],
        "weight": 8,
    },
    {
        "name": "Sales",
        "roles": [
            "Business Development Rep",
            "Account Executive",
            "Senior Account Executive",
            "Enterprise Solutions Director",
            "Sales Operations Manager",
            "Strategic Accounts Lead",
            "Regional Commercial VP",
        ],
        "weight": 15,
    },
    {
        "name": "Marketing",
        "roles": [
            "Content Strategy Lead",
            "Growth Marketing Manager",
            "Product Marketing Manager",
            "VP of Global Brand",
            "Digital Acquisition Lead",
            "Lifecycle Marketing Specialist",
            "Developer Relations Advocate",
        ],
        "weight": 10,
    },
    {
        "name": "Customer Support",
        "roles": [
            "Technical Support Specialist",
            "Customer Success Manager",
            "Senior Enterprise CSM",
            "Support Engineering Lead",
            "Client Solutions Architect",
            "Customer Operations Lead",
        ],
        "weight": 10,
    },
    {
        "name": "Human Resources",
        "roles": [
            "People Operations Specialist",
            "Technical Talent Partner",
            "Senior HR Business Partner",
            "Head of Total Rewards",
            "Compensation & Benefits Analyst",
            "People Analytics Specialist",
        ],
        "weight": 6,
    },
    {
        "name": "Finance & Legal",
        "roles": [
            "Financial Planning Analyst",
            "Senior Corporate Accountant",
            "Corporate Controller",
            "Commercial Legal Counsel",
            "VP of Strategic Finance",
            "Treasury Operations Lead",
        ],
        "weight": 6,
    },
]

GENDERS = ["Female", "Male", "Non-binary", "Other"]
GENDER_WEIGHTS = [47, 47, 4, 2]

EMPLOYMENT_TYPES = ["full-time", "part-time", "contract"]
EMP_TYPE_WEIGHTS = [90, 6, 4]

STATUSES = ["active", "inactive"]
STATUS_WEIGHTS = [94, 6]

# Comprehensive Compensation Revision Reasons
REVISION_REASONS = [
    "Annual performance and merit review",
    "Promotion merit increase",
    "Market compensation equity adjustment",
    "Band parity realignment",
    "Mid-year retention & benchmark review",
    "Technical track grade progression",
    "Leadership scope expansion adjustment",
    "Cost of living parity correction",
]

# Realistic Enterprise Bonus Reasons & Types
BONUS_REASONS = [
    "Exceeded annual individual performance objectives",
    "Key contributor on core platform modernization",
    "Outstanding client retention and satisfaction impact",
    "Special recognition award for critical architecture delivery",
    "President's Club sales milestone achievement",
    "Successful execution of global infrastructure rollout",
    "Discretionary spot recognition for cross-functional leadership",
    "Quarterly innovation excellence award",
]
BONUS_TYPES = ["annual", "performance", "spot", "retention", "milestone"]

# Leave & Reimbursement Categories
LEAVE_TYPES = ["annual", "sick", "casual", "maternity", "paternity", "unpaid"]
REIMBURSEMENT_CATEGORIES = [
    "travel",
    "equipment",
    "wellness",
    "meal",
    "education",
    "remote_stipend",
]
PAYMENT_METHODS = ["bank_transfer", "direct_deposit", "wire_transfer"]


def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]


async def seed_data(total_count: int = TOTAL_EMPLOYEES):
    print("\n" + "=" * 60)
    print(" 🚀 PayVantage Global Compensation Platform")
    print(f" 📦 High-Performance Seed Pipeline ({total_count:,} Records)")
    print("=" * 60)
    start_time = time.time()

    # Re-create database schema cleanly
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
    today = date.today()

    print(f"⚡ Generating {total_count:,} realistic employee entities in memory...")
    for i in range(1, total_count + 1):
        emp_uuid = str(uuid.uuid4())
        emp_code = f"EMP-{i:05d}"

        first_name = fake.first_name()
        last_name = fake.last_name()

        # Sanitize name for clean enterprise email address
        clean_first = re.sub(r"[^a-z0-9]", "", first_name.lower())
        clean_last = re.sub(r"[^a-z0-9]", "", last_name.lower())
        domain = weighted_choice(EMAIL_DOMAINS, [60, 25, 15])
        email = f"{clean_first}.{clean_last}{i}@{domain}"

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

        # Realistic Age & Tenure distribution
        age_years = random.randint(22, 63)
        dob = today - timedelta(days=age_years * 365 + random.randint(0, 360))

        tenure_days = random.randint(30, 365 * 8)
        doj = today - timedelta(days=tenure_days)

        # Seniority multiplier based on contemporary corporate bands
        base_range = c_info["max_salary"] - c_info["min_salary"]
        seniority_boost = 1.0

        if "VP" in designation:
            seniority_boost = 2.05
        elif any(k in designation for k in ["Director", "Head", "Principal"]):
            seniority_boost = 1.65
        elif any(k in designation for k in ["Senior", "Manager", "Lead", "Architect"]):
            seniority_boost = 1.32
        elif "Associate" in designation:
            seniority_boost = 0.88

        # Add subtle organic variation
        organic_factor = random.uniform(0.97, 1.03)
        raw_salary = c_info["min_salary"] + (random.random() * base_range * 0.7)
        final_salary = round(raw_salary * seniority_boost * organic_factor, -2)

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

        # Historical salary revisions for ~26% of employees with tenure > 1 year
        if tenure_days > 380 and random.random() < 0.28:
            old_salary = round(final_salary * random.uniform(0.82, 0.93), -2)
            all_revisions.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "old_salary": old_salary,
                "new_salary": final_salary,
                "currency": currency,
                "effective_date": salary_eff_date,
                "reason": random.choice(REVISION_REASONS),
                "created_at": now_utc,
            })

        # Payroll records for a sample subset of 3,000 active employees (recent 2 months)
        if i <= 3000 and status == "active":
            monthly_gross = round(final_salary / 12, 2)
            deductions = round(monthly_gross * random.uniform(0.18, 0.26), 2)
            net = round(monthly_gross - deductions, 2)
            p_method = random.choice(PAYMENT_METHODS)

            # Generate for two recent payroll cycles
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
                "payment_method": p_method,
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
                "payment_method": p_method,
                "status": "paid",
                "created_at": now_utc,
            })

        # Discretionary and performance bonuses for ~16% of employees
        if random.random() < 0.16:
            award_offset = random.randint(15, 180)
            award_date = today - timedelta(days=award_offset)
            all_bonuses.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "amount": round(final_salary * random.uniform(0.06, 0.16), -2),
                "currency": currency,
                "bonus_type": random.choice(BONUS_TYPES),
                "date_awarded": award_date,
                "reason": random.choice(BONUS_REASONS),
                "created_at": now_utc,
            })

        # Leave records for ~20% of employees
        if random.random() < 0.20:
            leave_days = random.randint(1, 10)
            leave_offset = random.randint(20, 160)
            start_d = today - timedelta(days=leave_offset)
            all_leaves.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "leave_type": random.choice(LEAVE_TYPES),
                "start_date": start_d,
                "end_date": start_d + timedelta(days=leave_days),
                "days": leave_days,
                "status": "approved",
                "created_at": now_utc,
            })

        # Expense and travel reimbursements for ~12% of employees
        if random.random() < 0.12:
            claim_offset = random.randint(10, 120)
            all_reimbursements.append({
                "id": str(uuid.uuid4()),
                "employee_id": emp_uuid,
                "amount": round(random.uniform(75, 950), 2),
                "currency": currency,
                "category": random.choice(REIMBURSEMENT_CATEGORIES),
                "date_submitted": today - timedelta(days=claim_offset),
                "status": "approved",
                "created_at": now_utc,
            })

    print(f"📦 Committing {len(all_employee_records):,} employees in batches of {BATCH_SIZE}...")
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
            print(f"📦 Committing {len(all_revisions):,} salary revision history records...")
            for idx in range(0, len(all_revisions), BATCH_SIZE):
                chunk = all_revisions[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(SalaryRevision, c))
            await session.commit()

        if all_payrolls:
            print(f"📦 Committing {len(all_payrolls):,} payroll records...")
            for idx in range(0, len(all_payrolls), BATCH_SIZE):
                chunk = all_payrolls[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(PayrollRecord, c))
            await session.commit()

        if all_bonuses:
            print(f"📦 Committing {len(all_bonuses):,} bonus records...")
            for idx in range(0, len(all_bonuses), BATCH_SIZE):
                chunk = all_bonuses[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(Bonus, c))
            await session.commit()

        if all_leaves:
            print(f"📦 Committing {len(all_leaves):,} leave records...")
            for idx in range(0, len(all_leaves), BATCH_SIZE):
                chunk = all_leaves[idx : idx + BATCH_SIZE]
                await session.run_sync(lambda s, c=chunk: s.bulk_insert_mappings(Leave, c))
            await session.commit()

        if all_reimbursements:
            print(f"📦 Committing {len(all_reimbursements):,} reimbursement records...")
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
    print("\n" + "=" * 60)
    print(f" 🎉 Database seeding completed successfully in {elapsed}s!")
    print(f"   • Total Employees:   {emp_count:,}")
    print(f"   • Salary Revisions:  {rev_count:,}")
    print(f"   • Payroll Records:   {pay_count:,}")
    print("   • Storage:           ./data/salary_management.db")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else TOTAL_EMPLOYEES
    # Ensure data directory exists
    os.makedirs("./data", exist_ok=True)
    asyncio.run(seed_data(count))
