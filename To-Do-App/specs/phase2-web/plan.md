# Phase II Implementation Plan: Full-Stack Web Application

## 1. Architecture Overview

### 1.1 System Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14+)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Pages     │  │ Components  │  │ Better Auth │                  │
│  │  /dashboard │  │  TaskList   │  │   Client    │                  │
│  │  /auth/*    │  │  TaskForm   │  │   Session   │                  │
│  └─────────────┘  └─────────────┘  └──────┬──────┘                  │
│                                           │ JWT                      │
└───────────────────────────────────────────┼─────────────────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │     Authorization:        │
                              │     Bearer <jwt_token>    │
                              └─────────────┬─────────────┘
                                            │
┌───────────────────────────────────────────▼─────────────────────────┐
│                     BACKEND (FastAPI)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Routes    │  │   Service   │  │ JWT Verify  │                  │
│  │  /api/tasks │  │  TaskService│  │  Middleware │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                          │                                           │
│                          ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SQLModel ORM                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────┬─────────────────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │     Neon PostgreSQL       │
                              │    (Serverless DB)        │
                              └───────────────────────────┘
```

### 1.2 Monorepo Structure
```
hackaton-2/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Settings and configuration
│   │   ├── database.py        # Database connection
│   │   ├── auth.py            # JWT verification
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── task.py        # Task SQLModel
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── tasks.py       # Task API routes
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── task.py        # Pydantic schemas
│   ├── requirements.txt
│   └── .env
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   └── api/
│   │   │       └── auth/[...all]/route.ts
│   │   ├── components/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── Header.tsx
│   │   └── lib/
│   │       ├── api.ts         # API client
│   │       ├── auth.ts        # Better Auth config
│   │       └── auth-client.ts # Auth client
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local
├── specs/
│   └── phase2-web/
├── docker-compose.yml          # Local development
└── README.md
```

---

## 2. Backend Design

### 2.1 Database Model (SQLModel)

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=500)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2.2 API Routes Structure

```python
# routes/tasks.py
router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

@router.get("/")           # List tasks
@router.post("/")          # Create task
@router.get("/{task_id}")  # Get task
@router.put("/{task_id}")  # Update task
@router.delete("/{task_id}") # Delete task
@router.patch("/{task_id}/complete") # Toggle complete
```

### 2.3 JWT Verification Middleware

```python
async def verify_jwt(authorization: str = Header(...)):
    """Verify JWT token and extract user info."""
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload["sub"]  # user_id
```

### 2.4 Request/Response Schemas

```python
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=500)

class TaskUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = Field(None, max_length=500)

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime
```

---

## 3. Frontend Design

### 3.1 Better Auth Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### 3.2 API Client

```typescript
// lib/api.ts
class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string>;

  async getTasks(userId: string, status?: string): Promise<Task[]>
  async createTask(userId: string, data: TaskCreate): Promise<Task>
  async updateTask(userId: string, taskId: number, data: TaskUpdate): Promise<Task>
  async deleteTask(userId: string, taskId: number): Promise<void>
  async toggleComplete(userId: string, taskId: number): Promise<Task>
}
```

### 3.3 Component Hierarchy

```
App
├── Layout
│   ├── Header (auth status, logout)
│   └── Main Content
├── Dashboard Page
│   ├── TaskForm (add new)
│   ├── FilterButtons (all/pending/completed)
│   └── TaskList
│       └── TaskItem (edit, delete, toggle)
└── Auth Pages
    ├── SignIn
    └── SignUp
```

### 3.4 State Management
- Server Components for initial data fetch
- Client Components for interactivity
- React hooks for local state
- Optimistic updates for better UX

---

## 4. Authentication Flow

### 4.1 Token Flow Diagram
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │   Frontend   │     │  Better  │     │  Backend │
│          │     │   (Next.js)  │     │   Auth   │     │ (FastAPI)│
└────┬─────┘     └──────┬───────┘     └────┬─────┘     └────┬─────┘
     │                  │                   │                │
     │ 1. Login         │                   │                │
     │─────────────────>│                   │                │
     │                  │ 2. Authenticate   │                │
     │                  │──────────────────>│                │
     │                  │ 3. Session + JWT  │                │
     │                  │<──────────────────│                │
     │ 4. Redirect      │                   │                │
     │<─────────────────│                   │                │
     │                  │                   │                │
     │ 5. View Tasks    │                   │                │
     │─────────────────>│                   │                │
     │                  │ 6. GET /api/tasks │                │
     │                  │ Authorization: Bearer <jwt>        │
     │                  │───────────────────────────────────>│
     │                  │                   │ 7. Verify JWT  │
     │                  │                   │      ↓         │
     │                  │                   │ 8. Query DB    │
     │                  │ 9. Tasks Response │                │
     │                  │<───────────────────────────────────│
     │ 10. Display      │                   │                │
     │<─────────────────│                   │                │
```

### 4.2 JWT Payload Structure
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704672000
}
```

---

## 5. Database Setup

### 5.1 Neon PostgreSQL
- Create project at neon.tech
- Get connection string
- Use pooled connection for serverless

### 5.2 Migrations
Using SQLModel's create_all for initial setup:
```python
SQLModel.metadata.create_all(engine)
```

### 5.3 Connection Pooling
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)
```

---

## 6. Development Setup

### 6.1 Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 6.2 Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

### 6.3 Docker Compose (Optional)
```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## 7. Security Considerations

### 7.1 CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.2 Input Validation
- Pydantic models for request validation
- SQLModel for database constraints
- Sanitize user inputs

### 7.3 Authorization Checks
- Verify JWT on every request
- Ensure user_id in URL matches token
- Return 403 if mismatch

---

## 8. Testing Strategy

### 8.1 Backend Testing
- API endpoint tests with httpx
- Database integration tests
- JWT verification tests

### 8.2 Frontend Testing
- Component rendering tests
- Authentication flow tests
- API integration tests

### 8.3 Manual Testing Checklist
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] User can view their tasks
- [ ] User can add a task
- [ ] User can edit a task
- [ ] User can delete a task
- [ ] User can toggle completion
- [ ] User cannot access other users' tasks
- [ ] Invalid tokens are rejected
