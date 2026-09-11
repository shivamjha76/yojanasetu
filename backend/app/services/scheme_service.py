"""
YojanaSetu Scheme Service & Repository
Provides in-memory cached access, full-text searching, filtering, and lookup for welfare schemes.
"""

import logging
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any
from app.models.schemas import Scheme
from app.core.scheme_validator import validate_schemes_file

logger = logging.getLogger("yojanasetu.services.scheme")

DEFAULT_DATA_FILE = Path(__file__).resolve().parent.parent.parent.parent / "data" / "schemes.json"


class SchemeService:
    def __init__(self, data_file: Path = DEFAULT_DATA_FILE):
        self.data_file = data_file
        self._schemes: List[Scheme] = []
        self._schemes_by_id: Dict[str, Scheme] = {}
        self.load_schemes()

    def load_schemes(self) -> None:
        """Loads and validates all schemes from the JSON data file into cache."""
        is_valid, schemes, errors = validate_schemes_file(self.data_file)
        if not is_valid:
            logger.error(f"Failed to load schemes from {self.data_file}: {errors}")
            raise RuntimeError(f"Schemes dataset invalid: {errors}")

        self._schemes = schemes
        self._schemes_by_id = {s.id: s for s in schemes}
        logger.info(f"SchemeService cached {len(self._schemes)} schemes successfully.")

    def get_all(self) -> List[Scheme]:
        """Returns all loaded schemes."""
        return list(self._schemes)

    def get_by_id(self, scheme_id: str) -> Optional[Scheme]:
        """Looks up a scheme by its unique slug ID (case-insensitive)."""
        if not scheme_id:
            return None
        return self._schemes_by_id.get(scheme_id.strip().lower())

    def search(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        level: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Scheme], int]:
        """
        Searches and filters schemes with pagination.
        Returns: (paginated_schemes, total_matching_count)
        """
        results = self._schemes

        # 1. Filter by Level (central / state)
        if level:
            lvl_norm = level.strip().lower()
            results = [s for s in results if s.level == lvl_norm]

        # 2. Filter by Category
        if category:
            cat_norm = category.strip().lower()
            results = [s for s in results if s.category == cat_norm]

        # 3. Filter by State (Central schemes apply to all, state schemes must match)
        if state:
            st_norm = state.strip().lower()
            results = [
                s for s in results
                if s.level == "central" or (s.applicable_state and s.applicable_state.strip().lower() == st_norm)
            ]

        # 4. Keyword Search (Hindi & English text match)
        if query and query.strip():
            q_terms = [t.lower() for t in query.strip().split()]
            matched = []
            for s in results:
                searchable_text = " ".join([
                    s.name_en,
                    s.name_hi,
                    s.short_summary_en,
                    s.short_summary_hi,
                    s.ministry,
                    s.category,
                    s.benefit_amount_text,
                ]).lower()

                # Match if all search terms appear in searchable text
                if all(term in searchable_text for term in q_terms):
                    matched.append(s)
            results = matched

        total_count = len(results)
        paginated = results[offset : offset + limit]

        return paginated, total_count

    def get_categories_summary(self) -> List[Dict[str, Any]]:
        """Returns distinct categories with scheme count."""
        counts: Dict[str, int] = {}
        for s in self._schemes:
            counts[s.category] = counts.get(s.category, 0) + 1

        return [{"category": cat, "count": count} for cat, count in sorted(counts.items())]

    def get_states_summary(self) -> List[str]:
        """Returns list of unique states present in schemes dataset."""
        states = set()
        for s in self._schemes:
            if s.applicable_state:
                states.add(s.applicable_state)
        return sorted(list(states))


# Global singleton instance for application use
scheme_service = SchemeService()
