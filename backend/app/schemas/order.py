from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# For creation by API
class OrderCreate(BaseModel):
    user_id: int
    amount: float
    stripe_session_id: str
    order_details: str

# For updates
class OrderUpdate(BaseModel):
    status: Optional[str] = None

# For response/read
class Order(BaseModel):
    id: int
    user_id: int
    amount: float
    stripe_session_id: str
    status: str
    created_at: datetime
    order_details: str

    class Config:
        from_attributes = True 