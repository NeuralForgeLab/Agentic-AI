# Phase II Specification: Todo Full-Stack Web Application

## 1. Overview

### 1.1 Purpose
Transform the Phase I console app into a modern multi-user web application with persistent storage, RESTful API, and user authentication.

### 1.2 Scope
- RESTful API backend with FastAPI
- Responsive frontend with Next.js
- PostgreSQL database with Neon
- User authentication with Better Auth + JWT

### 1.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth (frontend) + JWT verification (backend) |

---

## 2. Data Model

### 2.1 User Entity (Managed by Better Auth)
```
users
├── id: string (primary key)
├── email: string (unique)
├── name: string
├── emailVerified: boolean
├── image: string (nullable)
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 2.2 Task Entity
```sql
tasks
├── id: integer (primary key, auto-increment)
├── user_id: string (foreign key -> users.id)
├── title: string (not null, max 200)
├── description: text (nullable, max 500)
├── completed: boolean (default false)
├── created_at: timestamp
└── updated_at: timestamp
```

### 2.3 Database Indexes
- `tasks.user_id` - For filtering by user
- `tasks.completed` - For status filtering

---

## 3. API Specification

### 3.1 Base URL
- Development: `http://localhost:8000`
- Production: Deployed URL

### 3.2 Authentication
All `/api/{user_id}/tasks` endpoints require:
```
Authorization: Bearer <jwt_token>
```

### 3.3 Endpoints

#### GET /api/{user_id}/tasks
**Description**: List all tasks for a user

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter: "all", "pending", "completed" |

**Response** (200):
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "completed": 0
}
```

#### POST /api/{user_id}/tasks
**Description**: Create a new task

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response** (201):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### GET /api/{user_id}/tasks/{task_id}
**Description**: Get a specific task

**Response** (200): Single task object

**Response** (404):
```json
{
  "detail": "Task not found"
}
```

#### PUT /api/{user_id}/tasks/{task_id}
**Description**: Update a task

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response** (200): Updated task object

#### DELETE /api/{user_id}/tasks/{task_id}
**Description**: Delete a task

**Response** (200):
```json
{
  "message": "Task deleted successfully",
  "id": 1
}
```

#### PATCH /api/{user_id}/tasks/{task_id}/complete
**Description**: Toggle task completion status

**Response** (200): Updated task object with toggled `completed` status

---

## 4. Frontend Specification

### 4.1 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page / redirect to dashboard |
| `/auth/signin` | Sign in page |
| `/auth/signup` | Sign up page |
| `/dashboard` | Main todo dashboard (protected) |

### 4.2 Dashboard Features
- View all tasks with status indicators
- Add new task (modal or inline form)
- Edit task (inline or modal)
- Delete task with confirmation
- Toggle task completion (checkbox)
- Filter by status (All/Pending/Completed)

### 4.3 UI Components
- TaskList - Display tasks
- TaskItem - Single task with actions
- TaskForm - Add/Edit task form
- Header - Navigation and user menu
- AuthForms - Sign in/Sign up forms

### 4.4 Design Requirements
- Responsive design (mobile-first)
- Tailwind CSS for styling
- Loading states for async operations
- Error handling with user feedback
- Accessible (keyboard navigation, ARIA labels)

---

## 5. Authentication Flow

### 5.1 Sign Up Flow
1. User enters email, password, name
2. Better Auth creates user and session
3. JWT token issued
4. Redirect to dashboard

### 5.2 Sign In Flow
1. User enters credentials
2. Better Auth validates and creates session
3. JWT token issued
4. Redirect to dashboard

### 5.3 API Request Flow
1. Frontend gets JWT from Better Auth session
2. Frontend includes JWT in Authorization header
3. Backend verifies JWT signature
4. Backend extracts user_id from token
5. Backend validates user_id matches URL parameter
6. Backend returns user-specific data

### 5.4 Security Requirements
- JWT tokens expire after 7 days
- Shared secret between frontend and backend
- All API requests require valid token
- Users can only access their own tasks

---

## 6. Error Handling

### 6.1 HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (user mismatch) |
| 404 | Not Found |
| 500 | Server Error |

### 6.2 Error Response Format
```json
{
  "detail": "Error message description"
}
```

---

## 7. Environment Variables

### 7.1 Backend (.env)
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-shared-secret
CORS_ORIGINS=http://localhost:3000
```

### 7.2 Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-shared-secret
```

---

## 8. Non-Functional Requirements

### 8.1 Performance
- API response time < 500ms
- Frontend initial load < 3s
- Optimistic UI updates

### 8.2 Security
- HTTPS in production
- CORS properly configured
- SQL injection prevention (SQLModel)
- XSS prevention (React)

### 8.3 Scalability
- Stateless API design
- Connection pooling for database
- Serverless-ready architecture

---

## 9. Out of Scope (Phase II)
- AI chatbot integration
- Kubernetes deployment
- Real-time updates (WebSocket)
- Task priorities and categories
- Recurring tasks
- Due dates and reminders
