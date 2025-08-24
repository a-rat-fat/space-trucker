# Space Truckers Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create app dir
WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends     build-essential curl &&     rm -rf /var/lib/apt/lists/*

# Copy and install deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY app ./app

# Expose port (Railway provides $PORT)
ENV PORT=8080
ENV PYTHONPATH=/app
CMD exec gunicorn --bind 0.0.0.0:${PORT} --workers 2 --threads 4 app.app:app
