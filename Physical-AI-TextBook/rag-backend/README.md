# RAG Chatbot Backend

FastAPI backend for the Physical AI Textbook RAG-powered chatbot using Google Gemini.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Docusaurus)                    │
│  ChatWidget + TextSelection Hook + Firebase Auth        │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                 FastAPI Backend (Railway)                │
│  /api/chat  |  /api/search  |  /api/history             │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Google  │   │ Qdrant  │   │  Neon   │
    │ Gemini  │   │  Cloud  │   │Postgres │
    └─────────┘   └─────────┘   └─────────┘
```

## Prerequisites

- Python 3.11+
- Google Gemini API key (free tier available)
- Qdrant Cloud account (free tier)
- Neon Postgres account (free tier)
- Firebase project (optional, for user auth)

## Setup

### 1. Get a Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the API key

### 2. Create External Services

#### Qdrant Cloud (Vector Database)
1. Sign up at https://cloud.qdrant.io
2. Create a new cluster (free tier: 1GB, 1M vectors)
3. Copy the cluster URL and API key

#### Neon Postgres (Chat History)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string

### 3. Install Dependencies

```bash
cd rag-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your-gemini-api-key
QDRANT_URL=https://your-cluster.qdrant.cloud
QDRANT_API_KEY=your-qdrant-api-key
DATABASE_URL=postgres://user:password@your-host.neon.tech/dbname
CORS_ORIGINS=http://localhost:3000,https://your-domain.github.io
```

### 5. Index Content

Run the indexing script to populate the vector database:

```bash
python scripts/index_content.py
```

This will:
- Parse all markdown files from the textbook
- Chunk content into ~800 character segments
- Generate embeddings via Google Gemini (text-embedding-004)
- Store vectors in Qdrant with metadata

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

## API Endpoints

### Chat
- `POST /api/chat` - Send a message and get a RAG response
- `POST /api/chat/stream` - Send a message and get a streaming response (SSE)

### History
- `GET /api/history/sessions` - List user's chat sessions
- `GET /api/history/sessions/{id}` - Get messages for a session
- `DELETE /api/history/sessions/{id}` - Delete a session
- `PATCH /api/history/sessions/{id}?title=...` - Update session title

### Search
- `POST /api/search` - Semantic search on textbook content
- `GET /api/search?q=...` - Semantic search via GET

### Health
- `GET /` - Health check
- `GET /health` - Health check
- `GET /api/stats` - Vector store statistics

## Deployment (Railway)

### 1. Create Railway Project

1. Sign up at https://railway.app
2. Create a new project
3. Connect your GitHub repository

### 2. Configure Environment Variables

In Railway dashboard, add all environment variables from your `.env` file:
- `GEMINI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `DATABASE_URL`
- `CORS_ORIGINS`

### 3. Deploy

Railway will automatically deploy when you push to your repository.

The Dockerfile is already configured for production deployment.

## Frontend Integration

Add the RAG API URL to your frontend environment:

```bash
# In your Docusaurus .env file
RAG_API_URL=https://your-api.railway.app
```

## Project Structure

```
rag-backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment config
│   ├── api/routes/
│   │   ├── chat.py          # Chat endpoints
│   │   ├── search.py        # Vector search
│   │   └── history.py       # Chat history
│   ├── services/
│   │   ├── embedding_service.py  # Gemini embeddings
│   │   ├── chat_service.py       # Gemini chat
│   │   ├── vector_service.py     # Qdrant operations
│   │   ├── history_service.py    # Chat history
│   │   └── auth_service.py       # Firebase auth
│   └── models/
│       ├── schemas.py       # Pydantic models
│       └── database.py      # SQLAlchemy models
├── scripts/
│   └── index_content.py     # Content indexer
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Models Used

| Purpose | Model | Notes |
|---------|-------|-------|
| Embeddings | `text-embedding-004` | 768 dimensions, free tier |
| Chat | `gemini-2.0-flash-exp` | Fast, free tier available |

## Cost Estimate

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Google Gemini | Generous free tier | $0 |
| Qdrant Cloud | 1GB storage | $0 |
| Neon Postgres | 0.5GB | $0 |
| Railway | $5 credit | $0-5 |

**Total: $0-5/month** (mostly free!)

## Troubleshooting

### "Collection not found" error
Run the indexing script first: `python scripts/index_content.py`

### "API key not valid" error
Make sure your `GEMINI_API_KEY` is set correctly in `.env`

### CORS errors
Add your frontend URL to `CORS_ORIGINS` in `.env`
