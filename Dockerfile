# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Leverage Docker layer caching for node_modules
COPY frontend/package*.json ./
RUN npm ci --quiet

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Final Production Image
FROM python:3.10-slim

# Set environment variables for Python performance and reliability
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for better security
RUN useradd -m -s /bin/bash appuser

WORKDIR /app

# Install Python dependencies separately to optimize cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Copy built frontend artifacts from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./dist

# Ensure appuser has ownership of the application directory
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose the API and Frontend port
EXPOSE 8000

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "fast_api_server:app", "--host", "0.0.0.0", "--port", "8000"]