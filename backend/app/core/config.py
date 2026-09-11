"""
Core Application Configuration
Loads environment variables for YojanaSetu backend and AI service.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

# Locate backend root and load .env if present
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    load_dotenv()


class Settings(BaseModel):
    app_name: str = "YojanaSetu"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "127.0.0.1")

    # LLM Assistant Configuration
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    llm_model: str = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    llm_timeout_seconds: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "30.0"))


settings = Settings()
