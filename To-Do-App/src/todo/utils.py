# Task: T-006 - Utility functions
# From: specs/phase1-console/plan.md §2.4
"""
Utility functions for the Todo application.

Contains helpers for input handling, formatting, and display.
"""

import os
from typing import Optional

from .models import Task


def clear_screen() -> None:
    """Clear the terminal screen (cross-platform)."""
    os.system('cls' if os.name == 'nt' else 'clear')


def get_input(prompt: str, required: bool = False) -> str:
    """
    Get user input with optional required validation.

    Args:
        prompt: The prompt to display.
        required: If True, empty input is not accepted.

    Returns:
        str: The user's input (stripped of whitespace).
    """
    while True:
        value = input(prompt).strip()
        if required and not value:
            print("  This field is required. Please enter a value.")
            continue
        return value


def get_int_input(prompt: str) -> Optional[int]:
    """
    Get integer input from user.

    Args:
        prompt: The prompt to display.

    Returns:
        Optional[int]: The integer if valid, None otherwise.
    """
    value = input(prompt).strip()
    try:
        return int(value)
    except ValueError:
        return None


def confirm(prompt: str) -> bool:
    """
    Ask user for yes/no confirmation.

    Args:
        prompt: The question to ask.

    Returns:
        bool: True if user confirmed (y/yes), False otherwise.
    """
    while True:
        response = input(f"{prompt} (y/n): ").strip().lower()
        if response in ('y', 'yes'):
            return True
        if response in ('n', 'no'):
            return False
        print("  Please enter 'y' or 'n'.")


def format_status(completed: bool) -> str:
    """
    Format task completion status as checkbox.

    Args:
        completed: Task completion status.

    Returns:
        str: "[X]" if completed, "[ ]" otherwise.
    """
    return "[X]" if completed else "[ ]"


def format_task(task: Task, show_description: bool = False) -> str:
    """
    Format a single task for display.

    Args:
        task: The task to format.
        show_description: Whether to include description.

    Returns:
        str: Formatted task string.
    """
    status = format_status(task.completed)
    line = f"[{task.id}] {status} {task.title}"

    if show_description and task.description:
        line += f"\n      Description: {task.description}"

    return line


def format_task_list(tasks: list[Task]) -> str:
    """
    Format a list of tasks for display.

    Args:
        tasks: List of tasks to format.

    Returns:
        str: Formatted task list with header and summary.
    """
    if not tasks:
        return "No tasks found. Add a task to get started!"

    lines = ["=" * 40]
    lines.append("           TODO LIST")
    lines.append("=" * 40)

    for task in tasks:
        lines.append(format_task(task))

    lines.append("=" * 40)

    total = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    lines.append(f"Total: {total} task(s) | Completed: {completed}")

    return "\n".join(lines)


def format_task_detail(task: Task) -> str:
    """
    Format detailed task information.

    Args:
        task: The task to format.

    Returns:
        str: Detailed task information.
    """
    status = "Completed" if task.completed else "Pending"
    lines = [
        "-" * 40,
        f"  Task ID: {task.id}",
        f"  Title: {task.title}",
        f"  Description: {task.description or '(none)'}",
        f"  Status: {status}",
        f"  Created: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
        "-" * 40,
    ]
    return "\n".join(lines)


def print_success(message: str) -> None:
    """Print a success message."""
    print(f"\n  SUCCESS: {message}\n")


def print_error(message: str) -> None:
    """Print an error message."""
    print(f"\n  ERROR: {message}\n")


def print_info(message: str) -> None:
    """Print an info message."""
    print(f"\n  INFO: {message}\n")


def press_enter_to_continue() -> None:
    """Wait for user to press Enter."""
    input("\nPress Enter to continue...")
