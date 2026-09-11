"""
YojanaSetu Core FastAPI Application
Citizen-centric welfare discovery and deterministic eligibility engine API.
"""

import logging
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.scheme_validator import validate_schemes_file

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("yojanasetu")

# Initialize FastAPI App
app = FastAPI(
    title="🌉 योजनासेतु (YojanaSetu) API",
    description="Citizen Bridge to Government Schemes - Deterministic Rule Evaluation & Discovery Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends (port 3000, 5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate schemes dataset
SCHEMES_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "schemes.json"


@app.get("/", tags=["System"])
def root():
    """Welcome endpoint with API navigation links."""
    return {
        "message": "Welcome to योजनासेतु (YojanaSetu) API",
        "tagline": "Know what you qualify for. Know why. Know what to do next.",
        "documentation": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["System"])
def health_check():
    """
    Health check route verifying service status and dataset readiness.
    """
    schemes_count = 0
    dataset_status = "unavailable"

    if SCHEMES_FILE.exists():
        is_valid, schemes, _ = validate_schemes_file(SCHEMES_FILE)
        if is_valid:
            schemes_count = len(schemes)
            dataset_status = "ready"
        else:
            dataset_status = "validation_error"

    return {
        "status": "healthy",
        "service": "YojanaSetu Core API",
        "version": "1.0.0",
        "dataset_status": dataset_status,
        "total_schemes_loaded": schemes_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
