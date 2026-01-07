"""Todo service for task operations."""
from typing import List, Optional

from src.models.task import Task


def add_task(tasks: List[Task], title: str, description: str = "") -> Task:
    """Add a new task to the task list.

    Creates a new Task object with a unique ID and adds it to the task list.
    The ID is assigned as the next sequential number after the highest existing ID.

    Args:
        tasks: List of Task objects to append to.
        title: Title of the new task.
        description: Optional description of the new task.

    Returns:
        The newly created Task object.

    Side Effects:
        Appends a new Task to the tasks list.
        Prints confirmation message to stdout.

    Examples:
        >>> tasks = []
        >>> task = add_task(tasks, "Buy milk", "2% milk for coffee")
        Task added: ID 1 - Buy milk
        >>> len(tasks)
        1
        >>> tasks[0].id
        1
    """
    # Validate inputs
    if not isinstance(title, str) or len(title.strip()) == 0:
        raise ValueError("Task title cannot be empty.")
    if not isinstance(description, str):
        raise ValueError("Task description must be a string.")

    # Calculate new ID as max ID + 1, or 1 if list is empty
    new_id = 1
    if tasks:
        new_id = max(task.id for task in tasks) + 1

    # Create and add new task
    task = Task(id=new_id, title=title.strip(), description=description.strip())
    tasks.append(task)

    # Print confirmation message
    print(f"Task added: ID {new_id} - {title.strip()}")

    return task


def delete_task(tasks: List[Task], task_id: int) -> None:
    """Delete a task from the task list by its ID.

    Args:
        tasks: List of Task objects to search through.
        task_id: Unique identifier of the task to delete.

    Raises:
        ValueError: If task list is empty or task_id not found.

    Side Effects:
        Removes the task from the tasks list.
        Prints confirmation message to stdout.

    Examples:
        >>> tasks = [Task(id=1, title="Buy milk")]
        >>> delete_task(tasks, 1)
        Task deleted: ID 1 - Buy milk
        >>> len(tasks)
        0
    """
    # Check if task list is empty
    if not tasks:
        raise ValueError("No tasks available to delete")

    # Validate task_id is positive integer
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValueError(f"Invalid task ID: {task_id}. Must be positive integer.")

    # Find and remove task by ID
    for i, task in enumerate(tasks):
        if task.id == task_id:
            removed_task = tasks.pop(i)
            print(f"Task deleted: ID {task_id} - {removed_task.title}")
            return

    # If we get here, the task was not found
    raise ValueError(f"Task ID not found: {task_id}")


def update_task(tasks: List[Task], task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> None:
    """Update a task's title and/or description by its ID.

    Args:
        tasks: List of Task objects to search through.
        task_id: Unique identifier of the task to update.
        title: New title for the task (optional).
        description: New description for the task (optional).

    Raises:
        ValueError: If task list is empty, task_id not found, or title is empty.

    Side Effects:
        Modifies the task's title and/or description in-place.
        Prints confirmation message to stdout.

    Examples:
        >>> tasks = [Task(id=1, title="Buy milk", description="2% milk")]
        >>> update_task(tasks, 1, "Buy almond milk")
        Task updated: ID 1 - Buy almond milk
    """
    # Check if task list is empty
    if not tasks:
        raise ValueError("No tasks available to update")

    # Validate task_id is positive integer
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValueError(f"Invalid task ID: {task_id}. Must be positive integer.")

    # Validate title if provided
    if title is not None and (not isinstance(title, str) or len(title.strip()) == 0):
        raise ValueError("Task title cannot be empty.")

    # Find task by ID
    try:
        task = next((t for t in tasks if t.id == task_id))
    except StopIteration:
        raise ValueError(f"Task ID not found: {task_id}")

    # Update fields if provided
    if title is not None:
        task.title = title.strip()
    if description is not None:
        task.description = description.strip()

    # Print confirmation message
    print(f"Task updated: ID {task_id} - {task.title}")


def view_tasks(tasks: List[Task]) -> None:
    """Display all tasks in the task list.

    Args:
        tasks: List of Task objects to display.

    Side Effects:
        Prints formatted task list to stdout.

    Examples:
        >>> tasks = [Task(id=1, title="Buy milk", completed=True)]
        >>> view_tasks(tasks)
        [X] 1 - Buy milk
    """
    if not tasks:
        print("No tasks found.")
        return

    # Sort tasks by ID for consistent display
    sorted_tasks = sorted(tasks, key=lambda t: t.id)

    for task in sorted_tasks:
        status = "[X]" if task.completed else "[ ]"
        print(f"{status} {task.id} - {task.title}")
        if task.description:
            print(f"      Description: {task.description}")


def mark_complete(tasks: List[Task], task_id: int) -> None:
    """Toggle the completion status of a task by its ID.

    Finds the task with the given ID and toggles its `completed` field
    between True (complete) and False (incomplete).

    Args:
        tasks: List of Task objects to search through.
        task_id: Unique identifier of the task to toggle.

    Raises:
        ValueError: If task list is empty or task_id not found.

    Side Effects:
        Modifies the task's `completed` field in-place.
        Prints confirmation message to stdout.

    Examples:
        >>> tasks = [Task(id=1, title="Buy milk", completed=False)]
        >>> mark_complete(tasks, 1)
        Task marked as complete: ID 1 - Buy milk
        >>> tasks[0].completed
        True
        >>> mark_complete(tasks, 1)
        Task marked as incomplete: ID 1 - Buy milk
    """
    # Check if task list is empty
    if not tasks:
        raise ValueError("No tasks available to mark")

    # Validate task_id is positive integer
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValueError(f"Invalid task ID: {task_id}. Must be positive integer.")

    # Find task by ID using linear search
    try:
        task = next((t for t in tasks if t.id == task_id))
    except StopIteration:
        raise ValueError(f"Task ID not found: {task_id}")

    # Toggle completed status
    new_status = "complete" if not task.completed else "incomplete"
    task.completed = not task.completed

    # Print confirmation message
    print(f"Task marked as {new_status}: ID {task_id} - {task.title}")
