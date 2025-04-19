from typing import List
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.order import Order

router = APIRouter()

@router.get("/me", 
            response_model=List[schemas.Order], 
            summary="Get current user's orders",
            description="Retrieves a list of all orders placed by the currently authenticated user, ordered by creation date (newest first).")
def read_user_orders(
    current_user = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> List[Order]:
    """
    Get all orders for the current user
    """
    orders = crud.order.get_user_orders(db, user_id=current_user.id)
    return orders

@router.get("/{order_id}", 
            response_model=schemas.Order,
            summary="Get a specific order by ID",
            description="Retrieves the details of a specific order by its ID. Ensures the order belongs to the currently authenticated user.")
def read_order(
    order_id: int,
    current_user = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Order:
    """
    Get a specific order by ID (if it belongs to the current user)
    """
    order = crud.order.get(db, id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return order 