import os
import sys
from app.db.session import engine
from app.db.base import Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.order import Order
from sqlalchemy.orm import Session

def init_db() -> None:
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
    
    # Create a test user
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        
        # Create test user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("Creating test user...")
            user = User(
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Test user created: test@example.com / password123")
        else:
            print("Test user already exists!")
            
    except Exception as e:
        print(f"Error creating test user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization completed!") 