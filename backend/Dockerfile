# Backend Dockerfile for Python FastAPI
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

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and seed script
COPY app/ /app/app/
COPY seed.py /app/seed.py
COPY pytest.ini /app/pytest.ini

# Ensure data directory exists for SQLite database
RUN mkdir -p /app/data

EXPOSE 8000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start script seeds DB if not present and starts uvicorn
CMD ["sh", "-c", "python seed.py 10000 && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
