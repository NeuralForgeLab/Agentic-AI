# Task: T2-005 - Task API routes (Enhanced)
# Advanced task management with filtering, sorting, and stats
"""
Task CRUD API routes with JWT authentication and advanced features.
"""

from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, and_, or_, select

from ..auth import ForbiddenError, verify_token, verify_user_access
from ..database import get_session
from ..models import Priority, Task, TaskStatus
from ..schemas import Priority as SchemaPriority
from ..schemas import TaskCreate, TaskListResponse, TaskResponse, TaskStats, TaskUpdate
from ..schemas import TaskStatus as SchemaTaskStatus

router = APIRouter(prefix="/users/{user_id}/tasks", tags=["tasks"])


def get_task_stats(tasks: list[Task]) -> dict:
    """Calculate task statistics."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    week_end = today_start + timedelta(days=7)

    completed = sum(1 for t in tasks if t.completed)
    in_progress = sum(1 for t in tasks if t.status == TaskStatus.IN_PROGRESS)
    todo = sum(1 for t in tasks if t.status == TaskStatus.TODO)
    overdue = sum(
        1 for t in tasks if t.due_date and t.due_date < now and not t.completed
    )
    due_today = sum(
        1
        for t in tasks
        if t.due_date and today_start <= t.due_date < today_end and not t.completed
    )
    due_this_week = sum(
        1
        for t in tasks
        if t.due_date and today_start <= t.due_date < week_end and not t.completed
    )

    by_priority = {}
    for priority in Priority:
        by_priority[priority.value] = sum(1 for t in tasks if t.priority == priority)

    by_category = {}
    for task in tasks:
        cat = task.category or "Uncategorized"
        by_category[cat] = by_category.get(cat, 0) + 1

    return {
        "total": len(tasks),
        "completed": completed,
        "in_progress": in_progress,
        "todo": todo,
        "overdue": overdue,
        "due_today": due_today,
        "due_this_week": due_this_week,
        "by_priority": by_priority,
        "by_category": by_category,
    }


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
    status_filter: Optional[SchemaTaskStatus] = Query(None, alias="status"),
    priority: Optional[SchemaPriority] = None,
    category: Optional[str] = None,
    due_today: bool = False,
    overdue: bool = False,
    sort_by: str = Query("created_at", regex="^(created_at|due_date|priority|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    """
    List all tasks for a user with filtering and sorting.

    Filters:
    - status: todo, in_progress, completed, cancelled
    - priority: low, medium, high, urgent
    - category: category name
    - due_today: only tasks due today
    - overdue: only overdue tasks

    Sort by: created_at, due_date, priority, title
    """
    verify_user_access(token_user_id, user_id)

    statement = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if status_filter:
        statement = statement.where(Task.status == status_filter.value)
    if priority:
        statement = statement.where(Task.priority == priority.value)
    if category:
        statement = statement.where(Task.category == category)

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    if due_today:
        statement = statement.where(
            and_(
                Task.due_date >= today_start,
                Task.due_date < today_end,
                Task.completed == False,
            )
        )
    if overdue:
        statement = statement.where(and_(Task.due_date < now, Task.completed == False))

    # Apply sorting
    sort_column = getattr(Task, sort_by)
    if sort_order == "desc":
        statement = statement.order_by(sort_column.desc())
    else:
        statement = statement.order_by(sort_column.asc())

    tasks = session.exec(statement).all()

    # Calculate stats
    all_tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    stats = get_task_stats(all_tasks)

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        total=stats["total"],
        completed=stats["completed"],
        in_progress=stats["in_progress"],
        overdue=stats["overdue"],
        due_today=stats["due_today"],
    )


@router.get("/stats", response_model=TaskStats)
async def get_stats(
    user_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get task statistics for a user."""
    verify_user_access(token_user_id, user_id)

    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    stats = get_task_stats(tasks)

    return TaskStats(**stats)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Create a new task with all advanced fields."""
    verify_user_access(token_user_id, user_id)

    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority.value
        if task_data.priority
        else Priority.MEDIUM.value,
        status=task_data.status.value if task_data.status else TaskStatus.TODO.value,
        due_date=task_data.due_date,
        reminder_at=task_data.reminder_at,
        start_date=task_data.start_date,
        category=task_data.category,
        tags=task_data.tags,
        notes=task_data.notes,
        estimated_minutes=task_data.estimated_minutes,
        is_recurring=task_data.is_recurring,
        recurrence_pattern=task_data.recurrence_pattern,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get a specific task by ID."""
    verify_user_access(token_user_id, user_id)

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise ForbiddenError("Task belongs to another user")

    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update a task with any field."""
    verify_user_access(token_user_id, user_id)

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise ForbiddenError("Task belongs to another user")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field in ["priority", "status"] and hasattr(value, "value"):
                setattr(task, field, value.value)
            else:
                setattr(task, field, value)

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.post("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    user_id: str,
    task_id: int,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Toggle a task's completion status."""
    verify_user_access(token_user_id, user_id)

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise ForbiddenError("Task belongs to another user")

    task.completed = not task.completed
    task.status = (
        TaskStatus.COMPLETED.value if task.completed else TaskStatus.TODO.value
    )
    task.completed_at = datetime.utcnow() if task.completed else None
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.post("/{task_id}/status", response_model=TaskResponse)
async def update_status(
    user_id: str,
    task_id: int,
    new_status: SchemaTaskStatus,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update task status (todo, in_progress, completed, cancelled)."""
    verify_user_access(token_user_id, user_id)

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise ForbiddenError("Task belongs to another user")

    task.status = new_status.value
    task.completed = new_status == SchemaTaskStatus.COMPLETED
    task.completed_at = datetime.utcnow() if task.completed else None
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: int,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Delete a task."""
    verify_user_access(token_user_id, user_id)

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise ForbiddenError("Task belongs to another user")

    session.delete(task)
    session.commit()

    return None
