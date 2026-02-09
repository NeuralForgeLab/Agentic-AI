# Task: T2-002 - Database connection
# From: specs/phase2-web/plan.md §5
"""
Database connection and session management using SQLModel.
"""

from sqlmodel import SQLModel, Session, create_engine
from typing import Generator

from .config import get_settings

settings = get_settings()

# Create engine with connection pooling
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
)


def create_db_and_tables() -> None:
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Yields:
        Session: SQLModel database session.
    """
    with Session(engine) as session:
        yield session
