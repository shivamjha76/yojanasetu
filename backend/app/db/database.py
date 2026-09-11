"""
SQLite Database Layer for YojanaSetu User Authentication & Saved Schemes
Provides lightweight, reliable local SQLite persistence with zero external service dependencies.
"""

import json
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
                citizen_details TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

        # Migrate existing users table if citizen_details column is missing
        cursor.execute("PRAGMA table_info(users);")
        columns = [col[1] for col in cursor.fetchall()]
        if "citizen_details" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN citizen_details TEXT;")

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

        # 3. Family / Beneficiary members table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS family_members (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                relationship TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                state TEXT,
                district TEXT,
                area_type TEXT DEFAULT 'urban',
                occupation TEXT NOT NULL,
                category TEXT NOT NULL,
                annual_income REAL DEFAULT 0,
                marital_status TEXT,
                is_differently_abled INTEGER DEFAULT 0,
                ration_card_type TEXT DEFAULT 'none',
                land_holding_acres REAL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);")

        # 4. Assisted Citizens table (for CSC operators & NGO field workers)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assisted_citizens (
                id TEXT PRIMARY KEY,
                operator_id TEXT NOT NULL DEFAULT 'default_operator',
                full_name TEXT NOT NULL,
                phone TEXT,
                village_ward TEXT,
                district TEXT,
                state TEXT,
                profile_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assisted_citizens_op ON assisted_citizens(operator_id);")

        # 5. Citizen Scheme Application Lifecycle Tracker
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citizen_applications (
                id TEXT PRIMARY KEY,
                citizen_id TEXT NOT NULL,
                scheme_id TEXT NOT NULL,
                scheme_name TEXT NOT NULL,
                benefit_amount TEXT,
                status TEXT NOT NULL DEFAULT 'ready_to_apply',
                ref_number TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (citizen_id) REFERENCES assisted_citizens(id) ON DELETE CASCADE,
                UNIQUE(citizen_id, scheme_id)
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_citizen_apps_cit ON citizen_applications(citizen_id);")

        conn.commit()


def _format_user_row(row: sqlite3.Row) -> Dict[str, Any]:
    """Parse citizen_details JSON and format user dictionary."""
    d = dict(row)
    if "citizen_details" in d and d["citizen_details"]:
        try:
            d["citizen_details"] = json.loads(d["citizen_details"])
        except Exception:
            d["citizen_details"] = None
    else:
        d["citizen_details"] = None
    return d


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
        "citizen_details": None,
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
            return _format_user_row(row)
    return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by unique user ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return _format_user_row(row)
    return None


def save_citizen_details(user_id: str, details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Save or update citizen questionnaire profile details (My Details)."""
    user = get_user_by_id(user_id)
    if not user:
        return None

    details_json = json.dumps(details, ensure_ascii=False)
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE users
            SET citizen_details = ?, updated_at = ?
            WHERE id = ?
            """,
            (details_json, now, user_id),
        )
        conn.commit()

    return get_user_by_id(user_id)


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


def _format_family_member_row(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert a family_members row to a clean dict with boolean types."""
    d = dict(row)
    d["is_differently_abled"] = bool(d.get("is_differently_abled", 0))
    d["annual_income"] = float(d.get("annual_income", 0.0) or 0.0)
    d["land_holding_acres"] = float(d.get("land_holding_acres", 0.0) or 0.0)
    return d


def add_family_member(user_id: str, member_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new family/beneficiary member for a user."""
    member_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO family_members (
                id, user_id, name, relationship, age, gender, state, district,
                area_type, occupation, category, annual_income, marital_status,
                is_differently_abled, ration_card_type, land_holding_acres,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                member_id,
                user_id,
                member_data["name"].strip(),
                member_data["relationship"].strip().lower(),
                int(member_data["age"]),
                member_data["gender"].strip().lower(),
                member_data.get("state"),
                member_data.get("district"),
                member_data.get("area_type", "urban"),
                member_data["occupation"].strip().lower(),
                member_data["category"].strip().lower(),
                float(member_data.get("annual_income", 0.0) or 0.0),
                member_data.get("marital_status"),
                1 if member_data.get("is_differently_abled") else 0,
                member_data.get("ration_card_type", "none"),
                float(member_data.get("land_holding_acres", 0.0) or 0.0),
                now,
                now,
            ),
        )
        conn.commit()

    return get_family_member(user_id, member_id) or {}


def get_family_members(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all family members saved by a user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at ASC",
            (user_id,),
        )
        rows = cursor.fetchall()
        return [_format_family_member_row(r) for r in rows]


def get_family_member(user_id: str, member_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single family member belonging to a user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM family_members WHERE user_id = ? AND id = ?",
            (user_id, member_id),
        )
        row = cursor.fetchone()
        if row:
            return _format_family_member_row(row)
    return None


def update_family_member(
    user_id: str, member_id: str, member_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Update an existing family member."""
    existing = get_family_member(user_id, member_id)
    if not existing:
        return None

    now = datetime.now(timezone.utc).isoformat()
    # Merge existing with updates
    merged = {**existing, **{k: v for k, v in member_data.items() if v is not None}}

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE family_members
            SET name = ?, relationship = ?, age = ?, gender = ?, state = ?,
                district = ?, area_type = ?, occupation = ?, category = ?,
                annual_income = ?, marital_status = ?, is_differently_abled = ?,
                ration_card_type = ?, land_holding_acres = ?, updated_at = ?
            WHERE user_id = ? AND id = ?
            """,
            (
                merged["name"].strip(),
                merged["relationship"].strip().lower(),
                int(merged["age"]),
                merged["gender"].strip().lower(),
                merged.get("state"),
                merged.get("district"),
                merged.get("area_type", "urban"),
                merged["occupation"].strip().lower(),
                merged["category"].strip().lower(),
                float(merged.get("annual_income", 0.0) or 0.0),
                merged.get("marital_status"),
                1 if merged.get("is_differently_abled") else 0,
                merged.get("ration_card_type", "none"),
                float(merged.get("land_holding_acres", 0.0) or 0.0),
                now,
                user_id,
                member_id,
            ),
        )
        conn.commit()

    return get_family_member(user_id, member_id)


def delete_family_member(user_id: str, member_id: str) -> bool:
    """Delete a family member belonging to a user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM family_members WHERE user_id = ? AND id = ?",
            (user_id, member_id),
        )
        conn.commit()
        return cursor.rowcount > 0


# =============================================================
# Assisted Mode & Operator DB Functions
# =============================================================

def _format_assisted_citizen(row: sqlite3.Row) -> Dict[str, Any]:
    """Parse profile_data JSON and format citizen dictionary."""
    d = dict(row)
    if "profile_data" in d and d["profile_data"]:
        try:
            d["profile_data"] = json.loads(d["profile_data"])
        except Exception:
            d["profile_data"] = {}
    else:
        d["profile_data"] = {}
    return d


def get_assisted_citizens(
    operator_id: str = "default_operator",
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List all citizens handled by a CSC operator or NGO worker."""
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM assisted_citizens WHERE operator_id = ?"
        params: List[Any] = [operator_id]

        if search:
            query += " AND (full_name LIKE ? OR phone LIKE ? OR village_ward LIKE ? OR district LIKE ?)"
            s_param = f"%{search.strip()}%"
            params.extend([s_param, s_param, s_param, s_param])

        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_format_assisted_citizen(r) for r in rows]


