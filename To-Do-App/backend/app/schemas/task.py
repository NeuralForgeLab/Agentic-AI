# Task: T2-003 - Pydantic schemas for Task (Enhanced)
# Advanced task management schemas
"""
Pydantic schemas for Task API request/response validation.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


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


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Priority = Field(default=Priority.MEDIUM)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    start_date: Optional[datetime] = None
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=2000)
    estimated_minutes: Optional[int] = Field(None, ge=0)
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = Field(None, max_length=50)


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    start_date: Optional[datetime] = None
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=2000)
    estimated_minutes: Optional[int] = Field(None, ge=0)
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = Field(None, max_length=50)


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    completed: bool
    completed_at: Optional[datetime]
    priority: Priority
    due_date: Optional[datetime]
    reminder_at: Optional[datetime]
    start_date: Optional[datetime]
    category: Optional[str]
    tags: Optional[str]
    notes: Optional[str]
    estimated_minutes: Optional[int]
    is_recurring: bool
    recurrence_pattern: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for task list response with stats."""

    tasks: List[TaskResponse]
    total: int
    completed: int
    in_progress: int
    overdue: int
    due_today: int


class TaskStats(BaseModel):
    """Schema for task statistics."""

    total: int
    completed: int
    in_progress: int
    todo: int
    overdue: int
    due_today: int
    due_this_week: int
    by_priority: dict
    by_category: dict
