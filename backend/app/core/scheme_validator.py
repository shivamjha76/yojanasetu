"""
Core Scheme Dataset Validator
Ensures all schemes adhere strictly to the Scheme Pydantic model and business logic constraints.
"""

import json
from pathlib import Path
from typing import List, Tuple
from app.models.schemas import Scheme


def validate_scheme_dict(data: dict) -> Scheme:
    """Validates a single raw scheme dictionary against the Pydantic schema."""
    return Scheme.model_validate(data)


def validate_schemes_file(file_path: Path) -> Tuple[bool, List[Scheme], List[str]]:
    """
    Validates an entire schemes JSON file.
    Returns: (is_valid, list_of_valid_schemes, list_of_error_messages)
    """
    errors = []
    schemes = []

    if not file_path.exists():
        return False, [], [f"File not found: {file_path}"]

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except Exception as e:
        return False, [], [f"Invalid JSON format: {str(e)}"]

    if not isinstance(raw_data, list):
        return False, [], ["Root JSON element must be an array of schemes."]

    seen_ids = set()
    for index, item in enumerate(raw_data):
        try:
            scheme = Scheme.model_validate(item)
            if scheme.id in seen_ids:
                errors.append(f"Duplicate scheme ID '{scheme.id}' at index {index}")
            else:
                seen_ids.add(scheme.id)
                schemes.append(scheme)
        except Exception as err:
            errors.append(f"Scheme at index {index} ('{item.get('id', 'unknown')}') failed validation: {err}")

    is_valid = len(errors) == 0
    return is_valid, schemes, errors
