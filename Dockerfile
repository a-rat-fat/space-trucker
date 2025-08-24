# Space Truckers v2 — Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App
COPY app ./app

# Data dir for SQLite persistence
RUN mkdir -p /data
VOLUME ["/data"]

ENV PORT=8080
ENV PYTHONPATH=/app
CMD exec gunicorn --bind 0.0.0.0:${PORT} --workers 2 --threads 4 app.app:app
