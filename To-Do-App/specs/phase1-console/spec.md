# Phase I Specification: Todo In-Memory Python Console App

## 1. Overview

### 1.1 Purpose
Build a command-line todo application that stores tasks in memory using Python, demonstrating Spec-Driven Development principles.

### 1.2 Scope
- In-memory task storage (no persistence)
- Command-line interface for user interaction
- Basic CRUD operations for todo items

### 1.3 Technology Stack
| Component | Technology |
|-----------|------------|
| Language | Python 3.13+ |
| Package Manager | UV |
| Storage | In-memory (list/dict) |
| Interface | CLI (command-line) |

---

## 2. Data Model

### 2.1 Task Entity
```python
class Task:
    id: int              # Auto-generated, unique identifier
    title: str           # Task title (required, 1-200 chars)
    description: str     # Task description (optional, max 500 chars)
    completed: bool      # Completion status (default: False)
    created_at: datetime # Creation timestamp
```

### 2.2 Constraints
- `id`: Must be positive integer, auto-incremented
- `title`: Required, non-empty, max 200 characters
- `description`: Optional, max 500 characters
- `completed`: Boolean, defaults to False

---

## 3. Features Specification

### 3.1 Feature: Add Task
**ID**: F-001

**Description**: User can create a new todo item with title and optional description.

**User Story**: As a user, I want to add a new task so that I can track my todos.

**Acceptance Criteria**:
- [ ] AC-001-1: System prompts for task title
- [ ] AC-001-2: System prompts for optional description
- [ ] AC-001-3: Task is assigned unique auto-incremented ID
- [ ] AC-001-4: Task is created with completed=False
- [ ] AC-001-5: Success message displays task ID and title
- [ ] AC-001-6: Empty title is rejected with error message

**Input**: Title (required), Description (optional)
**Output**: Success message with task ID, or error message

---

### 3.2 Feature: View Task List
**ID**: F-002

**Description**: User can view all tasks in the todo list.

**User Story**: As a user, I want to see all my tasks so that I can know what needs to be done.

**Acceptance Criteria**:
- [ ] AC-002-1: Display all tasks with ID, title, and status
- [ ] AC-002-2: Show completion status indicator (e.g., [X] or [ ])
- [ ] AC-002-3: Show message if no tasks exist
- [ ] AC-002-4: Tasks displayed in order of creation (by ID)

**Input**: None
**Output**: Formatted list of tasks or "No tasks" message

**Display Format**:
```
=== Todo List ===
[1] [ ] Buy groceries
[2] [X] Call mom
[3] [ ] Finish report
================
Total: 3 tasks (1 completed)
```

---

### 3.3 Feature: Update Task
**ID**: F-003

**Description**: User can modify the title and/or description of an existing task.

**User Story**: As a user, I want to update a task so that I can correct or change task details.

**Acceptance Criteria**:
- [ ] AC-003-1: System prompts for task ID to update
- [ ] AC-003-2: System shows current task details
- [ ] AC-003-3: User can update title (enter to keep current)
- [ ] AC-003-4: User can update description (enter to keep current)
- [ ] AC-003-5: Invalid task ID shows error message
- [ ] AC-003-6: Success message confirms update

**Input**: Task ID, New title (optional), New description (optional)
**Output**: Success message or error message

---

### 3.4 Feature: Delete Task
**ID**: F-004

**Description**: User can remove a task from the todo list.

**User Story**: As a user, I want to delete a task so that I can remove completed or unwanted items.

**Acceptance Criteria**:
- [ ] AC-004-1: System prompts for task ID to delete
- [ ] AC-004-2: System confirms deletion before removing
- [ ] AC-004-3: Task is removed from list upon confirmation
- [ ] AC-004-4: Invalid task ID shows error message
- [ ] AC-004-5: Cancelled deletion keeps task in list
- [ ] AC-004-6: Success message confirms deletion

**Input**: Task ID, Confirmation (y/n)
**Output**: Success message or cancellation message

---

### 3.5 Feature: Mark as Complete/Incomplete
**ID**: F-005

**Description**: User can toggle the completion status of a task.

**User Story**: As a user, I want to mark tasks as complete or incomplete so that I can track progress.

**Acceptance Criteria**:
- [ ] AC-005-1: System prompts for task ID
- [ ] AC-005-2: Task status is toggled (complete <-> incomplete)
- [ ] AC-005-3: Invalid task ID shows error message
- [ ] AC-005-4: Success message shows new status

**Input**: Task ID
**Output**: Success message with new status

---

## 4. User Interface Specification

### 4.1 Main Menu
```
================================
    TODO APPLICATION - Phase I
================================

Select an option:
  1. Add Task
  2. View All Tasks
  3. Update Task
  4. Delete Task
  5. Mark Complete/Incomplete
  6. Exit

Enter choice (1-6): _
```

### 4.2 Input Validation
- Non-numeric input for menu: "Invalid input. Please enter a number."
- Out of range menu choice: "Invalid choice. Please select 1-6."
- Empty required field: "This field is required."
- Task ID not found: "Task with ID {id} not found."

### 4.3 Exit Behavior
- Display goodbye message
- Warn that data will be lost (in-memory)
- Graceful shutdown

---

## 5. Error Handling

### 5.1 Error Categories
| Error Type | Message Template |
|------------|-----------------|
| InvalidInput | "Invalid input: {details}" |
| TaskNotFound | "Task with ID {id} not found" |
| EmptyTitle | "Title cannot be empty" |
| ValidationError | "{field} exceeds maximum length" |

### 5.2 Recovery
- All errors should return user to main menu
- No crashes on invalid input
- Clear error messages guide user

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Operations should complete instantly (in-memory)
- No noticeable delay for < 1000 tasks

### 6.2 Usability
- Clear prompts and instructions
- Consistent formatting throughout
- Simple navigation (numeric menu)

### 6.3 Maintainability
- Modular code structure
- Separation of concerns (UI, logic, data)
- Clear function and variable names

---

## 7. Out of Scope
- Data persistence (database/file storage)
- User authentication
- Due dates and reminders
- Task priorities or categories
- Search and filtering
- Recurring tasks
