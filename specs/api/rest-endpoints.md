# Spec: REST Endpoints for Todo API (Refined)

## Overview
Create RESTful API endpoints for multi-user Todo app using FastAPI, SQLModel, Neon DB, Better Auth (JWT).

## Requirements
- Root Route: GET / – Return JSON {"message": "Todo API"} (to avoid 404 on root).
- Method: GET /api/{user_id}/tasks – List all tasks
- POST /api/{user_id}/tasks – Create task
- GET /api/{user_id}/tasks/{id} – Get task
- PUT /api/{user_id}/tasks/{id} – Update task
- DELETE /api/{user_id}/tasks/{id} – Delete task
- PATCH /api/{user_id}/tasks/{id}/complete – Toggle completion
- Auth: Require JWT in header, filter by user_id (page 8).
- DB: Use SQLModel for Task model, Neon connection.
- Error: 401 if no token, 404 if not found. Use JSONResponse for all exceptions (callable, not dict).
- Favicon: Ignore or return empty 204 for /favicon.ico.

## Agent Usage
- Use Code Generator Agent, Python Architect Subagent, skill generate_crud.

Refine if needed.