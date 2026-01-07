# CLI Command Contract: Mark as Complete

**Feature**: Mark as Complete
**Type**: CLI Command Contract
**Version**: 1.0
**Date**: 2026-01-04

## Commands

### Command: complete

**Aliases**: `mark`

**Syntax**: `complete <id>` or `mark <id>`

**Description**: Toggle the completion status of an existing task by its ID.

---

## Request

### Parameters

| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|----------|
| `id` | `int` | Yes | Unique identifier of the task to toggle | `1`, `5`, `10` |

### Validation

- **id must be positive integer**: `id > 0`
- **id must exist in task list**: Check against current tasks
- **id must be parseable as integer**: Reject non-numeric inputs

---

## Response

### Success Response

**Format**: Text output to stdout

**Message Template**: `"Task marked as {status}: ID {id} - {title}"`

**Variables**:
- `status`: `"complete"` or `"incomplete"` based on new state
- `id`: Task identifier
- `title`: Task title

**Examples**:
```
> complete 1
Task marked as complete: ID 1 - Buy Milk

> mark 5
Task marked as incomplete: ID 5 - Write Report
```

### Error Response

**Format**: Text output to stderr or stdout (user-facing)

**Error Conditions**:

| Error | Message | Behavior |
|-------|----------|----------|
| Invalid ID format | `"Invalid task ID: {input}" | Display message, no state change |
| Task not found | `"Task ID not found: {id}" | Display message, no state change |
| Empty task list | `"No tasks available to mark" | Display message, no state change |

**Examples**:
```
> complete abc
Invalid task ID: abc

> complete 999
Task ID not found: 999

> complete 1
(no tasks exist)
No tasks available to mark
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Toggle completed task as complete again | Status changes to incomplete |
| Toggle incomplete task as complete | Status changes to complete |
| ID = 0 or negative | Treated as not found, display error |
| Multiple toggles on same task | Each call inverts current state |
| ID exists but task has no title | Still displays ID and empty title |

---

## State Changes

**Read Operations**:
- Find task by ID: O(n) linear search through task list

**Write Operations**:
- Toggle `completed` boolean: O(1) after task found

**Persistence**: None for Phase I (in-memory only)

---

## Testing Scenarios

### Unit Tests

1. **Toggle incomplete to complete**: `mark_complete` should set `completed=True`
2. **Toggle complete to incomplete**: `mark_complete` should set `completed=False`
3. **Consecutive toggles**: Multiple calls should invert state each time
4. **Non-existent ID**: Should raise `ValueError` with descriptive message
5. **Zero/negative ID**: Should be treated as not found

### Integration Tests

1. **CLI command parsing**: `complete 1` should parse and execute correctly
2. **Command alias**: `mark 5` should behave identically to `complete 5`
3. **Error message display**: User should see error when ID not found
4. **Confirmation display**: User should see success message after toggle

---

## Dependencies

**Internal Dependencies**:
- Task entity (models/task.py)
- mark_complete function (services/todo_service.py)
- Task list storage (in-memory, shared across CLI)

**External Dependencies**: None (Phase I)

---

## Future Evolution

**Phase II**: Command becomes API endpoint `POST /tasks/{id}/toggle`

**Phase III**: Natural language support via AI chatbot (e.g., "mark task 1 as complete")

**Phase IV**: Same CLI command structure, but task list sourced from database
