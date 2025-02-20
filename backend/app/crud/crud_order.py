from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderUpdate

class CRUDOrder(CRUDBase[Order, OrderCreate, OrderUpdate]):
    def get_user_orders(self, db: Session, *, user_id: int) -> List[Order]:
        """Get all orders for a specific user"""
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    
    def get_by_session_id(self, db: Session, *, session_id: str) -> Order:
        """Get an order by Stripe session ID"""
        return db.query(Order).filter(Order.stripe_session_id == session_id).first()

    def get_multi_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        return (
            db.query(self.model)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
    def get_by_stripe_session_id(self, db: Session, *, stripe_session_id: str) -> Order | None:
        return db.query(self.model).filter(Order.stripe_session_id == stripe_session_id).first()

order = CRUDOrder(Order) 