# Task: T-004 - Custom exceptions
# From: specs/phase1-console/plan.md §3.1, specs/phase1-console/spec.md §5
"""
Custom exceptions for the Todo application.

Provides typed exceptions for different error scenarios.
"""


class TaskError(Exception):
    """
    Base exception for task-related errors.

    All task-specific exceptions should inherit from this class.
    """
    pass


class TaskNotFoundError(TaskError):
    """
    Raised when a task with the specified ID does not exist.

    Attributes:
        task_id: The ID that was not found.
    """

    def __init__(self, task_id: int) -> None:
        self.task_id = task_id
        super().__init__(f"Task with ID {task_id} not found")


class ValidationError(TaskError):
    """
    Raised when input validation fails.

    Attributes:
        field: The field that failed validation.
        message: Description of the validation failure.
    """

    def __init__(self, field: str, message: str) -> None:
        self.field = field
        self.message = message
        super().__init__(f"Validation error for '{field}': {message}")


class EmptyTitleError(ValidationError):
    """Raised when task title is empty or whitespace only."""

    def __init__(self) -> None:
        super().__init__("title", "Title cannot be empty")


class TitleTooLongError(ValidationError):
    """Raised when task title exceeds maximum length."""

    MAX_LENGTH = 200

    def __init__(self, actual_length: int) -> None:
        super().__init__(
            "title",
            f"Title exceeds maximum length of {self.MAX_LENGTH} characters (got {actual_length})"
        )


class DescriptionTooLongError(ValidationError):
    """Raised when task description exceeds maximum length."""

    MAX_LENGTH = 500

    def __init__(self, actual_length: int) -> None:
        super().__init__(
            "description",
            f"Description exceeds maximum length of {self.MAX_LENGTH} characters (got {actual_length})"
        )
