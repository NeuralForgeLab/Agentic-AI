# Task: T-007 - CLI main application
# From: specs/phase1-console/plan.md §2.3, specs/phase1-console/spec.md §4
"""
Main CLI application for the Todo app.

Entry point and user interface for all todo operations.
"""

from .exceptions import TaskError, TaskNotFoundError
from .models import TaskStore
from .task_service import TaskService
from .utils import (
    clear_screen,
    confirm,
    format_task_detail,
    format_task_list,
    get_input,
    get_int_input,
    press_enter_to_continue,
    print_error,
    print_info,
    print_success,
)


class TodoApp:
    """
    Command-line Todo application controller.

    Manages the main loop, menu display, and user interactions.
    """

    def __init__(self) -> None:
        """Initialize the application with store and service."""
        self._store = TaskStore()
        self._service = TaskService(self._store)
        self._running = True

    def display_menu(self) -> None:
        """Display the main menu."""
        print()
        print("=" * 44)
        print("        TODO APPLICATION - Phase I By Mansoor Siddiqui & Zeeshan Zubair")
        print("=" * 44)
        print()
        print("  Select an option:")
        print()
        print("    1. Add Task")
        print("    2. View All Tasks")
        print("    3. Update Task")
        print("    4. Delete Task")
        print("    5. Mark Complete/Incomplete")
        print("    6. Exit")
        print()

    def handle_choice(self, choice: int) -> None:
        """
        Route menu choice to appropriate handler.

        Args:
            choice: The user's menu selection (1-6).
        """
        handlers = {
            1: self.add_task,
            2: self.view_tasks,
            3: self.update_task,
            4: self.delete_task,
            5: self.toggle_complete,
            6: self.exit_app,
        }

        handler = handlers.get(choice)
        if handler:
            handler()
        else:
            print_error("Invalid choice. Please select 1-6.")

    def add_task(self) -> None:
        """Handle adding a new task (Feature F-001)."""
        print()
        print("-" * 44)
        print("            ADD NEW TASK")
        print("-" * 44)
        print()

        try:
            title = get_input("  Enter task title: ", required=True)
            description = get_input("  Enter description (optional): ")

            task = self._service.create_task(title, description)
            print_success(f"Task #{task.id} created: '{task.title}'")

        except TaskError as e:
            print_error(str(e))

        press_enter_to_continue()

    def view_tasks(self) -> None:
        """Handle viewing all tasks (Feature F-002)."""
        print()
        tasks = self._service.list_tasks()
        print(format_task_list(tasks))
        print()
        press_enter_to_continue()

    def update_task(self) -> None:
        """Handle updating an existing task (Feature F-003)."""
        print()
        print("-" * 44)
        print("            UPDATE TASK")
        print("-" * 44)
        print()

        task_id = get_int_input("  Enter task ID to update: ")
        if task_id is None:
            print_error("Invalid input. Please enter a number.")
            press_enter_to_continue()
            return

        try:
            task = self._service.get_task(task_id)
            print()
            print("  Current task details:")
            print(format_task_detail(task))
            print()

            print("  (Press Enter to keep current value)")
            new_title = get_input(f"  New title [{task.title}]: ")
            new_desc = get_input(
                f"  New description [{task.description or '(none)'}]: "
            )

            # Only update if new value provided
            title = new_title if new_title else None
            description = new_desc if new_desc else None

            if title is None and description is None:
                print_info("No changes made.")
            else:
                updated = self._service.update_task(task_id, title, description)
                print_success(f"Task #{updated.id} updated successfully.")

        except TaskError as e:
            print_error(str(e))

        press_enter_to_continue()

    def delete_task(self) -> None:
        """Handle deleting a task (Feature F-004)."""
        print()
        print("-" * 44)
        print("            DELETE TASK")
        print("-" * 44)
        print()

        task_id = get_int_input("  Enter task ID to delete: ")
        if task_id is None:
            print_error("Invalid input. Please enter a number.")
            press_enter_to_continue()
            return

        try:
            task = self._service.get_task(task_id)
            print()
            print("  Task to delete:")
            print(format_task_detail(task))
            print()

            if confirm("  Are you sure you want to delete this task?"):
                self._service.delete_task(task_id)
                print_success(f"Task #{task_id} '{task.title}' deleted.")
            else:
                print_info("Deletion cancelled.")

        except TaskError as e:
            print_error(str(e))

        press_enter_to_continue()

    def toggle_complete(self) -> None:
        """Handle toggling task completion (Feature F-005)."""
        print()
        print("-" * 44)
        print("        TOGGLE COMPLETION STATUS")
        print("-" * 44)
        print()

        task_id = get_int_input("  Enter task ID to toggle: ")
        if task_id is None:
            print_error("Invalid input. Please enter a number.")
            press_enter_to_continue()
            return

        try:
            task = self._service.toggle_complete(task_id)
            status = "COMPLETED" if task.completed else "PENDING"
            print_success(f"Task #{task.id} '{task.title}' marked as {status}.")

        except TaskError as e:
            print_error(str(e))

        press_enter_to_continue()

    def exit_app(self) -> None:
        """Handle application exit."""
        print()
        print("-" * 44)
        print("               EXIT")
        print("-" * 44)
        print()
        print_info("Note: All tasks will be lost (in-memory storage).")

        if confirm("  Are you sure you want to exit?"):
            self._running = False
            print()
            print("  Thank you for using Todo App!")
            print("  Goodbye!")
            print()
        else:
            print_info("Exit cancelled.")
            press_enter_to_continue()

    def run(self) -> None:
        """Main application loop."""
        clear_screen()
        print()
        print("  Welcome to Todo Application - Phase I")
        print("  Spec-Driven Development Hackathon II")
        print()
        press_enter_to_continue()

        while self._running:
            clear_screen()
            self.display_menu()

            choice = get_int_input("  Enter choice (1-6): ")
            if choice is None:
                print_error("Invalid input. Please enter a number.")
                press_enter_to_continue()
                continue

            self.handle_choice(choice)


def main() -> None:
    """Entry point for the Todo application."""
    try:
        app = TodoApp()
        app.run()
    except KeyboardInterrupt:
        print("\n\n  Application interrupted. Goodbye!\n")


if __name__ == "__main__":
    main()
