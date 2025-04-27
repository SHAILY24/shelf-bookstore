from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User

def init_db() -> None:
    print("Starting database session")
    db = SessionLocal()
    try:
        print("Checking for existing user")
        # Create test user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("Creating new test user")
            user = User(
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            db.commit()
            print(f"Created test user: test@example.com / password123")
        else:
            print("Test user already exists")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()
        print("Database session closed")

if __name__ == "__main__":
    print("Creating test user")
    init_db()
    print("Test user creation complete") 