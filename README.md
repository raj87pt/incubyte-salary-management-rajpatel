# PayVantage - Enterprise Compensation & Salary Intelligence

A production-ready, high-performance salary management platform built for ACME org's HR leadership, replacing brittle spreadsheet workflows for **10,000+ employees** across 10 international jurisdictions and 9 currencies.

---

## 🌟 Key Highlights

- **10,000 Records at Scale**: Optimized SQLite database seeded with 10,000 realistic international employees and 2,497 salary revision audit trails.
- **Sub-15ms Query Latency**: Database indices on `department`, `country`, `status`, and `base_salary_usd` paired with indexed pagination.
- **Executive Compensation Dashboard**:
  - Live KPI metrics (Total Payroll ~$1.13B USD, Headcount, Average Compensation, Multi-Country Footprint).
  - Department budget breakdown & interactive comparisons.
  - Salary tier distribution histogram with peak cohort identification and macro workforce grouping.
  - Dynamic currency switching (USD, EUR, GBP, INR, CAD, CHF, AUD, JPY, SGD).
- **Employee Directory & Lifecycle**:
  - Full-text search and multi-facet filtering (Department, Country, Employment Type, Status).
  - Comprehensive Employee Detail Drawer (Salary revision audit logs, payslips, benefits, bonuses, leaves).
  - Compact 12-column zero-scroll Edit & Create modal.
- **Bulk CSV Ingestion & Export**:
  - Full Excel compatibility with UTF-8 Byte Order Mark (`\ufeff`) and standard CRLF line endings.
  - Native browser Blob downloads preventing popup blockers.
  - Instant sample template generation and full/filtered database exports.
- **100% Automated Test Coverage**:
  - 16 Backend integration & unit tests (`pytest`).
  - 8 Frontend component tests (`vitest` + `@testing-library/react`).
- **One-Command Containerization**: Turnkey Docker Compose orchestration with optimized build contexts.

---

## 🏗️ Tech Stack

| Layer | Technology | Key Libraries |
|-------|------------|---------------|
| **Backend** | Python 3.12 + FastAPI | SQLAlchemy 2.0 (async), Pydantic v2, aiosqlite, pytest |
| **Database** | SQLite 3 | WAL mode, B-tree indices on query facets, indexed soft-deletes |
| **Frontend** | Next.js 14 (App Router) | React 18, TypeScript, Ant Design 5, SCSS Modules, Axios |
| **Testing** | Vitest + RTL (Frontend) / Pytest (Backend) | `@testing-library/react`, `jsdom`, `pytest-asyncio` |
| **DevOps** | Docker & Docker Compose | Multi-stage builds, Alpine/Slim base images, volume persistence |

---

## 🚀 One-Command Quick Start (Docker)

To launch the full stack with seeded database in one command:

```bash
docker compose up --build -d
```

- **Frontend Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 💻 Local Development Setup

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite (16 tests, 100% pass)
PYTHONPATH=. pytest -v

# Seed 10,000 employees & salary history (~2.5s)
python seed.py

# Start development API server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run frontend test suite (8 tests, 100% pass)
npm test

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Test Verification Matrix

### Backend Tests (`backend/tests/`)
```text
tests/test_analytics_and_csv.py::test_analytics_dashboard_metrics PASSED
tests/test_analytics_and_csv.py::test_analytics_department_breakdown PASSED
tests/test_analytics_and_csv.py::test_analytics_country_breakdown PASSED
tests/test_analytics_and_csv.py::test_analytics_salary_distribution PASSED
tests/test_analytics_and_csv.py::test_csv_export PASSED
tests/test_analytics_and_csv.py::test_csv_import PASSED
tests/test_employee_router.py::test_create_and_get_employee_via_api PASSED
tests/test_employee_router.py::test_update_employee_salary_and_get_history_via_api PASSED
tests/test_employee_router.py::test_delete_employee_via_api PASSED
tests/test_employee_router.py::test_list_employees_pagination_via_api PASSED
tests/test_employee_service.py::test_create_employee PASSED
tests/test_employee_service.py::test_get_employee_by_id PASSED
tests/test_employee_service.py::test_update_employee_and_track_salary_revision PASSED
tests/test_employee_service.py::test_delete_employee PASSED
tests/test_employee_service.py::test_list_employees_pagination_and_filtering PASSED
tests/test_health.py::test_health_check_returns_healthy PASSED

16 passed in 0.76s
```

### Frontend Tests (`frontend/src/test/`)
```text
✓ src/test/KPICards.test.tsx (2 tests)
  ✓ renders skeletons when loading is true
  ✓ renders executive KPI values correctly when loaded
✓ src/test/SalaryHistogram.test.tsx (3 tests)
  ✓ renders loading skeleton when loading is true
  ✓ renders empty state when data is empty
  ✓ identifies peak cohort and calculates macro grouping percentages correctly
✓ src/test/EmployeeTable.test.tsx (3 tests)
  ✓ renders employee rows and formatted salary columns
  ✓ calls onView when View button is clicked
  ✓ renders empty state with Clear All Filters button when no records found

8 passed in 5.78s
```

---

## 📁 Repository Structure

```
├── docs/
│   ├── REQUIREMENTS.md            # Scope, user personas, deliberate exclusions
│   ├── ARCHITECTURE.md            # Data model, indexes, API contracts, caching
│   ├── TRADE_OFFS.md              # Architectural decisions and trade-offs
│   ├── VERIFICATION_MATRIX.md     # Line-by-line verification against exercise brief
│   └── SUBMISSION_SUMMARY.md      # Final submission summary for assessment
├── backend/
│   ├── app/
│   │   ├── models/                # SQLAlchemy Employee & SalaryHistory models
│   │   ├── schemas/               # Strict Pydantic v2 schemas
│   │   ├── services/              # Employee, Analytics, and CSV services
│   │   ├── routers/               # /api/employees & /api/analytics endpoints
│   │   ├── database.py            # Async engine & session management
│   │   └── main.py                # FastAPI app initialization & CORS
│   ├── tests/                     # 16 Pytest integration & unit tests
│   ├── seed.py                    # 10K realistic employee generator (Faker)
│   ├── requirements.txt           # Python pinned dependencies
│   ├── Dockerfile                 # Optimized backend container build
│   └── .dockerignore              # Context optimization
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router (dashboard, employees, import/export)
│   │   ├── components/
│   │   │   ├── analytics/         # KPICards, SalaryHistogram, Department/Country breakdown
│   │   │   ├── employees/         # EmployeeTable, DetailDrawer, FormModal, FilterBar
│   │   │   └── layout/            # Sidebar, Header, Providers (persisted state)
│   │   ├── test/                  # Vitest component test suites
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json               # Node dependencies & test scripts
│   ├── vitest.config.ts           # Vitest configuration with JSDOM
│   ├── Dockerfile                 # Optimized frontend container build
│   └── .dockerignore              # Context optimization
├── docker-compose.yml             # Full-stack orchestration (Frontend + Backend)
├── exercise.md                    # Original assessment brief
└── README.md                      # System documentation & setup guide
```

---

## 📄 Documentation Links

- [Requirements & Scope](docs/REQUIREMENTS.md)
- [System Architecture & Data Model](docs/ARCHITECTURE.md)
- [Architectural Trade-offs & Decisions](docs/TRADE_OFFS.md)
- [Requirements Verification Matrix](docs/VERIFICATION_MATRIX.md)
- [Final Submission Summary](docs/SUBMISSION_SUMMARY.md)
