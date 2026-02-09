---
title: Todo App Backend
emoji: 📋
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Todo App Backend API

FastAPI backend for the Evolution of Todo application with AI-powered chatbot.

## Features

- RESTful API for task management
- JWT authentication with Better Auth
- AI-powered chatbot using Google Gemini
- PostgreSQL database (Neon)

## API Documentation

Visit `/docs` for interactive Swagger UI documentation.

## Endpoints

- `GET /health` - Health check
- `GET /api/users/{user_id}/tasks` - List tasks
- `POST /api/users/{user_id}/tasks` - Create task
- `PATCH /api/users/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete task
- `POST /api/users/{user_id}/chat` - AI chat

## Environment Variables

Required secrets in Hugging Face Space settings:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_URL` - Frontend URL for auth
- `BETTER_AUTH_SECRET` - Auth secret key
- `GEMINI_API_KEY` - Google Gemini API key
- `CORS_ORIGINS` - Allowed CORS origins

## Authors

**Mansoor Siddiqui** & **Zeeshan Zubair**
