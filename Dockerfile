# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend source code
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
# Build the frontend - outputs to /app/frontend/dist
RUN npm run build

# Stage 2: Setup Python Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install uvicorn

# Copy backend code
COPY . .

# Copy built frontend assets from Stage 1 to the backend's expected static location
COPY --from=frontend-builder /app/frontend/dist ./dist

# Expose port
EXPOSE 8000

# Environment variables (Defaults, override in docker-compose or run command)
ENV PYTHONUNBUFFERED=1

# Command to run the application
CMD ["uvicorn", "fast_api_server:app", "--host", "0.0.0.0", "--port", "8000"]
