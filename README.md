# PayVantage - Enterprise Compensation & Salary Intelligence Platform

> **A high-velocity, scalable salary management system engineered for executive HR and compensation teams - handling 10,000+ international employee records, dynamic multi-currency conversions, and immutable salary revision audit trails with sub-15ms query performance.**

[![Live Web Portal](https://img.shields.io/badge/Render-Live_Web_App-059669?style=for-the-badge&logo=render&logoColor=white)](https://incubyte-salary-management-rajpatel-1.onrender.com)
[![Backend REST API](https://img.shields.io/badge/FastAPI-Backend_API-1E3A8A?style=for-the-badge&logo=fastapi&logoColor=white)](https://incubyte-salary-management-rajpatel.onrender.com)
[![Swagger Docs](https://img.shields.io/badge/OpenAPI-Interactive_Docs-0284C7?style=for-the-badge&logo=swagger&logoColor=white)](https://incubyte-salary-management-rajpatel.onrender.com/docs)
[![Tests Passing](https://img.shields.io/badge/Tests-24%2F24_Passing-10B981?style=for-the-badge&logo=githubactions&logoColor=white)](#-test-verification--code-quality)

---

## 📋 Executive Submission Overview

1. **Executive Compensation Dashboard**: Instant workforce macro-analytics featuring real-time KPI metrics, departmental budget allocation comparisons, global footprint breakdown across 10 jurisdictions, salary distribution cohort histograms, and live currency switching across 9 global currencies.
2. **Immutable Audit Trails & Employee Profiles**: Dedicated profile drawers detailing complete compensation lifecycles, historic salary adjustments with effective dates and audit rationales, and itemized monthly payroll slips.
3. **Turnkey Containerized Deployment**: Zero-friction local spin-up via `docker compose up --build -d` alongside automated production deployment blueprints for Render.
4. **Sub-15ms Performance at 10,000 Scale**: High-throughput SQLite architecture powered by Write-Ahead Logging (WAL) and B-tree compound indexing, serving 10,000 active/archived employee records and 2,400+ revision logs in milliseconds.
5. **Excel-Compliant Data Hub**: Robust bulk CSV ingestion and streaming export engine with UTF-8 Byte Order Mark (`\ufeff`) support, standard CRLF terminators, and direct browser Blob streaming to eliminate popup restrictions.

---

## 🌐 Live Production Deployments

The platform is deployed live on Render across independent web services:

| Service | Endpoint | Environment | Notes |
| :--- | :--- | :--- | :--- |
| **🖥️ Frontend Web Portal** | [incubyte-salary-management-rajpatel-1.onrender.com](https://incubyte-salary-management-rajpatel-1.onrender.com) | Production (Next.js 14) | Executive UI & Responsive Analytics |
| **⚡ Backend API** | [incubyte-salary-management-rajpatel.onrender.com](https://incubyte-salary-management-rajpatel.onrender.com) | Production (FastAPI) | Async Python Engine & SQLite WAL |
| **📖 Interactive API Docs** | [incubyte-salary-management-rajpatel.onrender.com/docs](https://incubyte-salary-management-rajpatel.onrender.com/docs) | Swagger UI | Live schema testing & verification |
| **🩺 Health Monitor** | [incubyte-salary-management-rajpatel.onrender.com/health](https://incubyte-salary-management-rajpatel.onrender.com/health) | JSON Endpoint | Real-time service uptime verification |

---

## 💎 Core Architectural Features

### 1. Executive Compensation Analytics
* **Live KPI Suite**: Aggregates total enterprise payroll (~$1.13B+ USD), active headcount, workforce retention percentages, average/median base pay, and international jurisdictional spread.
* **Salary Distribution Histogram**: Segments compensation into intuitive bands, automatically highlights the workforce peak cohort, and calculates macro groupings.
* **Multi-Currency Engine**: Dynamically converts compensation values across USD, EUR, GBP, INR, CAD, CHF, AUD, JPY, and SGD.

### 2. High-Performance Employee Directory
* **Full-Text & Faceted Search**: Instant multi-condition filtering by department, country, employment status, and name/email keyword.
* **Zero-Scroll Employee Lifecycle Modal**: Compact 12-column layout for fast employee onboarding and updates with inline validation.
* **Comprehensive Detail Drawer**: Comprehensive audit trails recording every historical salary raise, promotion, market adjustment, and bonus award with effective timestamps.

### 3. Bulk CSV Ingestion & Streaming Export
* **Strict Validation & Feedback**: Validates rows during CSV imports with line-by-line error reporting and success breakdowns.
* **Universal Excel Compatibility**: Uses UTF-8 BOM encoding to ensure flawless display in Microsoft Excel, Google Sheets, and LibreOffice without character garbling.
* **Blob-Based Downloads**: Employs client-side object URLs to bypass browser popup blockers when downloading filtered payroll subsets.

---

## ⚙️ Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PAYVANTAGE ARCHITECTURE                         │
├───────────────────────────────────┬────────────────────────────────────┤
│  Frontend Client                  │  Backend Core & Persistence        │
│  • Next.js 14 (App Router)        │  • Python 3.12 + FastAPI           │
│  • React 18 + TypeScript          │  • SQLAlchemy 2.0 (Async Engine)   │
│  • Ant Design 5 (Executive Theme) │  • Pydantic v2 Schema Enforcement  │
│  • SCSS Modules + Flex/Grid Layout│  • SQLite 3 with WAL & B-Tree Index│
│  • Vitest + Testing Library       │  • Pytest Integration Test Suite   │
└───────────────────────────────────┴────────────────────────────────────┘
```

| Layer | Primary Tech | Supporting Tools & Libraries |
| :--- | :--- | :--- |
| **Client / UI** | Next.js 14, React 18, TypeScript | Ant Design 5, SCSS Modules, Lucide/Ant Icons, Axios |
| **Server / API** | Python 3.12, FastAPI | SQLAlchemy 2.0, Pydantic v2, aiosqlite, Uvicorn |
| **Data Storage** | SQLite 3 | WAL Mode, Indexed Foreign Keys, Soft Deletes |
| **Testing** | Vitest & Pytest | `@testing-library/react`, `jsdom`, `pytest-asyncio`, `httpx` |
| **Orchestration** | Docker & Docker Compose | Multi-stage Dockerfiles, dynamic `$PORT` handling |

---

## 🚀 Rapid Local Setup

### Option A: One-Command Docker Compose (Recommended)

Run the full stack with 10,000 seeded records in a single command:

```bash
docker compose up --build -d
```

Once started, access the platform locally:
* **Web Application**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:8000](http://localhost:8000)
* **Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

To stop the containers:
```bash
docker compose down
```

---

### Option B: Bare-Metal Development Setup

#### 1. Backend Service (FastAPI)

```bash
cd backend

# Initialize isolated virtual environment
python3 -m venv venv
source venv/bin/activate

# Install locked dependencies
pip install -r requirements.txt

# Seed 10,000 employees & salary history (~2.5s)
python seed.py

# Launch development server with auto-reload
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Application (Next.js)

```bash
cd frontend

# Install package dependencies
npm install

# Run development server
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Test Verification & Code Quality

Both services maintain comprehensive test coverage across critical calculation pipelines, validation schemas, and UI components.

### 1. Backend Test Suite (`pytest` - 16/16 Passing)

```bash
cd backend
PYTHONPATH=. pytest -v
```

```text
============================= test session starts ==============================
tests/test_analytics_and_csv.py::test_analytics_dashboard_metrics PASSED  [ 6%]
tests/test_analytics_and_csv.py::test_analytics_department_breakdown PASSED [12%]
tests/test_analytics_and_csv.py::test_analytics_country_breakdown PASSED    [18%]
tests/test_analytics_and_csv.py::test_analytics_salary_distribution PASSED [25%]
tests/test_analytics_and_csv.py::test_csv_export PASSED                    [31%]
tests/test_analytics_and_csv.py::test_csv_import PASSED                    [37%]
tests/test_employee_router.py::test_create_and_get_employee_via_api PASSED  [43%]
tests/test_employee_router.py::test_update_employee_salary_and_get_history_via_api PASSED [50%]
tests/test_employee_router.py::test_delete_employee_via_api PASSED         [56%]
tests/test_employee_router.py::test_list_employees_pagination_via_api PASSED [62%]
tests/test_employee_service.py::test_create_employee PASSED               [68%]
tests/test_employee_service.py::test_get_employee_by_id PASSED            [75%]
tests/test_employee_service.py::test_update_employee_and_track_salary_revision PASSED [81%]
tests/test_employee_service.py::test_delete_employee PASSED                [87%]
tests/test_employee_service.py::test_list_employees_pagination_and_filtering PASSED [93%]
tests/test_health.py::test_health_check_returns_healthy PASSED             [100%]

============================== 16 passed in 0.74s ==============================
```

### 2. Frontend Test Suite (`vitest` - 8/8 Passing)

```bash
cd frontend
npm test -- --run
```

```text
 ✓ src/test/SalaryHistogram.test.tsx (3 tests)
 ✓ src/test/KPICards.test.tsx (2 tests)
 ✓ src/test/EmployeeTable.test.tsx (3 tests)

 Test Files  3 passed (3)
      Tests  8 passed (8)
   Duration  3.70s
```

---

## 📂 Project Organization

```text
incubyte-salary-management-rajpatel/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy ORM models (Employee, SalaryHistory)
│   │   ├── routers/           # REST endpoints (/employees, /analytics)
│   │   ├── schemas/           # Pydantic v2 request/response contracts
│   │   ├── services/          # Business logic, calculations & CSV parsers
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Async engine & session pooling
│   │   └── main.py            # App lifecycle, middleware & CORS
│   ├── tests/                 # 16 Pytest integration & unit test suites
│   ├── seed.py                # High-speed 10k employee database seeder
│   ├── requirements.txt       # Production & test dependencies
│   └── Dockerfile             # Multi-stage Python container
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (Dashboard, Directory, Data Hub)
│   │   ├── components/        # Isolated modular UI components
│   │   │   ├── analytics/     # KPICards, Histogram, Department/Country breakdown
│   │   │   ├── employees/     # Table, DetailDrawer, FormModal, FilterBar
│   │   │   └── layout/        # AppLayout, Logo, Segmented Navigation
│   │   ├── lib/               # Axios client & typed API wrappers
│   │   ├── test/              # Vitest + RTL component suites
│   │   └── types/             # TypeScript interfaces
│   ├── Dockerfile             # Alpine-based production image
│   └── package.json           # Scripts & dependencies
├── docs/                      # Architectural specifications & trade-offs
│   ├── ARCHITECTURE.md        # DB schemas, indexing strategy & API contracts
│   ├── REQUIREMENTS.md        # Assessment requirements & scope analysis
│   ├── TRADE_OFFS.md          # Design decisions & technical justifications
│   ├── DEPLOYMENT_RENDER.md   # Step-by-step cloud deployment guide
│   └── SUBMISSION_SUMMARY.md  # Detailed submission dossier
├── Dockerfile                 # Root container for zero-config deployment
├── docker-compose.yml         # Multi-service local orchestrator
├── render.yaml                # Render Blueprint infrastructure-as-code
└── README.md                  # Comprehensive platform documentation
```

---

## 📚 Technical Documentation

For in-depth architectural specifications and design rationale, refer to the documentation directory:

* [Architecture & Data Strategy](docs/ARCHITECTURE.md) - Index structures, query optimization, and schema designs.
* [Engineering Trade-Offs](docs/TRADE_OFFS.md) - Rationale behind database choices, state management, and framework decisions.
* [Assessment Requirements Matrix](docs/REQUIREMENTS.md) - Line-by-line verification against the exercise brief.
* [Cloud Deployment Guide](docs/DEPLOYMENT_RENDER.md) - Render configuration and Docker multi-service deployment.
* [Submission Summary](docs/SUBMISSION_SUMMARY.md) - Complete overview for technical reviewers.
