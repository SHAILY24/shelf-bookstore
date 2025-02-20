import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.api import api_router # Import the main API router
from app.core.config import settings # Import settings

# TODO: Import routers from app.api

# App Description for OpenAPI
app_description = """
Shelf API 📚

Provides endpoints for:
* **User Authentication** (Register, Login, Get User Info)
* **Stripe Checkout** Integration
* **Order Management** (Creating orders via checkout, retrieving user orders)
"""

load_dotenv()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=app_description, # Add description here
    version="1.0.0", # Optional: Add API version
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173", # Explicitly allow default Vite port
    "http://127.0.0.1:5173",
    "http://localhost:5174", # Allow port 5174 too
    "http://127.0.0.1:5174",
    "https://shelf.shaily.dev",
    "http://shelf.shaily.dev",
    "*"
]

# Add middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily to debug
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Set-Cookie", 
                   "Access-Control-Allow-Headers", "Access-Control-Allow-Origin"],
    max_age=600  # Cache preflight requests for 10 minutes
)

@app.get("/")
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

# Include the API router with a prefix
app.include_router(api_router, prefix=settings.API_V1_STR)

# TODO: Include API routers
# Example: app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
# Example: app.include_router(stripe_router, prefix="/api/stripe", tags=["stripe"])


# Add a simple health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# If running directly using `python main.py` (though `uvicorn` is recommended)
if __name__ == "__main__":
    import uvicorn
    # Use reload=True for development for auto-reloading
    uvicorn.run("main:app", host="0.0.0.0", port=4242, reload=True) 