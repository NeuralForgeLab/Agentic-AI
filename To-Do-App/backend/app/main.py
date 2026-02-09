# Task: T2-005 - FastAPI application entry point
# From: specs/phase2-web/plan.md §1, specs/phase2-web/spec.md §1
"""
FastAPI application entry point with CORS and route registration.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from .config import get_settings
from .database import engine
from .routes import chat_router, tasks_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Create database tables on startup
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title="Todo API",
    description="FastAPI backend for Todo application with JWT authentication",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(tasks_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}
