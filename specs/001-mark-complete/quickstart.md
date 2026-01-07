# Quickstart: Mark as Complete

**Feature**: Mark as Complete
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-04

## Overview

This quickstart guide demonstrates how to use the `complete` and `mark` commands to toggle task completion status in the Todo application.

## Prerequisites

- Python 3.13+ installed
- Project repository cloned
- Dependencies installed (none required for Phase I)
- At least one task created via `add` command

## Installation

```bash
# No installation required for Phase I (in-memory console app)
cd /path/to/hackathon-todo
python src/cli/main.py
```

## Usage

### Basic Command Syntax

```bash
# Mark a task as complete or incomplete
complete <id>

# Alias for complete command
mark <id>
```

### Examples

#### Example 1: Mark task as complete

```bash
# First, add a task (if not exists)
add "Buy Groceries" "Milk, eggs, bread"

# List tasks to see ID
list

# Output:
# ID: 1 | Title: Buy Groceries | Description: Milk, eggs, bread | Status: [ ] Incomplete

# Mark as complete
complete 1

# Output:
# Task marked as complete: ID 1 - Buy Groceries

# Verify
list

# Output:
# ID: 1 | Title: Buy Groceries | Description: Milk, eggs, bread | Status: [X] Completed
```

#### Example 2: Toggle back to incomplete

```bash
# Mark complete task as incomplete
mark 1

# Output:
# Task marked as incomplete: ID 1 - Buy Groceries

# Verify
list

# Output:
# ID: 1 | Title: Buy Groceries | Description: Milk, eggs, bread | Status: [ ] Incomplete
```

#### Example 3: Handle non-existent ID

```bash
# Try to mark a task that doesn't exist
complete 999

# Output:
# Task ID not found: 999
```

#### Example 4: Using command alias

```bash
# Use 'mark' instead of 'complete'
mark 2

# Output:
# Task marked as complete: ID 2 - Your Task Title
```

## Common Use Cases

### Completing a task after finishing work

```bash
add "Write documentation" "Update README with new features"
# ... do work ...
complete 1
```

### Marking a task as incomplete to resume later

```bash
mark 1
# Output: Task marked as incomplete: ID 1 - Write documentation
```

### Checking progress with multiple tasks

```bash
add "Task A"
add "Task B"
add "Task C"

complete 1
complete 3

list
# Shows: Task 1 [X], Task 2 [ ], Task 3 [X]
```

## Troubleshooting

### Error: "Task ID not found: X"

**Cause**: The provided ID does not match any existing task.

**Solution**:
1. Run `list` to see all available tasks and their IDs
2. Use the correct ID from the list

### Error: "Invalid task ID: abc"

**Cause**: The input is not a valid integer.

**Solution**: Provide a numeric ID (e.g., `complete 1` not `complete abc`)

### Error: "No tasks available to mark"

**Cause**: The task list is empty.

**Solution**: Create at least one task first using the `add` command:
```bash
add "Your task title" "Optional description"
```

## Testing

### Run tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_todo_service.py

# Run with verbose output
pytest -v
```

### Test coverage

```bash
# Generate coverage report
pytest --cov=src --cov-report=html
```

## Next Steps

- View all tasks: `list` or `view`
- Add new tasks: `add "Title" "Description"`
- Update task details: `update <id> --title "New title" --description "New description"`
- Delete tasks: `delete <id>`

## Support

For issues or questions, refer to:
- [Specification](./spec.md) - Feature requirements and acceptance criteria
- [Data Model](./data-model.md) - Task entity structure
- [CLI Contract](./contracts/cli-command-contract.md) - Command interface details
- [Plan](./plan.md) - Implementation approach and architecture decisions
