# Data Model: Task Management UI

## Task Entity
**Entity name**: Task
- **id**: number - Unique identifier for the task
- **title**: string - Task title (required, 1-100 characters)
- **description**: string - Optional task description (max 500 characters)
- **completed**: boolean - Completion status of the task
- **user_id**: number - Reference to the user who owns the task
- **created_at**: Date - Timestamp when the task was created
- **updated_at**: Date - Timestamp when the task was last updated

**Relationships**:
- Belongs to one User (via user_id foreign key)
- One user can have many Tasks

**Validation rules**:
- title: Required, min length 1, max length 100
- description: Optional, max length 500
- completed: Boolean, defaults to false

**State transitions**:
- Incomplete → Complete (when user marks task as complete)
- Complete → Incomplete (when user unmarks task as complete)

## User Session Entity
**Entity name**: User Session
- **user_id**: number - Unique identifier for the authenticated user
- **email**: string - User's email address
- **name**: string - User's display name
- **jwt_token**: string - JWT token for API authorization

**Validation rules**:
- user_id: Required, numeric
- email: Required, valid email format
- jwt_token: Required for API access

## Form Data Entities

### Create Task Form Data
- **title**: string - Required task title (1-100 chars)
- **description**: string - Optional task description (max 500 chars)

### Update Task Form Data
- **title**: string - Updated task title (1-100 chars)
- **description**: string - Updated task description (max 500 chars)

**Validation rules**:
- Both forms: Title required, description optional
- Title: 1-100 characters
- Description: 0-500 characters