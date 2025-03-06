from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# For SQLite, we need connect_args to allow multithreading if using FastAPI's async features
# For this PoC, synchronous operations might be simpler initially.
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    # connect_args={"check_same_thread": False} # Only needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 