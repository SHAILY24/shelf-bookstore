import logging

from app.db.session import engine
from app.db.base import Base # Make sure all models are imported here via base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    logger.info("Creating initial database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def main() -> None:
    init_db()

if __name__ == "__main__":
    main() 