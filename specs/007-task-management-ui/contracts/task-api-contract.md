# API Contract: Task Management Endpoints

## Overview
Contract for task management API endpoints used by the frontend UI.

## Base URL
```
${NEXT_PUBLIC_API_BASE_URL}/api/{user_id}
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### GET /tasks
**Description**: Retrieve all tasks for a user

**Request**:
- Method: GET
- Headers: Authorization: Bearer {token}
- Parameters: None

**Response**:
- Status: 200 OK
- Body: Array of Task objects
```json
[
  {
    "id": 1,
    "title": "Sample Task",
    "description": "Sample description",
    "completed": false,
    "user_id": 123,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### POST /tasks
**Description**: Create a new task

**Request**:
- Method: POST
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Body:
```json
{
  "title": "New Task",
  "description": "Task description (optional)",
  "completed": false
}
```

**Response**:
- Status: 201 Created
- Body: Created Task object
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description (optional)",
  "completed": false,
  "user_id": 123,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### PUT /tasks/{id}
**Description**: Update an existing task

**Request**:
- Method: PUT
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Path: /tasks/{id}
- Body:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "completed": false
}
```

**Response**:
- Status: 200 OK
- Body: Updated Task object
```json
{
  "id": 2,
  "title": "Updated Task Title",
  "description": "Updated description",
  "completed": false,
  "user_id": 123,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### DELETE /tasks/{id}
**Description**: Delete a task

**Request**:
- Method: DELETE
- Headers: Authorization: Bearer {token}
- Path: /tasks/{id}

**Response**:
- Status: 204 No Content
- Body: Empty

### PATCH /tasks/{id}/complete
**Description**: Toggle task completion status

**Request**:
- Method: PATCH
- Headers: Authorization: Bearer {token}
- Path: /tasks/{id}/complete

**Response**:
- Status: 200 OK
- Body: Updated Task object
```json
{
  "id": 2,
  "title": "Sample Task",
  "description": "Sample description",
  "completed": true,
  "user_id": 123,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

## Error Responses
All endpoints may return:
- 401 Unauthorized: Invalid or missing JWT token
- 403 Forbidden: User not authorized to access this resource
- 404 Not Found: Task or user not found
- 422 Unprocessable Entity: Validation errors
- 500 Internal Server Error: Server error

## Validation Rules
- Title: Required, 1-100 characters
- Description: Optional, 0-500 characters
- Completed: Boolean value