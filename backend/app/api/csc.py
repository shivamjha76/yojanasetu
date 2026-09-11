"""
CSC (Common Services Center / Jan Seva Kendra) API Router
Provides endpoints to search and retrieve verified citizen assistance centers.
"""

from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import CscSearchResponse, CscCenter
from app.services.csc_service import csc_service

router = APIRouter(prefix="/csc", tags=["Jan Seva Kendra / CSC"])


@router.get("/search", response_model=CscSearchResponse)
def search_csc_centers(
    pincode: Optional[str] = Query(None, description="6-digit Indian PIN code or prefix"),
    state: Optional[str] = Query(None, description="State name"),
    district: Optional[str] = Query(None, description="District name"),
    service: Optional[str] = Query(None, description="Specific service like 'ekyc', 'ayushman', 'pm-kisan'"),
    q: Optional[str] = Query(None, description="Search query by name, landmark, address"),
):
    """
    Search verified Jan Seva Kendras (CSCs) by location, pincode, service, or keyword.
    """
    centers = csc_service.search(
        pincode=pincode,
        state=state,
        district=district,
        query=q,
        service=service,
    )
    return CscSearchResponse(total=len(centers), centers=centers)


@router.get("/centers", response_model=CscSearchResponse)
def get_all_csc_centers():
    """
    Get list of all verified CSC Jan Seva Kendras.
    """
    centers = csc_service.get_all()
    return CscSearchResponse(total=len(centers), centers=centers)
