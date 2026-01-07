"""Task model for Todo application."""
from dataclasses import dataclass
from typing import List


@dataclass
class Task:
    """Represents a todo item in the in-memory Todo list.

    Attributes:
        id: Unique identifier for the task (positive integer).
        title: Task name/title (non-empty string).
        description: Optional details about the task (can be empty).
        completed: Current completion status (True = complete, False = incomplete).
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False

    def __post_init__(self):
        """Validate task fields after initialization."""
        if not isinstance(self.id, int) or self.id <= 0:
            raise ValueError(f"Invalid task ID: {self.id}. Must be positive integer.")
        if not isinstance(self.title, str) or len(self.title.strip()) == 0:
            raise ValueError("Task title cannot be empty.")
        if not isinstance(self.description, str):
            raise ValueError("Task description must be a string.")
        if not isinstance(self.completed, bool):
            raise ValueError("Task completed status must be boolean.")
