# backend/database.py

import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Load environment variables from .env file
load_dotenv()

# Get the database URL from the environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in environment variables")

# Create the SQLAlchemy engine for asynchronous interaction
engine = create_async_engine(DATABASE_URL)

# Create a configured "Session" class for creating new sessions
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """
    FastAPI dependency to get a database session.
    Yields a session and ensures it's closed after the request.
    """
    async with AsyncSessionLocal() as session:
        yield session
