"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, history, search
from app.config import get_settings
from app.models.database import close_db, init_db
from app.models.schemas import HealthResponse
from app.services.auth_service import init_firebase
from app.services.vector_service import get_vector_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Starting RAG Backend...")

    # Initialize Firebase (optional - won't fail if not configured)
    firebase_ok = init_firebase()
    if firebase_ok:
        print("Firebase initialized")
    else:
        print("Firebase not available - running without authentication")

    # Initialize database
    await init_db()
    print("Database initialized")

    # Ensure vector collection exists
    vector_service = get_vector_service()
    await vector_service.ensure_collection()
    print("Vector collection ready")

    yield

    # Shutdown
    print("Shutting down...")
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="Physical AI Textbook RAG API",
    description="RAG-powered chatbot API for the Physical AI Textbook",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
settings = get_settings()
origins = [origin.strip() for origin in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check."""
    return HealthResponse(status="healthy")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy")


@app.get("/api/stats")
async def get_stats():
    """Get API statistics."""
    vector_service = get_vector_service()
    collection_info = await vector_service.get_collection_info()

    return {"status": "healthy", "vector_store": collection_info}
