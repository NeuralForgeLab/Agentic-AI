# Task: T3-004 - Function router
# From: specs/phase3-ai-chatbot/plan.md §2.3, specs/phase3-ai-chatbot/spec.md §5.1
"""
Router for executing AI function calls on actual task operations.
"""

from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from ..models import Task


class FunctionRouter:
    """Routes AI function calls to actual task operations."""

    def __init__(self, session: Session, user_id: str):
        """
        Initialize the function router.

        Args:
            session: Database session for task operations
            user_id: The authenticated user's ID
        """
        self.session = session
        self.user_id = user_id

    def execute(self, function_name: str, args: dict) -> dict:
        """
        Execute a function call and return the result.

        Args:
            function_name: Name of the function to execute
            args: Arguments for the function

        Returns:
            dict with action type and relevant data
        """
        handlers = {
            "create_task": self._create_task,
            "list_tasks": self._list_tasks,
            "update_task": self._update_task,
            "delete_task": self._delete_task,
            "toggle_task": self._toggle_task,
        }

        handler = handlers.get(function_name)
        if not handler:
            return {"type": "error", "message": f"Unknown function: {function_name}"}

        try:
            return handler(args)
        except Exception as e:
            return {"type": "error", "message": str(e)}

    def _create_task(self, args: dict) -> dict:
        """Create a new task."""
        title = args.get("title")
        if not title:
            return {"type": "error", "message": "Title is required to create a task"}

        description = args.get("description")

        task = Task(
            user_id=self.user_id,
            title=title,
            description=description,
        )

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return {
            "type": "task_created",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat(),
            },
        }

    def _list_tasks(self, args: dict) -> dict:
        """List tasks with optional status filter."""
        status_filter = args.get("status", "all")

        statement = select(Task).where(Task.user_id == self.user_id)

        if status_filter == "completed":
            statement = statement.where(Task.completed == True)
        elif status_filter == "active":
            statement = statement.where(Task.completed == False)

        statement = statement.order_by(Task.created_at.desc())
        tasks = self.session.exec(statement).all()

        completed_count = sum(1 for task in tasks if task.completed)

        return {
            "type": "tasks_listed",
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                }
                for task in tasks
            ],
            "total": len(tasks),
            "completed": completed_count,
            "filter": status_filter,
        }

    def _update_task(self, args: dict) -> dict:
        """Update an existing task."""
        task_id = args.get("task_id")
        if not task_id:
            return {"type": "error", "message": "Task ID is required"}

        task = self.session.get(Task, task_id)

        if not task:
            return {"type": "error", "message": f"Task {task_id} not found"}

        if task.user_id != self.user_id:
            return {"type": "error", "message": "You can only update your own tasks"}

        # Update provided fields
        if "title" in args and args["title"]:
            task.title = args["title"]
        if "description" in args:
            task.description = args["description"]

        task.updated_at = datetime.utcnow()

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return {
            "type": "task_updated",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat(),
            },
        }

    def _delete_task(self, args: dict) -> dict:
        """Delete a task."""
        task_id = args.get("task_id")
        if not task_id:
            return {"type": "error", "message": "Task ID is required"}

        task = self.session.get(Task, task_id)

        if not task:
            return {"type": "error", "message": f"Task {task_id} not found"}

        if task.user_id != self.user_id:
            return {"type": "error", "message": "You can only delete your own tasks"}

        task_title = task.title
        self.session.delete(task)
        self.session.commit()

        return {
            "type": "task_deleted",
            "task_id": task_id,
            "title": task_title,
        }

    def _toggle_task(self, args: dict) -> dict:
        """Toggle task completion status."""
        task_id = args.get("task_id")
        if not task_id:
            return {"type": "error", "message": "Task ID is required"}

        task = self.session.get(Task, task_id)

        if not task:
            return {"type": "error", "message": f"Task {task_id} not found"}

        if task.user_id != self.user_id:
            return {"type": "error", "message": "You can only modify your own tasks"}

        task.completed = not task.completed
        task.updated_at = datetime.utcnow()

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return {
            "type": "task_toggled",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat(),
            },
        }
