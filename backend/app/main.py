import os
from dotenv import load_dotenv
load_dotenv()

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import get_db
from app.core.auth import get_current_user
from app.auth.routes import router as auth_router
from app.datasets.routes import router as dataset_router
from app.analytics.routes import router as analytics_router


app = FastAPI(
    title="InsightX API",
    description="Backend for InsightX Data Analytics Platform",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
).split(",")

origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dataset_router)
app.include_router(analytics_router)



@app.get("/health/db")
def db_health(current_user: str = Depends(get_current_user)):
    """Database health check endpoint as documented in architecture"""
    try:
        db = get_db()
        collections = db.list_collection_names()
        return {
            "status": "connected",
            "database": "InsightX",  # Match documentation
            "collections": collections,
            "collection_count": len(collections)
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e)
        }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "InsightX Backend is running 🚀",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {"message": "InsightX Backend is running 🚀"}
