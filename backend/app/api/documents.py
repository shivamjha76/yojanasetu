"""
YojanaSetu Document Verification API Router
Provides endpoints to upload and verify citizen documents using AI multimodal analysis.
"""

import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.models.document_verification import DocumentVerifyResponse
from app.services.ai_service import ai_service
from app.services.scheme_service import SchemeService

logger = logging.getLogger("yojanasetu.api.documents")
router = APIRouter()
scheme_repo = SchemeService()

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "image/heic",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post(
    "/documents/verify",
    response_model=DocumentVerifyResponse,
    summary="Verify citizen document against scheme requirements using AI multimodal analysis",
    description="Accepts document upload (image/PDF) and verifies eligibility criteria for a specific scheme.",
)
async def verify_scheme_document(
    file: UploadFile = File(..., description="Uploaded document image (JPEG/PNG/WebP) or PDF"),
    scheme_id: str = Form(..., description="Unique scheme identifier (e.g. 'pm-kisan', 'post-matric-scholarship')"),
    document_type: str = Form(..., description="Document requirement ID (e.g. 'aadhaar', 'income_certificate')"),
    document_name: Optional[str] = Form(None, description="Human readable document title"),
    language: Optional[str] = Form("hi", description="Citizen interface language ('hi' or 'en')"),
    previous_extracted_data: Optional[str] = Form(None, description="JSON string of previously verified document data for consistency checks"),
) -> DocumentVerifyResponse:
    # 1. Validate Scheme
    scheme = scheme_repo.get_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found.",
        )

    # 2. Derive Document Name if not provided
    resolved_doc_name = document_name
    if not resolved_doc_name:
        for doc in scheme.documents:
            if doc.id.lower() == document_type.lower():
                resolved_doc_name = doc.name_hi if language == "hi" else doc.name_en
                break
        if not resolved_doc_name:
            resolved_doc_name = document_type.replace("_", " ").title()

    # 3. Validate MIME type
    content_type = file.content_type or "image/jpeg"
    if content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{content_type}'. Please upload JPEG, PNG, WebP, or PDF.",
        )

    # 4. Read File Content & Validate Size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file exceeds maximum allowed limit of 10 MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 5. Extract Scheme Rules for verification
    rules_data = [rule.model_dump() for rule in scheme.rules]
    scheme_display_name = scheme.name_hi if language == "hi" else scheme.name_en

    logger.info(
        f"Verifying document '{document_type}' ({resolved_doc_name}) for scheme '{scheme.id}' (File: {file.filename}, Size: {len(file_bytes)} bytes)"
    )

    # 6. Parse Previous Extracted Data for Cross-Document Consistency
    parsed_prior_data = None
    if previous_extracted_data:
        try:
            import json
            parsed_prior_data = json.loads(previous_extracted_data)
        except Exception as err:
            logger.warning(f"Failed to parse previous_extracted_data JSON: {err}")

    # 7. Execute AI Verification
    try:
        raw_result = await ai_service.verify_document_async(
            file_bytes=file_bytes,
            mime_type=content_type,
            document_type=document_type,
            document_name=resolved_doc_name,
            scheme_name=scheme_display_name,
            scheme_rules=rules_data,
            filename=file.filename,
            previous_extracted_data=parsed_prior_data,
        )

        return DocumentVerifyResponse(**raw_result)

    except Exception as e:
        logger.error(f"Error during document verification for {scheme.id}: {e}", exc_info=True)
        # Safe fallback response if unexpected error occurs
        return DocumentVerifyResponse(
            status="unclear_image",
            is_eligible=False,
            confidence_score=0.5,
            title_hi="सत्यापन में समस्या आई",
            title_en="Verification Error",
            reason_hi="तकनीकी कारणों से दस्तावेज़ का सत्यापन पूरा नहीं हो सका। कृपया पुनः प्रयास करें।",
            reason_en="Could not complete document verification due to a temporary error. Please try again.",
            suggestion_hi="कृपया कुछ समय बाद पुनः प्रयास करें या CSC केंद्र से सहायता लें।",
            suggestion_en="Please try again in a few moments or seek assistance from a nearby CSC center.",
        )
