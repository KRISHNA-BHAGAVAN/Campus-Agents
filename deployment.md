# Deployment Guide

This repository supports two primary deployment strategies:

1.  **Unified Docker Container**: Runs both frontend and backend in a single container.
2.  **Hybrid Deployment**: Frontend on Netlify, Backend on a Cloud Server (e.g., Render/AWS).

## Option 1: Docker (Recommended)

This runs the entire application (Backend API + React Frontend + MongoDB) using Docker Compose.

### Prerequisites

- Docker & Docker Compose installed.

### Steps

1.  **Environment Variables**:
    Ensure your `.env` file exists and has the required keys:

    ```bash
    # .env
    GROQ_API_KEY=your_key
    TAVILY_API_KEY=your_key
    MONGODB_URI=mongodb://mongo:27017  # Valid for Docker Compose
    ```

2.  **Build & Run**:

    ```bash
    docker-compose up --build
    ```

3.  **Access**:
    Open `http://localhost:8000`. The frontend is served directly by the backend!

---

## Option 2: Netlify (Frontend) + Cloud (Backend)

Use this if you want to host the frontend on a CDN for faster initial load times.

### Frontend (Netlify)

1.  Push this repo to GitHub.
2.  Connect to Netlify.
3.  **Build Settings**:
    - **Base directory**: `frontend`
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
4.  **Environment Variables (in Netlify)**:
    - `VITE_API_BASE_URL`: `https://your-backend-url.com` (Do not set this for Docker deployment).

### Backend (e.g., Render/Railway)

1.  Deploy the root directory as a Python web service.
2.  Start Command: `uvicorn fast_api_server:app --host 0.0.0.0 --port 8000`
3.  Set environment variables (`GROQ_API_KEY`, etc.).