def get_assisted_citizen(citizen_id: str) -> Optional[Dict[str, Any]]:
    """Get a single assisted citizen by ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assisted_citizens WHERE id = ?", (citizen_id,))
        row = cursor.fetchone()
        return _format_assisted_citizen(row) if row else None


def create_assisted_citizen(
    full_name: str,
    profile_data: Dict[str, Any],
    phone: Optional[str] = None,
    village_ward: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    operator_id: str = "default_operator",
) -> Dict[str, Any]:
    """Create a new assisted citizen record."""
    citizen_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    profile_json = json.dumps(profile_data)

    resolved_district = district or profile_data.get("district")
    resolved_state = state or profile_data.get("state")

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO assisted_citizens (
                id, operator_id, full_name, phone, village_ward, district, state, profile_data, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                citizen_id,
                operator_id,
                full_name.strip(),
                phone.strip() if phone else None,
                village_ward.strip() if village_ward else None,
                resolved_district,
                resolved_state,
                profile_json,
                now,
                now,
            ),
        )
        conn.commit()

    return get_assisted_citizen(citizen_id)  # type: ignore


def update_assisted_citizen(
    citizen_id: str,
    full_name: Optional[str] = None,
    profile_data: Optional[Dict[str, Any]] = None,
    phone: Optional[str] = None,
    village_ward: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Update an existing assisted citizen record."""
    existing = get_assisted_citizen(citizen_id)
    if not existing:
        return None

    now = datetime.now(timezone.utc).isoformat()
    new_name = full_name.strip() if full_name else existing["full_name"]
    new_phone = phone.strip() if phone is not None else existing["phone"]
    new_village = village_ward.strip() if village_ward is not None else existing["village_ward"]
    new_profile = profile_data if profile_data is not None else existing["profile_data"]
    new_district = district if district is not None else (new_profile.get("district") or existing["district"])
    new_state = state if state is not None else (new_profile.get("state") or existing["state"])

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE assisted_citizens
            SET full_name = ?, phone = ?, village_ward = ?, district = ?, state = ?, profile_data = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                new_name,
                new_phone,
                new_village,
                new_district,
                new_state,
                json.dumps(new_profile),
                now,
                citizen_id,
            ),
        )
        conn.commit()

    return get_assisted_citizen(citizen_id)


