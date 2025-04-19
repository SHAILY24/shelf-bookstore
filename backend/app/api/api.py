from fastapi import APIRouter

from app.api.endpoints import auth, stripe_checkout, orders

api_router = APIRouter()

# Include Auth routes (login, register, me)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include Stripe checkout route
api_router.include_router(stripe_checkout.router, prefix="/stripe", tags=["Stripe"])

# Include Orders route
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])

# Add other endpoint routers here as they are created
# Example: api_router.include_router(users.router, prefix="/users", tags=["Users"])
# Example: api_router.include_router(orders.router, prefix="/orders", tags=["Orders"]) 