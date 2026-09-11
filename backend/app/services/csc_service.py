"""
Jan Seva Kendra / Common Services Center (CSC) Service
Loads verified centers and performs searching by pincode, district, state, and query.
"""

import json
import logging
from pathlib import Path
from typing import List, Optional
from app.models.schemas import CscCenter

logger = logging.getLogger("yojanasetu.csc")

CSC_DATA_FILE = Path(__file__).resolve().parent.parent.parent.parent / "data" / "csc_centers.json"


class CscService:
    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or CSC_DATA_FILE
        self._centers: List[CscCenter] = []
        self._load_centers()

    def _load_centers(self) -> None:
        """Load centers from verified JSON file."""
        if not self.data_path.exists():
            logger.warning(f"CSC dataset not found at {self.data_path}, initialized with empty list.")
            self._centers = []
            return

        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
            self._centers = [CscCenter(**item) for item in raw_data]
            logger.info(f"Loaded {len(self._centers)} verified CSC Jan Seva Kendras.")
        except Exception as e:
            logger.error(f"Error parsing CSC dataset: {e}")
            self._centers = []

    def get_all(self) -> List[CscCenter]:
        """Return all centers."""
        return self._centers

    def search(
        self,
        pincode: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        query: Optional[str] = None,
        service: Optional[str] = None,
    ) -> List[CscCenter]:
        """
        Filter centers based on criteria.
        """
        results = self._centers

        if pincode:
            pin_str = str(pincode).strip()
            # Exact or prefix match (e.g., 462 for Bhopal)
            results = [c for c in results if c.pincode.startswith(pin_str)]

        if state and state.lower() != "all":
            results = [c for c in results if c.state.lower() == state.strip().lower()]

        if district and district.lower() != "all":
            results = [c for c in results if district.strip().lower() in c.district.lower()]

        if service and service.lower() != "all":
            svc_term = service.strip().lower()
            results = [
                c for c in results
                if any(svc_term in s.lower() for s in c.services)
            ]

        if query:
            q = query.strip().lower()
            results = [
                c for c in results
                if q in c.center_name.lower()
                or q in c.vle_name.lower()
                or q in c.address.lower()
                or q in (c.landmark or "").lower()
                or q in c.pincode
                or q in c.district.lower()
            ]

        return results


# Global singleton instance
csc_service = CscService()
