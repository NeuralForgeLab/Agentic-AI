# Phase I Implementation Plan: Todo Console App

## 1. Architecture Overview

### 1.1 Component Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    CLI Layer (main.py)                   │
│         - Menu display and navigation                    │
│         - User input/output handling                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Service Layer (task_service.py)            │
│         - Business logic                                 │
│         - Input validation                               │
│         - Operation coordination                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Data Layer (models.py)                    │
│         - Task dataclass                                 │
│         - In-memory storage (TaskStore)                  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Module Structure
```
src/
└── todo/
    ├── __init__.py       # Package initialization
    ├── main.py           # CLI entry point, menu handling
    ├── models.py         # Task dataclass and TaskStore
    ├── task_service.py   # Business logic operations
    └── utils.py          # Helper functions (input validation, formatting)
```

---

## 2. Component Design

### 2.1 Data Layer (models.py)

#### Task Model
```python
@dataclass
class Task:
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
```

#### TaskStore Class
```python
class TaskStore:
    """In-memory storage for tasks."""

    def __init__(self):
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, task: Task) -> Task
    def get(self, task_id: int) -> Task | None
    def get_all(self) -> list[Task]
    def update(self, task: Task) -> Task
    def delete(self, task_id: int) -> bool
    def generate_id(self) -> int
```

### 2.2 Service Layer (task_service.py)

#### TaskService Class
```python
class TaskService:
    """Business logic for task operations."""

    def __init__(self, store: TaskStore):
        self._store = store

    def create_task(self, title: str, description: str = "") -> Task
    def get_task(self, task_id: int) -> Task
    def list_tasks(self) -> list[Task]
    def update_task(self, task_id: int, title: str = None, description: str = None) -> Task
    def delete_task(self, task_id: int) -> bool
    def toggle_complete(self, task_id: int) -> Task
```

#### Validation Rules
- `create_task`: Validate title not empty, length <= 200
- `update_task`: Validate task exists, fields if provided
- All operations: Raise appropriate exceptions

### 2.3 CLI Layer (main.py)

#### Main Application Class
```python
class TodoApp:
    """CLI application controller."""

    def __init__(self):
        self._store = TaskStore()
        self._service = TaskService(self._store)
        self._running = True

    def run(self) -> None           # Main loop
    def display_menu(self) -> None  # Show main menu
    def handle_choice(self, choice: int) -> None

    # Feature handlers
    def add_task(self) -> None
    def view_tasks(self) -> None
    def update_task(self) -> None
    def delete_task(self) -> None
    def toggle_complete(self) -> None
    def exit_app(self) -> None
```

### 2.4 Utilities (utils.py)

```python
def get_input(prompt: str, required: bool = False) -> str
def get_int_input(prompt: str) -> int | None
def confirm(prompt: str) -> bool
def format_task(task: Task) -> str
def format_task_list(tasks: list[Task]) -> str
def clear_screen() -> None
```

---

## 3. Error Handling Strategy

### 3.1 Custom Exceptions
```python
class TaskError(Exception):
    """Base exception for task operations."""
    pass

class TaskNotFoundError(TaskError):
    """Raised when task ID does not exist."""
    pass

class ValidationError(TaskError):
    """Raised when input validation fails."""
    pass
```

### 3.2 Error Flow
1. Service layer raises typed exceptions
2. CLI layer catches and displays user-friendly messages
3. Application returns to main menu after error

---

## 4. Data Flow

### 4.1 Add Task Flow
```
User Input → CLI.add_task() → Service.create_task() → Store.add() → Task
     ↑                                                               │
     └───────────────────── Display Success ─────────────────────────┘
```

### 4.2 View Tasks Flow
```
User Selection → CLI.view_tasks() → Service.list_tasks() → Store.get_all()
       ↑                                                          │
       └──────────────── Display Formatted List ──────────────────┘
```

---

## 5. Testing Strategy

### 5.1 Manual Testing Checklist
- [ ] Add task with title only
- [ ] Add task with title and description
- [ ] Add task with empty title (should fail)
- [ ] View empty task list
- [ ] View populated task list
- [ ] Update existing task title
- [ ] Update non-existent task (should fail)
- [ ] Delete task with confirmation
- [ ] Delete task with cancellation
- [ ] Toggle task complete
- [ ] Toggle task incomplete
- [ ] Invalid menu choices
- [ ] Exit application

### 5.2 Edge Cases
- Very long title (> 200 chars)
- Special characters in title
- Numeric task ID boundaries
- Empty task list operations

---

## 6. Implementation Sequence

### Phase 1: Foundation
1. Create project structure
2. Implement models.py (Task, TaskStore)
3. Implement custom exceptions

### Phase 2: Business Logic
4. Implement task_service.py
5. Add validation logic
6. Add error handling

### Phase 3: User Interface
7. Implement utils.py helpers
8. Implement main.py CLI
9. Connect all layers

### Phase 4: Polish
10. Add clear screen functionality
11. Format output consistently
12. Add exit confirmation

---

## 7. Dependencies

### 7.1 Standard Library Only
- `dataclasses` - Task model
- `datetime` - Timestamps
- `typing` - Type hints
- `os` - Screen clearing

### 7.2 No External Dependencies
Per constitution, Phase I uses standard library only.

---

## 8. File Structure (Final)

```
hackaton-2/
├── .specify/
│   └── memory/
│       └── constitution.md
├── specs/
│   └── phase1-console/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── history/
│   ├── prompts/
│   └── adr/
├── src/
│   └── todo/
│       ├── __init__.py
│       ├── main.py
│       ├── models.py
│       ├── task_service.py
│       ├── utils.py
│       └── exceptions.py
├── CLAUDE.md
├── README.md
└── pyproject.toml
```
