# Task: T-005 - TaskService class
# From: specs/phase1-console/plan.md §2.2, specs/phase1-console/spec.md §3
"""
Service layer for task operations.

Contains business logic and validation for all task operations.
"""

from typing import Optional

from .models import Task, TaskStore
from .exceptions import (
    TaskNotFoundError,
    EmptyTitleError,
    TitleTooLongError,
    DescriptionTooLongError,
)


class TaskService:
    """
    Business logic layer for task operations.

    Handles validation, error handling, and coordination with TaskStore.
    """

    TITLE_MAX_LENGTH = 200
    DESCRIPTION_MAX_LENGTH = 500

    def __init__(self, store: TaskStore) -> None:
        """
        Initialize TaskService with a TaskStore.

        Args:
            store: The TaskStore instance for data persistence.
        """
        self._store = store

    def _validate_title(self, title: str) -> str:
        """
        Validate and clean task title.

        Args:
            title: The title to validate.

        Returns:
            str: Cleaned title.

        Raises:
            EmptyTitleError: If title is empty or whitespace.
            TitleTooLongError: If title exceeds maximum length.
        """
        cleaned = title.strip()
        if not cleaned:
            raise EmptyTitleError()
        if len(cleaned) > self.TITLE_MAX_LENGTH:
            raise TitleTooLongError(len(cleaned))
        return cleaned

    def _validate_description(self, description: str) -> str:
        """
        Validate and clean task description.

        Args:
            description: The description to validate.

        Returns:
            str: Cleaned description.

        Raises:
            DescriptionTooLongError: If description exceeds maximum length.
        """
        cleaned = description.strip()
        if len(cleaned) > self.DESCRIPTION_MAX_LENGTH:
            raise DescriptionTooLongError(len(cleaned))
        return cleaned

    def create_task(self, title: str, description: str = "") -> Task:
        """
        Create a new task with validation.

        Args:
            title: The task title (required).
            description: The task description (optional).

        Returns:
            Task: The created task with assigned ID.

        Raises:
            EmptyTitleError: If title is empty.
            TitleTooLongError: If title exceeds max length.
            DescriptionTooLongError: If description exceeds max length.
        """
        validated_title = self._validate_title(title)
        validated_description = self._validate_description(description)

        task = Task(
            id=self._store.generate_id(),
            title=validated_title,
            description=validated_description,
        )
        return self._store.add(task)

    def get_task(self, task_id: int) -> Task:
        """
        Retrieve a task by ID.

        Args:
            task_id: The ID of the task to retrieve.

        Returns:
            Task: The requested task.

        Raises:
            TaskNotFoundError: If task does not exist.
        """
        task = self._store.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def list_tasks(self) -> list[Task]:
        """
        Retrieve all tasks sorted by ID.

        Returns:
            list[Task]: All tasks in creation order.
        """
        return self._store.get_all()

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Task:
        """
        Update an existing task.

        Only provided fields are updated; None values keep current value.

        Args:
            task_id: The ID of the task to update.
            title: New title (optional).
            description: New description (optional).

        Returns:
            Task: The updated task.

        Raises:
            TaskNotFoundError: If task does not exist.
            EmptyTitleError: If title is provided but empty.
            TitleTooLongError: If title exceeds max length.
            DescriptionTooLongError: If description exceeds max length.
        """
        task = self.get_task(task_id)

        if title is not None:
            task.title = self._validate_title(title)
        if description is not None:
            task.description = self._validate_description(description)

        return self._store.update(task)

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by ID.

        Args:
            task_id: The ID of the task to delete.

        Returns:
            bool: True if task was deleted.

        Raises:
            TaskNotFoundError: If task does not exist.
        """
        # Verify task exists before deletion
        self.get_task(task_id)
        return self._store.delete(task_id)

    def toggle_complete(self, task_id: int) -> Task:
        """
        Toggle the completion status of a task.

        Args:
            task_id: The ID of the task to toggle.

        Returns:
            Task: The task with updated completion status.

        Raises:
            TaskNotFoundError: If task does not exist.
        """
        task = self.get_task(task_id)
        task.completed = not task.completed
        return self._store.update(task)

    def get_stats(self) -> tuple[int, int]:
        """
        Get task statistics.

        Returns:
            tuple[int, int]: (total_count, completed_count)
        """
        return self._store.count(), self._store.count_completed()
