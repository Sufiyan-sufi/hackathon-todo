# Data Model: Mark as Complete

**Feature**: Mark as Complete
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-04

## Task Entity

### Overview

The `Task` entity represents a todo item in the in-memory Todo list. This entity is shared across all features and is the core data model for the application.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `int` | Yes | - | Unique identifier for the task. Generated sequentially starting from 1. |
| `title` | `str` | Yes | - | Task name/title. Minimum 1 character. |
| `description` | `str` | No | `""` | Optional details about the task. |
| `completed` | `bool` | Yes | `False` | Current completion status. True = complete, False = incomplete. |

### Validation Rules

- **id**: Must be positive integer (> 0). Must be unique across all tasks.
- **title**: Must be non-empty string (minimum 1 character). No explicit maximum defined.
- **description**: Optional string. Can be empty.
- **completed**: Boolean. Valid values: True or False.

### State Transitions

The `completed` field supports the following state transitions:

```
┌─────────────┐
│  False      │ ◄───┐
│ (Incomplete)│     │
└──────┬──────┘     │
       │ toggle    │ toggle
       │           │
       ▼           │
┌─────────────┐     │
│  True       │ ────┘
│ (Complete)  │
└─────────────┘
```

**Transition Rules**:
- From `False` to `True`: User marks incomplete task as complete
- From `True` to `False`: User marks complete task as incomplete (toggle back)
- Invalid ID: No transition, raise `ValueError`

### Relationships

This feature does not introduce new relationships. The Task entity is self-contained in Phase I (in-memory list).

**Future relationships** (Phase II+):
- Task may have foreign keys to User (when multi-user support added)
- Task may have relationships to Tag, Priority, RecurringTask in future phases

### Storage

**Phase I** (Current): In-memory Python list.

**Phase II** (Future): Database table with primary key on `id`.

**Phase III** (Future): SQLModel class with ORM mappings.

### Example Usage

```python
# Create task
task = Task(id=1, title="Buy Milk", description="Go to store", completed=False)

# Toggle completion
task.completed = not task.completed  # Now True

# Toggle back
task.completed = not task.completed  # Now False again
```

### Type Hints

```python
from typing import List
from dataclasses import dataclass

@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    completed: bool = False

def mark_complete(tasks: List[Task], task_id: int) -> None:
    """Toggle task completion status."""
    # Implementation in tasks.md
```
