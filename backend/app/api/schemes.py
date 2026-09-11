"""
Schemes Discovery & Search API Routes
Provides endpoints for browsing, searching, and filtering welfare schemes.
"""

from typing import Optional, List, Dict, Any, Literal
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from app.models.schemas import Scheme
from app.services.scheme_service import scheme_service

router = APIRouter()


class SchemesListResponse(BaseModel):
    total: int = Field(..., description="Total matching schemes count")
    limit: int = Field(..., description="Requested page limit")
    offset: int = Field(..., description="Requested offset")
    schemes: List[Scheme] = Field(..., description="List of matching schemes")


@router.get(
    "/schemes",
    response_model=SchemesListResponse,
    summary="Discover and filter government welfare schemes",
    description="Retrieve government schemes with full-text search and category/state/level filtering.",
)
def list_schemes(
    q: Optional[str] = Query(
        default=None,
        description="Search query across scheme names, summaries, or ministries in Hindi or English",
    ),
    search: Optional[str] = Query(
        default=None,
        description="Alternative alias for search query",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter by scheme category (e.g. 'agriculture', 'education_scholarships', 'healthcare')",
    ),
    state: Optional[str] = Query(
        default=None,
        description="Filter by applicant state (e.g. 'Madhya Pradesh', 'Rajasthan')",
    ),
    level: Optional[Literal["central", "state"]] = Query(
        default=None,
        description="Filter by administrative level ('central' or 'state')",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
        description="Maximum number of schemes to return",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of schemes to skip for pagination",
    ),
):
    effective_query = q or search
    schemes, total = scheme_service.search(
        query=effective_query,
        category=category,
        state=state,
        level=level,
        limit=limit,
        offset=offset,
    )
    return SchemesListResponse(
        total=total,
        limit=limit,
        offset=offset,
        schemes=schemes,
    )


@router.get(
    "/schemes/{id}",
    response_model=Scheme,
    summary="Get single scheme detailed view",
    description="Retrieve comprehensive details of a scheme including rules, documents, and application steps.",
)
def get_scheme_by_id(id: str):
    scheme = scheme_service.get_by_id(id)
    if not scheme:
        raise HTTPException(
            status_code=404,
            detail=f"Scheme with ID '{id}' not found",
        )
    return scheme
