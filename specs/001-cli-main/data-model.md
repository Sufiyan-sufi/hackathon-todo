# Data Model: CLI Main Integration

## Entities

### Task
**Description**: Represents a todo item in the in-memory Todo list.

**Fields**:
- `id` (int): Unique identifier for the task (positive integer)
- `title` (str): Task name/title (non-empty string)
- `description` (str): Optional details about the task (can be empty, defaults to "")
- `completed` (bool): Current completion status (True = complete, False = incomplete, defaults to False)

**Validation Rules**:
- `id` must be a positive integer
- `title` cannot be empty or just whitespace
- `description` must be a string
- `completed` must be a boolean

**State Transitions**:
- `completed` toggles between True and False via the mark_complete operation

## Shared State

### Task List
**Description**: In-memory list of Task objects maintained by the CLI session.

**Operations**:
- Add: Append new Task objects to the list
- Delete: Remove Task objects by ID
- Update: Modify Task fields in-place
- View: Read and display all Task objects
- Complete: Toggle the completed status of Task objects

**Constraints**:
- Each task ID must be unique within the list
- IDs are assigned sequentially starting from 1
- List persists for the duration of the CLI session