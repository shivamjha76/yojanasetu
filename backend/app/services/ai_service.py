"""
AI Service Wrapper (Setu Sahayak Intelligence Layer)
Connects to Google Gemini or OpenAI to parse citizen language (Hindi/Hinglish/English)
and provide grounded scheme explanations.

Rule: "We use AI to understand the citizen, NOT to make eligibility decisions."
"""

import json
import logging
import re
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("yojanasetu.ai")


class AIServiceException(Exception):
    """Custom exception raised when an AI service call fails."""
    pass


class AIService:
    """
    Unified LLM Client supporting Google Gemini, OpenAI, and a Mock/Offline fallback.
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        gemini_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.provider = (provider or settings.llm_provider).lower()
        self.model = model or settings.llm_model
        self.gemini_api_key = gemini_api_key or settings.gemini_api_key
        self.openai_api_key = openai_api_key or settings.openai_api_key
        self.timeout = timeout or settings.llm_timeout_seconds

    def is_configured(self) -> bool:
        """Checks if active provider has an API key configured or is in mock mode."""
        if self.provider == "gemini":
            return bool(self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here")
        elif self.provider == "openai":
            return bool(self.openai_api_key and self.openai_api_key != "your_openai_api_key_here")
        elif self.provider == "mock":
            return True
        return False

    def get_provider_info(self) -> Dict[str, Any]:
        """Returns metadata about active LLM client."""
        return {
            "provider": self.provider,
            "model": self.model,
            "is_configured": self.is_configured(),
            "fallback_available": True,
        }

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_mode: bool = False,
    ) -> str:
        """
        Synchronously generates text or JSON from configured LLM provider.
        Falls back to Mock provider if API key is not configured.
        """
        if not self.is_configured():
            logger.info("No active LLM API key detected. Using Mock Fallback Provider.")
            return self._mock_generate(prompt, system_instruction, json_mode)

        try:
            if self.provider == "gemini":
                return self._call_gemini(prompt, system_instruction, json_mode)
            elif self.provider == "openai":
                return self._call_openai(prompt, system_instruction, json_mode)
            else:
                return self._mock_generate(prompt, system_instruction, json_mode)
        except Exception as e:
            logger.warning(f"AI Provider ({self.provider}) call failed: {e}. Falling back to mock engine.")
            return self._mock_generate(prompt, system_instruction, json_mode)

    async def generate_async(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_mode: bool = False,
    ) -> str:
        """
        Asynchronously generates text or JSON from configured LLM provider.
        Falls back to Mock provider if API key is not configured.
        """
        if not self.is_configured():
            return self._mock_generate(prompt, system_instruction, json_mode)

        try:
            if self.provider == "gemini":
                return await self._call_gemini_async(prompt, system_instruction, json_mode)
            elif self.provider == "openai":
                return await self._call_openai_async(prompt, system_instruction, json_mode)
            else:
                return self._mock_generate(prompt, system_instruction, json_mode)
        except Exception as e:
            logger.warning(f"AI Provider ({self.provider}) async call failed: {e}. Falling back to mock engine.")
            return self._mock_generate(prompt, system_instruction, json_mode)

    # -------------------------------------------------------------
    # Google Gemini REST Client
    # -------------------------------------------------------------
    def _call_gemini(
        self,
        prompt: str,
        system_instruction: Optional[str],
        json_mode: bool,
    ) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.gemini_api_key}"
        payload = self._build_gemini_payload(prompt, system_instruction, json_mode)

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return self._parse_gemini_response(data)

    async def _call_gemini_async(
        self,
        prompt: str,
        system_instruction: Optional[str],
        json_mode: bool,
    ) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.gemini_api_key}"
        payload = self._build_gemini_payload(prompt, system_instruction, json_mode)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return self._parse_gemini_response(data)

    def _build_gemini_payload(
        self, prompt: str, system_instruction: Optional[str], json_mode: bool
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1 if json_mode else 0.3,
            },
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"
        return payload

    def _parse_gemini_response(self, data: Dict[str, Any]) -> str:
        candidates = data.get("candidates", [])
        if not candidates:
            raise AIServiceException("Gemini returned empty candidate response")
        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise AIServiceException("Gemini candidate has no content parts")
        return parts[0].get("text", "")

    # -------------------------------------------------------------
    # OpenAI REST Client
    # -------------------------------------------------------------
    def _call_openai(
        self,
        prompt: str,
        system_instruction: Optional[str],
        json_mode: bool,
    ) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = self._build_openai_payload(prompt, system_instruction, json_mode)

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return self._parse_openai_response(data)

    async def _call_openai_async(
        self,
        prompt: str,
        system_instruction: Optional[str],
        json_mode: bool,
    ) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = self._build_openai_payload(prompt, system_instruction, json_mode)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return self._parse_openai_response(data)

    def _build_openai_payload(
        self, prompt: str, system_instruction: Optional[str], json_mode: bool
    ) -> Dict[str, Any]:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1 if json_mode else 0.3,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        return payload

    def _parse_openai_response(self, data: Dict[str, Any]) -> str:
        choices = data.get("choices", [])
        if not choices:
            raise AIServiceException("OpenAI returned no choices")
        return choices[0].get("message", {}).get("content", "")

    # -------------------------------------------------------------
    # Mock / Fallback Provider (Deterministic Offline Parsing)
    # -------------------------------------------------------------
    def _mock_generate(
        self,
        prompt: str,
        system_instruction: Optional[str],
        json_mode: bool,
    ) -> str:
        """
        Deterministic offline simulator for tests, development, and offline environments.
        Uses regex and heuristics to extract citizen profiles from Hindi/English inputs.
        """
        if not json_mode:
            if "Verified Scheme Facts:" in prompt:
                if "उत्तर हिंदी में" in prompt:
                    return (
                        "यह योजना पात्र नागरिकों को वित्तीय और सामाजिक सुरक्षा प्रदान करती है। "
                        "आप आवश्यक दस्तावेजों (जैसे आधार कार्ड और बैंक पासबुक) के साथ आधिकारिक पोर्टल पर सीधा आवेदन कर सकते हैं।"
                    )
                else:
                    return (
                        "This welfare scheme provides financial and social assistance to eligible citizens. "
                        "You can apply directly through the official portal using your required identity documents."
                    )

            return (
                "योजनासेतु सहायक: मैं आपकी सरकारी योजनाओं की जानकारी और पात्रता समझने में मदद कर सकता हूँ। "
                "कृपया अपनी आयु, राज्य, और व्यवसाय बताएं।"
            )

        # Basic heuristic extraction for fallback testing
        text = prompt.lower()

        # Age detection (e.g. "35 saal", "age 40", "22 वर्ष", "20 years old", "28 साल")
        age_match = (
            re.search(r"(?:umar|age|उम्र|आयु)\s*(?:is|hai|:)?\s*(\d{1,2})", text)
            or re.search(r"(\d{1,2})\s*(?:saal|year|वर्ष|sal|साल)", text)
            or re.search(r"(\d{1,2})\s*years?\s*old", text)
        )
        age = int(age_match.group(1)) if age_match else 30

        # Gender detection
        gender = "female" if any(w in text for w in ["aurat", "mahila", "female", "woman", "ladki", "girl", "महिला", "स्त्री"]) else "male"

        # State detection
        state = "All India"
        state_aliases = {
            "Madhya Pradesh": [r"\bmadhya pradesh\b", r"\bmp\b", "मध्य प्रदेश"],
            "Uttar Pradesh": [r"\buttar pradesh\b", r"\bup\b", "उत्तर प्रदेश"],
            "Bihar": [r"\bbihar\b", "बिहार"],
            "Rajasthan": [r"\brajasthan\b", r"\brj\b", "राजस्थान"],
            "Maharashtra": [r"\bmaharashtra\b", r"\bmh\b", "महाराष्ट्र"],
            "Delhi": [r"\bdelhi\b", r"\bdl\b", "दिल्ली"],
            "Gujarat": [r"\bgujarat\b", r"\bgj\b", "गुजरात"],
            "Jharkhand": [r"\bjharkhand\b", r"\bjh\b", "झारखंड"],
            "Chhattisgarh": [r"\bchhattisgarh\b", "छत्तीसगढ़"],
            "Uttarakhand": [r"\buttarakhand\b", "उत्तराखंड"],
            "Punjab": [r"\bpunjab\b", "पंजाब"],
            "Haryana": [r"\bharyana\b", "हरियाणा"],
            "West Bengal": [r"\bwest bengal\b", "पश्चिम बंगाल"],
        }
        for st, patterns in state_aliases.items():
            if any(re.search(pat, text) for pat in patterns):
                state = st
                break

        # Occupation detection
        occupation = "other"
        if any(w in text for w in ["kisan", "farmer", "kheti", "किसान", "कृषक"]):
            occupation = "farmer"
        elif any(w in text for w in ["student", "padhai", "college", "छात्र", "विद्यार्थी"]):
            occupation = "student"
        elif any(w in text for w in ["ghar sambhalti", "ghar", "homemaker", "housewife", "गृहणी", "घर संभालती"]):
            occupation = "homemaker"
        elif any(w in text for w in ["company", "private company", "private job", "निजी"]):
            occupation = "employed_private"
        elif any(w in text for w in ["dukan", "shopkeeper", "vyapar", "business", "दुकान", "व्यापार"]):
            occupation = "business_self_employed"
        elif any(w in text for w in ["vendor", "thela", "रेहड़ी", "पटरी", "मजदूर", "daily wage"]):
            occupation = "daily_wage_laborer"
        elif any(w in text for w in ["berojgar", "unemployed", "job search", "बेरोजगार"]):
            occupation = "unemployed"

        # Category detection
        category = "general"
        if re.search(r"\b(sc|अनुसूचित जाति)\b", text):
            category = "sc"
        elif re.search(r"\b(st|अनुसूचित जनजाति)\b", text):
            category = "st"
        elif re.search(r"\b(obc|ओबीसी|पिछड़ा)\b", text):
            category = "obc"
        elif re.search(r"\b(ews)\b", text):
            category = "ews"

        # Income detection
        income = 120000.0
        income_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|hazar|हजार|लाख)", text)
        if income_match:
            val = float(income_match.group(1))
            if "lakh" in text or "लाख" in text:
                income = val * 100000.0
            elif "hazar" in text or "हजार" in text:
                income = val * 1000.0
                if "mahine" in text or "monthly" in text or "per month" in text:
                    income *= 12

        # Differently abled detection
        is_divyang = any(w in text for w in ["divyang", "disability", "disabled", "handicapped", "विकलांग", "दिव्यांग"])

        # Ration card detection
        ration_card = "none"
        if "antyodaya" in text or "अंत्योदय" in text:
            ration_card = "antyodaya"
        elif "bpl" in text or "गरीब" in text or "बीपीएल" in text:
            ration_card = "bpl"

        profile = {
            "age": age,
            "gender": gender,
            "state": state,
            "occupation": occupation,
            "category": category,
            "annual_income": income,
            "is_differently_abled": is_divyang,
            "ration_card_type": ration_card,
        }

        return json.dumps(profile, ensure_ascii=False)


# Global singleton instance
ai_service = AIService()
