# Task: T-002, T-003 - Task dataclass and TaskStore
# From: specs/phase1-console/spec.md §2, specs/phase1-console/plan.md §2.1
"""
Data models for the Todo application.

Contains the Task dataclass and TaskStore for in-memory storage.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """
    Represents a todo task item.

    Attributes:
        id: Unique identifier (auto-generated)
        title: Task title (required, 1-200 chars)
        description: Task description (optional, max 500 chars)
        completed: Whether the task is completed
        created_at: Timestamp when task was created
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)


class TaskStore:
    """
    In-memory storage for Task objects.

    Provides CRUD operations with auto-incrementing IDs.
    """

    def __init__(self) -> None:
        """Initialize empty task store."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def generate_id(self) -> int:
        """
        Generate the next unique task ID.

        Returns:
            int: The next available ID.
        """
        current_id = self._next_id
        self._next_id += 1
        return current_id

    def add(self, task: Task) -> Task:
        """
        Add a task to the store.

        Args:
            task: The Task object to add.

        Returns:
            Task: The added task with assigned ID.
        """
        self._tasks[task.id] = task
        return task

    def get(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by ID.

        Args:
            task_id: The ID of the task to retrieve.

        Returns:
            Optional[Task]: The task if found, None otherwise.
        """
        return self._tasks.get(task_id)

    def get_all(self) -> list[Task]:
        """
        Retrieve all tasks sorted by ID.

        Returns:
            list[Task]: All tasks in order of creation.
        """
        return sorted(self._tasks.values(), key=lambda t: t.id)

    def update(self, task: Task) -> Task:
        """
        Update an existing task in the store.

        Args:
            task: The Task object with updated values.

        Returns:
            Task: The updated task.
        """
        self._tasks[task.id] = task
        return task

    def delete(self, task_id: int) -> bool:
        """
        Remove a task from the store.

        Args:
            task_id: The ID of the task to delete.

        Returns:
            bool: True if task was deleted, False if not found.
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def count(self) -> int:
        """
        Get the total number of tasks.

        Returns:
            int: Number of tasks in store.
        """
        return len(self._tasks)

    def count_completed(self) -> int:
        """
        Get the number of completed tasks.

        Returns:
            int: Number of completed tasks.
        """
        return sum(1 for task in self._tasks.values() if task.completed)
