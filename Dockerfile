# Root Dockerfile for PayVantage Backend API (FastAPI)
# Enables zero-config deployment on Render when root directory is used
FROM python:3.12-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies from backend
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

# Copy backend application code and scripts
COPY backend/app/ /app/app/
COPY backend/seed.py /app/seed.py
COPY backend/pytest.ini /app/pytest.ini

# Ensure data directory exists for SQLite database
RUN mkdir -p /app/data

EXPOSE 8000

# Health check (supports Render $PORT and local 8000)
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start script: seeds database if not present (or if FORCE_SEED=true) and starts uvicorn on $PORT
CMD ["sh", "-c", "if [ \"${FORCE_SEED}\" = \"true\" ] || [ ! -f /app/data/salary_management.db ]; then python seed.py 10000; fi && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
