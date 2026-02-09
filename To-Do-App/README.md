# Evolution of Todo

A multi-phase Todo application built using **Spec-Driven Development** (SDD) with Claude Code and Spec-Kit Plus.

---

## Live Demo

| Platform | URL |
|----------|-----|
| **Live App** | [https://zeeshan353-todo-frontend.hf.space](https://zeeshan353-todo-frontend.hf.space) |
| **API Documentation** | [https://zeeshan353-todo-backend.hf.space/docs](https://zeeshan353-todo-backend.hf.space/docs) |
| **Backend API** | [https://zeeshan353-todo-backend.hf.space](https://zeeshan353-todo-backend.hf.space) |

### Hugging Face Spaces

| Space | Link |
|-------|------|
| Frontend | [huggingface.co/spaces/zeeshan353/todo-frontend](https://huggingface.co/spaces/zeeshan353/todo-frontend) |
| Backend | [huggingface.co/spaces/zeeshan353/todo-backend](https://huggingface.co/spaces/zeeshan353/todo-backend) |

---

## Project Overview

This project demonstrates the evolution of a Todo application across 5 phases:

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase I** | In-Memory Python Console App | Completed |
| **Phase II** | Full-Stack Web Application | Completed |
| **Phase III** | AI-Powered Todo Chatbot | Completed |
| **Phase IV** | Local Kubernetes Deployment | Completed |
| **Phase V** | Advanced Cloud Deployment | Completed |

---

## Key Features

### AI-Powered Chatbot (Phase III)
- **Natural Language Task Management** - Create, update, delete tasks using conversational AI
- **Google Gemini Integration** - Powered by Gemini 1.5 Flash
- **Function Calling** - AI executes actual task operations
- **Real-time Sync** - Chat actions immediately reflect in the task list

#### Example Chat Commands

| Command | What it does |
|---------|--------------|
| "Add a task to buy groceries" | Creates a new task |
| "Show me my tasks" | Lists all tasks |
| "Mark task 1 as done" | Toggles task completion |
| "Delete task 2" | Removes a task |
| "What do I need to do?" | Shows active tasks |

### Full-Stack Web Application (Phase II)
- **User Authentication** - Email/password signup and signin with Better Auth
- **JWT-Protected API** - All task operations secured with JWT tokens
- **Full CRUD Operations** - Create, read, update, delete tasks via REST API
- **Responsive Dashboard** - React components with Tailwind CSS styling

### Cloud Deployment (Phase V)
- **Hugging Face Spaces** - FREE Docker-based deployment
- **Auto-deploy** - Automatic deployments from repository
- **Free SSL** - HTTPS enabled with managed certificates

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI, SQLModel, Python |
| **Database** | PostgreSQL (Neon) |
| **Authentication** | Better Auth + JWT |
| **AI** | Google Gemini 1.5 Flash |
| **Deployment** | Hugging Face Spaces (Docker) |
| **Container** | Docker (multi-stage builds) |
| **Orchestration** | Kubernetes (optional) |

---

## Quick Start

### Try the Live App

1. Visit [https://zeeshan353-todo-frontend.hf.space](https://zeeshan353-todo-frontend.hf.space)
2. Sign up with email and password
3. Create tasks using the form or chat with AI!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Mansoor-Siddiqui/hackaton-2.git
cd hackaton-2

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your environment
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local  # Configure your environment
npm run dev
```

### Run with Docker

```bash
docker-compose up --build
```

---

## API Endpoints

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{user_id}/tasks` | List all tasks |
| POST | `/api/users/{user_id}/tasks` | Create task |
| GET | `/api/users/{user_id}/tasks/{task_id}` | Get single task |
| PATCH | `/api/users/{user_id}/tasks/{task_id}` | Update task |
| DELETE | `/api/users/{user_id}/tasks/{task_id}` | Delete task |
| POST | `/api/users/{user_id}/tasks/{task_id}/toggle` | Toggle completion |

### Chat API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/{user_id}/chat` | Send chat message |
| GET | `/api/users/{user_id}/chat/conversations` | List conversations |

Full API documentation: [https://zeeshan353-todo-backend.hf.space/docs](https://zeeshan353-todo-backend.hf.space/docs)

---

## Project Structure

```
hackaton-2/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── models/           # SQLModel database models
│   │   ├── routes/           # API route handlers
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Gemini AI integration
│   │   └── main.py           # FastAPI entry point
│   └── requirements.txt
├── frontend/                 # Next.js Frontend
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Auth and API clients
│   └── package.json
├── docker/                   # Docker configuration
├── k8s/                      # Kubernetes manifests
├── huggingface/              # HF Spaces config
├── specs/                    # Feature specifications
└── src/                      # Phase I Console App
```

---

## Environment Variables

### Backend

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=https://your-frontend-url
BETTER_AUTH_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=["https://your-frontend-url"]
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-frontend-url
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key
```

---

## Development Approach

This project follows **Spec-Driven Development**:

1. **Specify** - Requirements captured in `specs/*/spec.md`
2. **Plan** - Architecture defined in `specs/*/plan.md`
3. **Tasks** - Work broken down in `specs/*/tasks.md`
4. **Implement** - Code generated via Claude Code

---

## Hackathon II

This project is part of **Hackathon II: The Evolution of Todo** - a spec-driven development challenge covering AI-native and cloud-native technologies.

---

## Authors

**Mansoor Siddiqui** & **Zeeshan Zubair**

- GitHub: [@Mansoor-Siddiqui](https://github.com/Mansoor-Siddiqui)
- Hugging Face: [@zeeshan353](https://huggingface.co/zeeshan353)

---

## License

MIT License

---

**Built with Spec-Driven Development using Claude Code and Spec-Kit Plus**
