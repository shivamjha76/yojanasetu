"""
SQLite Database Layer for YojanaSetu User Authentication & Saved Schemes
Provides lightweight, reliable local SQLite persistence with zero external service dependencies.
"""

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

# Database storage path in backend/data/yojanasetu.db
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "yojanasetu.db"


def get_connection() -> sqlite3.Connection:
    """Get a SQLite database connection with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database tables if they do not exist."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                full_name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                phone TEXT,
                state TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

        # 2. Saved schemes bookmark table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_schemes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                scheme_id TEXT NOT NULL,
                saved_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, scheme_id)
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_saved_schemes_user ON saved_schemes(user_id);")

        conn.commit()


def create_user(
    email: str,
    full_name: str,
    hashed_password: str,
    phone: Optional[str] = None,
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a new user account. Raises ValueError if email already exists."""
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    clean_email = email.strip().lower()

    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO users (id, email, full_name, hashed_password, phone, state, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, clean_email, full_name.strip(), hashed_password, phone, state, now, now),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError(f"An account with email '{email}' already exists.")

    return {
        "id": user_id,
        "email": clean_email,
        "full_name": full_name.strip(),
        "phone": phone,
        "state": state,
        "created_at": now,
        "updated_at": now,
    }


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by email address."""
    clean_email = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by unique user ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    state: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Update profile attributes for a citizen."""
    user = get_user_by_id(user_id)
    if not user:
        return None

    new_full_name = full_name.strip() if full_name else user["full_name"]
    new_phone = phone if phone is not None else user["phone"]
    new_state = state if state is not None else user["state"]
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE users
            SET full_name = ?, phone = ?, state = ?, updated_at = ?
            WHERE id = ?
            """,
            (new_full_name, new_phone, new_state, now, user_id),
        )
        conn.commit()

    return get_user_by_id(user_id)


def save_scheme_for_user(user_id: str, scheme_id: str) -> bool:
    """Bookmark a scheme for the user."""
    bookmark_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO saved_schemes (id, user_id, scheme_id, saved_at)
                VALUES (?, ?, ?, ?)
                """,
                (bookmark_id, user_id, scheme_id, now),
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            # Already saved
            return False


def remove_saved_scheme(user_id: str, scheme_id: str) -> bool:
    """Remove a bookmarked scheme for the user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM saved_schemes WHERE user_id = ? AND scheme_id = ?",
            (user_id, scheme_id),
        )
        conn.commit()
        return cursor.rowcount > 0


def get_saved_schemes(user_id: str) -> List[str]:
    """Get list of scheme IDs saved by the user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT scheme_id FROM saved_schemes WHERE user_id = ? ORDER BY saved_at DESC",
            (user_id,),
        )
        rows = cursor.fetchall()
        return [row["scheme_id"] for row in rows]
