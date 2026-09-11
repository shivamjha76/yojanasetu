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

# Initialize SQLite Database
from app.db.database import init_db
init_db()

from app.api.auth import router as auth_router
from app.api.schemes import router as schemes_router
from app.api.eligibility import router as eligibility_router
from app.api.metadata import router as metadata_router
from app.api.assistant import router as assistant_router
from app.api.csc import router as csc_router
from app.api.documents import router as documents_router
from app.api.operator import router as operator_router
from app.api.household import router as household_router
from app.api.ingest import router as ingest_router

app.include_router(auth_router, prefix="/api", tags=["Authentication & Citizen Accounts"])
app.include_router(schemes_router, prefix="/api", tags=["Schemes"])
app.include_router(eligibility_router, prefix="/api", tags=["Eligibility"])
app.include_router(metadata_router, prefix="/api", tags=["Metadata"])
app.include_router(assistant_router, prefix="/api", tags=["AI Assistant"])
app.include_router(csc_router, prefix="/api", tags=["Jan Seva Kendra / CSC"])
app.include_router(documents_router, prefix="/api", tags=["Document Verification"])
app.include_router(operator_router, prefix="/api", tags=["Assisted Mode / Operator"])
app.include_router(household_router, prefix="/api", tags=["Household Combined Claim"])
app.include_router(ingest_router, prefix="/api", tags=["Scheme Ingestion Pipeline"])


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
