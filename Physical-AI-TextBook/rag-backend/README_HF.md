---
title: Physical AI RAG Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 8000
---

# Physical AI Textbook RAG Backend

FastAPI backend for the Physical AI Textbook with Gemini-powered RAG chat.

## Endpoints

- `GET /health` - Health check
- `GET /api/stats` - Vector store statistics
- `POST /api/chat` - Chat with the AI tutor
- `POST /api/search` - Search content

## Environment Variables Required

- `GEMINI_API_KEY` - Google Gemini API key
- `QDRANT_URL` - Qdrant Cloud URL
- `QDRANT_API_KEY` - Qdrant API key
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGINS` - Allowed origins (comma-separated)
