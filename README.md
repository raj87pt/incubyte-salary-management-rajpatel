# Employee Salary Management System

A web-based salary management tool for ACME org's HR team, replacing spreadsheet workflows for 10,000+ employees across multiple countries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + FastAPI |
| Database | SQLite + SQLAlchemy (async) |
| Frontend | Next.js + Ant Design + SCSS Modules |
| Testing | pytest (backend) · Jest + RTL (frontend) |
| Deployment | Docker Compose |

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (for deployment)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run tests
pytest -v

# Seed database with 10K employees
python seed.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

## Project Structure

```
├── docs/                  # Requirements, architecture, trade-offs
├── backend/               # Python FastAPI backend
│   ├── app/               # Application code
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic
│   │   ├── routers/       # API route handlers
│   │   └── utils/         # Helpers
│   ├── tests/             # pytest test suite
│   └── seed.py            # 10K employee seed script
├── frontend/              # Next.js React frontend
│   ├── src/
│   │   ├── app/           # Next.js pages (App Router)
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # API client, utilities
│   │   └── styles/        # SCSS modules
│   └── __tests__/         # Jest test suite
├── docker-compose.yml     # Full-stack orchestration
└── exercise.md            # Original exercise brief
```

## Documentation

- [Requirements](docs/REQUIREMENTS.md) — goal, scope, features, and deliberate exclusions
- [Architecture](docs/ARCHITECTURE.md) — system design, data model, API design
