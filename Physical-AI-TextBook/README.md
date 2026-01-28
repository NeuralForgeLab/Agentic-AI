# Physical AI Textbook - Agentic AI Learning Platform

A comprehensive, production-ready AI-native textbook platform on Physical AI and Humanoid Robotics. Features a full-stack architecture with RAG-powered chatbot, interactive documentation, and podcast learning.

## Overview

This repository contains a complete educational platform built with modern technologies:

- **Frontend**: Docusaurus 3-based interactive textbook with podcast player
- **Backend**: FastAPI RAG chatbot with semantic search capabilities
- **AI Integration**: Google Gemini for embeddings and chat
- **Vector Database**: Qdrant Cloud for semantic search
- **Authentication**: Firebase (optional)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│            Frontend (Docusaurus + React)                │
│   ChatWidget | PodcastPlayer | Auth | Interactive Docs  │
└─────────────────────────┬───────────────────────────────┘
                          │ REST/SSE
┌─────────────────────────▼───────────────────────────────┐
│              Backend (FastAPI + Python)                 │
│   /api/chat | /api/search | /api/history                │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Google  │   │ Qdrant  │   │  Neon   │
    │ Gemini  │   │  Cloud  │   │PostgreSQL│
    └─────────┘   └─────────┘   └─────────┘
```

## Features

### Content
- 6 Core Chapters covering Physical AI fundamentals to advanced humanoid robotics
- 4 Hands-on Labs with step-by-step tutorials
- 6 Podcast Episodes for audio learning
- Multi-language support (English + Urdu with RTL)

### Technology
- RAG-powered intelligent chatbot
- Semantic search across all content
- Streaming responses via Server-Sent Events
- Browser-based Text-to-Speech (no API required)
- Firebase authentication system
- Chat history with session management

## Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- Python 3.11+
- Google Gemini API key (free at https://aistudio.google.com/apikey)
- Qdrant Cloud account (free tier at https://cloud.qdrant.io)
- Neon PostgreSQL account (free tier at https://neon.tech)

### Frontend Setup

```bash
cd physical-ai-textbook

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials and backend URL

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd rag-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - GEMINI_API_KEY
# - QDRANT_URL and QDRANT_API_KEY
# - DATABASE_URL (Neon PostgreSQL)

# Index the textbook content
python scripts/index_content.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Project Structure

```
Physical-AI-TextBook/
├── physical-ai-textbook/     # Frontend (Docusaurus)
│   ├── docs/                 # 6 chapters + 4 labs
│   ├── podcast/              # 6 podcast episodes
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatWidget/   # RAG chatbot widget
│   │   │   ├── PodcastPlayer/
│   │   │   └── AuthForms/
│   │   ├── contexts/         # Auth context
│   │   └── pages/            # Auth & profile pages
│   └── scripts/              # Podcast generation tools
│
├── rag-backend/              # Backend (FastAPI)
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── services/         # Business logic
│   │   └── models/           # Pydantic & SQLAlchemy models
│   └── scripts/              # Content indexer
│
├── specs/                    # Feature specifications
├── history/                  # Development history (PHRs, ADRs)
└── .github/workflows/        # CI/CD pipelines
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message, get RAG response |
| `/api/chat/stream` | POST | Streaming response (SSE) |
| `/api/search` | POST/GET | Semantic search |
| `/api/history/sessions` | GET | List chat sessions |
| `/api/history/sessions/{id}` | GET/DELETE/PATCH | Manage sessions |
| `/health` | GET | Health check |

## Textbook Content

| Chapter | Topic |
|---------|-------|
| 1 | Introduction to Physical AI |
| 2 | ROS2 Fundamentals |
| 3 | Robot Simulation (Gazebo) |
| 4 | NVIDIA Isaac Sim |
| 5 | Vision-Language-Action Models |
| 6 | Humanoid Robotics |

## Deployment

### Frontend (GitHub Pages)
The repository includes GitHub Actions workflow for automatic deployment. Push to `main` to trigger.

### Backend Options
- **Koyeb** (Recommended - free, no credit card)
- **Railway** (free tier available)
- **Render** (free tier available)
- **Fly.io** (requires credit card verification)

See [BACKEND_DEPLOY.md](BACKEND_DEPLOY.md) for detailed deployment instructions.

## Environment Variables

### Frontend (.env)
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
RAG_API_URL=http://localhost:8000
```

### Backend (.env)
```
GEMINI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
DATABASE_URL=
CORS_ORIGINS=http://localhost:3000
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend Framework | Docusaurus 3.9.2, React 19, TypeScript |
| Backend Framework | FastAPI 0.109, Python 3.11+ |
| AI Model | Google Gemini (text-embedding-004, gemini-2.5-flash) |
| Vector Database | Qdrant Cloud |
| Relational Database | Neon PostgreSQL |
| Authentication | Firebase Auth |
| Deployment | GitHub Pages (frontend), Railway/Koyeb (backend) |

## Cost Estimate

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Google Gemini | Generous | Sufficient for learning |
| Qdrant Cloud | 1GB | ~1M vectors |
| Neon PostgreSQL | 0.5GB | Ample for chat history |
| GitHub Pages | Unlimited | Static hosting |
| Backend hosting | $0-5/mo | Most platforms have free tiers |

**Total: $0-5/month**

## Contributing

Contributions are welcome! Please ensure:
- Code examples are runnable and tested
- Documentation is clear and accessible
- Changes follow existing code style

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Docusaurus](https://docusaurus.io/) - Documentation framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Google Gemini](https://ai.google.dev/) - AI models
- [Qdrant](https://qdrant.tech/) - Vector database
- [ROS2](https://www.ros.org/) - Robot Operating System
- [NVIDIA Isaac](https://developer.nvidia.com/isaac) - Simulation platform
