# Phase II Tasks: Full-Stack Web Application

## Task Overview

| Task ID | Description | Status | Dependencies |
|---------|-------------|--------|--------------|
| T2-001 | Set up backend project structure | pending | - |
| T2-002 | Configure database connection | pending | T2-001 |
| T2-003 | Implement Task SQLModel | pending | T2-002 |
| T2-004 | Implement JWT verification | pending | T2-001 |
| T2-005 | Implement Task API routes | pending | T2-003, T2-004 |
| T2-006 | Set up frontend project structure | pending | - |
| T2-007 | Configure Better Auth | pending | T2-006 |
| T2-008 | Implement API client | pending | T2-006 |
| T2-009 | Implement Auth pages | pending | T2-007 |
| T2-010 | Implement Dashboard and Task components | pending | T2-008, T2-009 |
| T2-011 | Update README for Phase II | pending | T2-010 |

---

## Backend Tasks

### T2-001: Set up Backend Project Structure
**From**: plan.md §1.2
**Priority**: High

**Description**: Create FastAPI project with proper structure.

**Acceptance Criteria**:
- [ ] backend/ directory with app/ subdirectory
- [ ] requirements.txt with dependencies
- [ ] main.py with FastAPI app
- [ ] config.py with settings
- [ ] .env.example file

**Artifacts**:
- `backend/requirements.txt`
- `backend/app/__init__.py`
- `backend/app/main.py`
- `backend/app/config.py`
- `backend/.env.example`

---

### T2-002: Configure Database Connection
**From**: plan.md §5, spec.md §2
**Priority**: High

**Description**: Set up SQLModel with Neon PostgreSQL.

**Acceptance Criteria**:
- [ ] Database engine configuration
- [ ] Session dependency for routes
- [ ] Connection pooling configured
- [ ] Tables created on startup

**Artifacts**:
- `backend/app/database.py`

---

### T2-003: Implement Task SQLModel
**From**: plan.md §2.1, spec.md §2.2
**Priority**: High

**Description**: Create Task model and Pydantic schemas.

**Acceptance Criteria**:
- [ ] Task SQLModel with all fields
- [ ] TaskCreate schema
- [ ] TaskUpdate schema
- [ ] TaskResponse schema
- [ ] Field validations

**Artifacts**:
- `backend/app/models/task.py`
- `backend/app/schemas/task.py`

---

### T2-004: Implement JWT Verification
**From**: plan.md §4, spec.md §5
**Priority**: High

**Description**: Create JWT verification middleware.

**Acceptance Criteria**:
- [ ] JWT decode with shared secret
- [ ] Extract user_id from token
- [ ] Verify user_id matches URL parameter
- [ ] Return 401 for invalid tokens
- [ ] Return 403 for user mismatch

**Artifacts**:
- `backend/app/auth.py`

---

### T2-005: Implement Task API Routes
**From**: plan.md §2.2, spec.md §3
**Priority**: High

**Description**: Create all REST API endpoints for tasks.

**Acceptance Criteria**:
- [ ] GET /api/{user_id}/tasks - List tasks
- [ ] POST /api/{user_id}/tasks - Create task
- [ ] GET /api/{user_id}/tasks/{id} - Get task
- [ ] PUT /api/{user_id}/tasks/{id} - Update task
- [ ] DELETE /api/{user_id}/tasks/{id} - Delete task
- [ ] PATCH /api/{user_id}/tasks/{id}/complete - Toggle
- [ ] Status filter query parameter
- [ ] Proper error responses

**Artifacts**:
- `backend/app/routes/tasks.py`

---

## Frontend Tasks

### T2-006: Set up Frontend Project Structure
**From**: plan.md §1.2
**Priority**: High

**Description**: Initialize Next.js project with TypeScript and Tailwind.

**Acceptance Criteria**:
- [ ] Next.js 14+ with App Router
- [ ] TypeScript configured
- [ ] Tailwind CSS configured
- [ ] Environment variables setup

**Artifacts**:
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/src/app/layout.tsx`
- `frontend/.env.example`

---

### T2-007: Configure Better Auth
**From**: plan.md §3.1, spec.md §5
**Priority**: High

**Description**: Set up Better Auth with email/password.

**Acceptance Criteria**:
- [ ] Better Auth server config
- [ ] Auth client for components
- [ ] API route handler
- [ ] Session management

**Artifacts**:
- `frontend/src/lib/auth.ts`
- `frontend/src/lib/auth-client.ts`
- `frontend/src/app/api/auth/[...all]/route.ts`

---

### T2-008: Implement API Client
**From**: plan.md §3.2
**Priority**: Medium

**Description**: Create typed API client for backend.

**Acceptance Criteria**:
- [ ] Base API client with auth headers
- [ ] getTasks method
- [ ] createTask method
- [ ] updateTask method
- [ ] deleteTask method
- [ ] toggleComplete method
- [ ] Error handling

**Artifacts**:
- `frontend/src/lib/api.ts`
- `frontend/src/types/task.ts`

---

### T2-009: Implement Auth Pages
**From**: spec.md §4.1
**Priority**: High

**Description**: Create sign in and sign up pages.

**Acceptance Criteria**:
- [ ] Sign in page with form
- [ ] Sign up page with form
- [ ] Form validation
- [ ] Error display
- [ ] Redirect after auth

**Artifacts**:
- `frontend/src/app/auth/signin/page.tsx`
- `frontend/src/app/auth/signup/page.tsx`
- `frontend/src/components/AuthForm.tsx`

---

### T2-010: Implement Dashboard and Task Components
**From**: spec.md §4.2, spec.md §4.3
**Priority**: High

**Description**: Create main dashboard with task management.

**Acceptance Criteria**:
- [ ] Protected dashboard route
- [ ] Header with user info and logout
- [ ] TaskList component
- [ ] TaskItem component
- [ ] TaskForm component (add/edit)
- [ ] Filter buttons
- [ ] Loading states
- [ ] Responsive design

**Artifacts**:
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/components/TaskList.tsx`
- `frontend/src/components/TaskItem.tsx`
- `frontend/src/components/TaskForm.tsx`

---

### T2-011: Update README for Phase II
**From**: Deliverables
**Priority**: Low

**Description**: Update documentation for Phase II.

**Acceptance Criteria**:
- [ ] Phase II section added
- [ ] Setup instructions for both frontend/backend
- [ ] Environment variables documented
- [ ] API documentation reference

**Artifacts**:
- Update: `README.md`

---

## Implementation Order

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                               │
│  T2-001 → T2-002 → T2-003 → T2-004 → T2-005             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  T2-006 → T2-007 → T2-008 → T2-009 → T2-010            │
└─────────────────────────────────────────────────────────┘
                        ↓
                    T2-011
```

## Notes
- Backend and frontend can be developed in parallel after initial setup
- Test backend API with curl/httpie before frontend integration
- Use environment variables for all secrets
