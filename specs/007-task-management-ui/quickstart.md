# Quickstart: Task Management UI

## Overview
Quick reference for setting up and running the task management UI feature.

## Prerequisites
- Node.js 18+ with pnpm installed
- Backend API server running on port 8000
- Valid JWT token for authentication

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Environment Configuration
Ensure the following environment variable is set:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Run the Application
```bash
# Start frontend development server
pnpm run dev
```

## Key Components

### Dashboard Page
- Location: `src/app/dashboard/page.tsx`
- Route: `/dashboard`
- Protected by authentication context

### Task Components
- `TaskList`: Displays all user tasks in a responsive layout
- `TaskForm`: Handles task creation and updates
- `TaskItem`: Individual task display with completion toggle
- `ProtectedRoute`: Authentication wrapper for protected routes

### Services
- `task-service.ts`: API integration layer for task operations
- `auth-context.tsx`: Authentication state management

## API Integration
The UI connects to the backend via:
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL`
- Authorization: JWT token from auth context
- Endpoints: `/api/{user_id}/tasks/*`

## Development Workflow
1. Create new components in `src/components/tasks/`
2. Add API calls to `src/lib/api/task-service.ts`
3. Use existing Zod schemas in `src/lib/validation/schemas.ts`
4. Test with the backend API endpoints

## Testing
- Unit tests: `src/components/tasks/__tests__/`
- Integration tests: Verify API connections work with backend
- E2E tests: Test full user flows in dashboard