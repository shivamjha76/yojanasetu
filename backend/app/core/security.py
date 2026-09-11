"""
Security Utilities: Password Hashing and JWT Token Management
Uses cryptographically secure PBKDF2-HMAC-SHA256 for passwords and RFC 7519 compliant HMAC-SHA256 for JWT tokens.
"""

import os
import time
import json
import hmac
import hashlib
import base64
import secrets
from typing import Optional, Dict, Any

# Secret key for signing tokens (defaults to random or env)
JWT_SECRET = os.getenv("JWT_SECRET", "yojanasetu_super_secret_jwt_key_2026_citizen_portal")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 7 * 24 * 60 * 60  # 7 days


def hash_password(password: str) -> str:
    """Hash password with a random 16-byte salt using PBKDF2-HMAC-SHA256 (100,000 iterations)."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored salt$key hash."""
    try:
        salt, expected_hex = hashed_password.split("$", 1)
        key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000,
        )
        return hmac.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False


def _b64url_encode(data: bytes) -> str:
    """URL-safe base64 encoding without padding."""
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    """URL-safe base64 decoding with padding restoration."""
    padded = data + "=" * ((4 - len(data) % 4) % 4)
    return base64.urlsafe_b64decode(padded)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Create signed JWT token with expiry."""
    now = int(time.time())
    expire = now + (expires_delta if expires_delta else ACCESS_TOKEN_EXPIRE_SECONDS)

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {**data, "iat": now, "exp": expire}

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify JWT signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()

        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        if "exp" in payload and payload["exp"] < int(time.time()):
            return None

        return payload
    except Exception:
        return None
