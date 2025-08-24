# Space Truckers v2 — Dockerfile (Railway friendly)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt ./ 
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY app ./app

# Create local /data folder if using OrbStack locally
RUN mkdir -p /data

ENV PORT=8080
ENV PYTHONPATH=/app

# Launch with Gunicorn
CMD exec gunicorn --bind 0.0.0.0:${PORT} --workers 2 --threads 4 app.app:app
