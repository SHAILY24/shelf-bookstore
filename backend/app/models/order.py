from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Order(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    stripe_session_id = Column(String, unique=True, index=True)
    status = Column(String, default="pending", nullable=False)  # could be 'completed', 'canceled', etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    order_details = Column(Text)  # Store JSON of ordered items
    
    # Relationship with User
    user = relationship("User", back_populates="orders") 