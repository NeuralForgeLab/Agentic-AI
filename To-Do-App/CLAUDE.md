# Claude Code Instructions - Evolution of Todo

## Project Overview
This is a multi-phase Todo application project using Spec-Driven Development (SDD).
- **Phase I**: In-Memory Python Console App
- **Phase II**: Full-Stack Web Application (Next.js + FastAPI)
- **Phase III**: AI-Powered Todo Chatbot
- **Phase IV**: Local Kubernetes Deployment
- **Phase V**: Advanced Cloud Deployment

## Development Approach
Follow the Agentic Dev Stack workflow:
1. **Specify** - Capture requirements in specs
2. **Plan** - Generate technical approach
3. **Tasks** - Break into actionable items
4. **Implement** - Write code via Claude Code

## Key Rules
- Never generate code without a referenced Task ID
- Never modify architecture without updating the plan
- Always reference spec sections in implementations
- Follow the constitution principles at `.specify/memory/constitution.md`

## Project Structure
```
.specify/           # Spec-Kit configuration and memory
  memory/           # Constitution and project memory
  templates/        # Templates for specs and tasks
specs/              # Feature specifications
  phase1-console/   # Phase I specifications
history/            # PHR and ADR records
  prompts/          # Prompt History Records
  adr/              # Architecture Decision Records
src/                # Source code
  todo/             # Todo application module
```

## Current Phase
**Phase I: In-Memory Python Console App**

### Technology Stack
- Python 3.13+
- UV package manager
- In-memory storage
- CLI interface

### Required Features
1. Add Task - Create new todo items
2. Delete Task - Remove tasks from list
3. Update Task - Modify task details
4. View Task List - Display all tasks
5. Mark as Complete - Toggle completion status

## Commands
```bash
# Run the application
uv run python -m src.todo.main

# Or directly
python src/todo/main.py
```

## Code Standards
- PEP 8 compliance
- Type hints required
- Docstrings for public functions
- Clear error messages
