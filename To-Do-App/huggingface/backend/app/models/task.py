# Task: T2-003 - Task SQLModel (Enhanced)
# Advanced task management with priority, due dates, reminders, categories
"""
Task database model using SQLModel with advanced features.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Priority(str, Enum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, Enum):
    """Task status options."""

    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(SQLModel, table=True):
    """
    Task database model with advanced features.

    Includes: priority, due dates, reminders, categories, and more.
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, description="Owner's user ID")

    # Basic fields
    title: str = Field(max_length=200, description="Task title")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Task description"
    )

    # Status and completion
    status: TaskStatus = Field(default=TaskStatus.TODO, index=True)
    completed: bool = Field(default=False, index=True)
    completed_at: Optional[datetime] = Field(default=None)

    # Priority
    priority: Priority = Field(default=Priority.MEDIUM, index=True)

    # Dates and times
    due_date: Optional[datetime] = Field(default=None, index=True)
    reminder_at: Optional[datetime] = Field(default=None)
    start_date: Optional[datetime] = Field(default=None)

    # Organization
    category: Optional[str] = Field(default=None, max_length=50, index=True)
    tags: Optional[str] = Field(default=None, max_length=200)  # Comma-separated tags

    # Additional info
    notes: Optional[str] = Field(default=None, max_length=2000)
    estimated_minutes: Optional[int] = Field(default=None)

    # Recurring tasks
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = Field(
        default=None, max_length=50
    )  # daily, weekly, monthly

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