def delete_assisted_citizen(citizen_id: str) -> bool:
    """Delete an assisted citizen record and related application records."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM citizen_applications WHERE citizen_id = ?", (citizen_id,))
        cursor.execute("DELETE FROM assisted_citizens WHERE id = ?", (citizen_id,))
        conn.commit()
        return cursor.rowcount > 0


def get_citizen_applications(citizen_id: str) -> List[Dict[str, Any]]:
    """List all tracked scheme applications for an assisted citizen."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM citizen_applications
            WHERE citizen_id = ?
            ORDER BY updated_at DESC
            """,
            (citizen_id,),
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def upsert_citizen_application(
    citizen_id: str,
    scheme_id: str,
    scheme_name: str,
    benefit_amount: Optional[str] = None,
    status: str = "ready_to_apply",
    ref_number: Optional[str] = None,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    """Insert or update a scheme application tracking status for a citizen."""
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM citizen_applications WHERE citizen_id = ? AND scheme_id = ?",
            (citizen_id, scheme_id),
        )
        existing = cursor.fetchone()
        if existing:
            app_id = existing["id"]
            cursor.execute(
                """
                UPDATE citizen_applications
                SET status = ?, ref_number = COALESCE(?, ref_number),
                    notes = COALESCE(?, notes), benefit_amount = COALESCE(?, benefit_amount),
                    updated_at = ?
                WHERE id = ?
                """,
                (status, ref_number, notes, benefit_amount, now, app_id),
            )
        else:
            app_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO citizen_applications (
                    id, citizen_id, scheme_id, scheme_name, benefit_amount, status, ref_number, notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    app_id,
                    citizen_id,
                    scheme_id,
                    scheme_name,
                    benefit_amount,
                    status,
                    ref_number,
                    notes,
                    now,
                    now,
                ),
            )
        conn.commit()

        cursor.execute("SELECT * FROM citizen_applications WHERE id = ?", (app_id,))
        return dict(cursor.fetchone())

