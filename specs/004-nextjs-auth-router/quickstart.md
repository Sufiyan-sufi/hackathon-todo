# Quickstart: Next.js Authentication Setup

## Prerequisites
- Node.js 18+ installed
- Python 3.13+ for backend API
- Access to JWT API endpoints at `/login` and `/register`

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <project-directory>
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   pip install uv  # if not already installed
   uv venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   uv pip install -r requirements.txt
   ```

## Configuration

1. **Environment variables:**
   Create `.env.local` in the frontend directory:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

2. **Backend configuration:**
   Ensure your Python backend is running and exposes:
   - POST `/login` endpoint
   - POST `/register` endpoint
   - Returns JWT tokens upon successful authentication

## Running the Application

1. **Start the backend:**
   ```bash
   cd backend
   python -m src.main  # or however your backend is started
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```

3. **Access the application:**
   - Visit `http://localhost:3000` for the frontend
   - Login page: `http://localhost:3000/login`
   - Register page: `http://localhost:3000/register`
   - Dashboard: `http://localhost:3000/dashboard`

## Key Components

### Authentication Context
Located in `frontend/src/lib/auth/auth-context.tsx`, provides global authentication state management.

### Form Validation
Using React Hook Form and Zod, located in `frontend/src/lib/validation/schemas.ts`.

### Protected Routes
Middleware and HOC for protecting routes, located in `frontend/src/lib/auth/middleware.ts`.

### UI Components
- Login form: `frontend/src/components/auth/LoginForm.tsx`
- Register form: `frontend/src/components/auth/RegisterForm.tsx`
- Protected route wrapper: `frontend/src/components/auth/ProtectedRoute.tsx`