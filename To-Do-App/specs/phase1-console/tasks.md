# Phase I Tasks: Todo Console App Implementation

## Task Overview

| Task ID | Description | Status | Dependencies |
|---------|-------------|--------|--------------|
| T-001 | Create pyproject.toml and package structure | pending | - |
| T-002 | Implement Task dataclass model | pending | T-001 |
| T-003 | Implement TaskStore class | pending | T-002 |
| T-004 | Implement custom exceptions | pending | T-001 |
| T-005 | Implement TaskService class | pending | T-003, T-004 |
| T-006 | Implement utility functions | pending | T-001 |
| T-007 | Implement CLI main application | pending | T-005, T-006 |
| T-008 | Create README.md | pending | T-007 |

---

## Detailed Tasks

### T-001: Create pyproject.toml and Package Structure
**From**: plan.md §8, constitution.md
**Priority**: High
**Estimate**: Small

**Description**: Initialize the Python project with UV and create the package structure.

**Preconditions**: None

**Acceptance Criteria**:
- [ ] pyproject.toml created with Python 3.13+ requirement
- [ ] src/todo/ directory structure created
- [ ] __init__.py files in place
- [ ] Project can be imported as a module

**Artifacts to Modify**:
- Create: `pyproject.toml`
- Create: `src/todo/__init__.py`

---

### T-002: Implement Task Dataclass Model
**From**: spec.md §2.1, plan.md §2.1
**Priority**: High
**Estimate**: Small

**Description**: Create the Task dataclass with all required fields.

**Preconditions**: T-001 completed

**Acceptance Criteria**:
- [ ] Task dataclass with id, title, description, completed, created_at fields
- [ ] Type hints for all fields
- [ ] Default values: completed=False, description=""
- [ ] created_at auto-populated with current datetime

**Artifacts to Modify**:
- Create: `src/todo/models.py`

**Code Reference**:
```python
@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

---

### T-003: Implement TaskStore Class
**From**: plan.md §2.1
**Priority**: High
**Estimate**: Medium

**Description**: Create the in-memory storage class for tasks.

**Preconditions**: T-002 completed

**Acceptance Criteria**:
- [ ] TaskStore class with internal dict storage
- [ ] Auto-incrementing ID generation
- [ ] add() method returns Task with assigned ID
- [ ] get() method returns Task or None
- [ ] get_all() method returns list of all tasks
- [ ] update() method updates existing task
- [ ] delete() method removes task and returns success boolean

**Artifacts to Modify**:
- Update: `src/todo/models.py`

---

### T-004: Implement Custom Exceptions
**From**: plan.md §3.1, spec.md §5
**Priority**: High
**Estimate**: Small

**Description**: Create custom exception classes for error handling.

**Preconditions**: T-001 completed

**Acceptance Criteria**:
- [ ] TaskError base exception
- [ ] TaskNotFoundError exception
- [ ] ValidationError exception
- [ ] Descriptive error messages

**Artifacts to Modify**:
- Create: `src/todo/exceptions.py`

---

### T-005: Implement TaskService Class
**From**: plan.md §2.2, spec.md §3
**Priority**: High
**Estimate**: Medium

**Description**: Create the service layer with business logic and validation.

**Preconditions**: T-003, T-004 completed

**Acceptance Criteria**:
- [ ] TaskService class with TaskStore dependency
- [ ] create_task() with title validation (required, max 200 chars)
- [ ] get_task() raises TaskNotFoundError if not found
- [ ] list_tasks() returns all tasks sorted by ID
- [ ] update_task() validates task exists, updates only provided fields
- [ ] delete_task() validates task exists before deletion
- [ ] toggle_complete() flips completed status

**Artifacts to Modify**:
- Create: `src/todo/task_service.py`

---

### T-006: Implement Utility Functions
**From**: plan.md §2.4
**Priority**: Medium
**Estimate**: Small

**Description**: Create helper functions for input handling and formatting.

**Preconditions**: T-001 completed

**Acceptance Criteria**:
- [ ] get_input() with optional required validation
- [ ] get_int_input() returns int or None for invalid input
- [ ] confirm() returns boolean for y/n questions
- [ ] format_task() returns single task string
- [ ] format_task_list() returns formatted list string
- [ ] clear_screen() clears terminal (cross-platform)

**Artifacts to Modify**:
- Create: `src/todo/utils.py`

---

### T-007: Implement CLI Main Application
**From**: plan.md §2.3, spec.md §4
**Priority**: High
**Estimate**: Large

**Description**: Create the main CLI application with menu and feature handlers.

**Preconditions**: T-005, T-006 completed

**Acceptance Criteria**:
- [ ] TodoApp class with main run loop
- [ ] Display formatted main menu (spec.md §4.1)
- [ ] Handle menu choice 1: Add Task (spec.md §3.1)
- [ ] Handle menu choice 2: View Tasks (spec.md §3.2)
- [ ] Handle menu choice 3: Update Task (spec.md §3.3)
- [ ] Handle menu choice 4: Delete Task (spec.md §3.4)
- [ ] Handle menu choice 5: Toggle Complete (spec.md §3.5)
- [ ] Handle menu choice 6: Exit with confirmation
- [ ] Invalid input handling returns to menu
- [ ] Clean error display from exceptions

**Artifacts to Modify**:
- Create: `src/todo/main.py`

---

### T-008: Create README.md
**From**: Deliverables requirement
**Priority**: Medium
**Estimate**: Small

**Description**: Create comprehensive README with setup and usage instructions.

**Preconditions**: T-007 completed

**Acceptance Criteria**:
- [ ] Project description
- [ ] Prerequisites (Python 3.13+, UV)
- [ ] Installation instructions
- [ ] Usage instructions with examples
- [ ] Feature list
- [ ] Project structure overview

**Artifacts to Modify**:
- Create: `README.md`

---

## Implementation Order

```
T-001 (Project Setup)
   │
   ├─────┬─────┬─────┐
   ▼     ▼     ▼     ▼
T-002  T-004  T-006  (parallel)
   │     │
   ▼     │
T-003 ◄──┘
   │
   ▼
T-005
   │
   ▼
T-007
   │
   ▼
T-008
```

## Notes
- All tasks must be completed before Phase I is considered done
- Each task should be tested immediately after implementation
- Reference task IDs in code comments where applicable
