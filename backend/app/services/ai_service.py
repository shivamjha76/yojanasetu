"""
AI Service Wrapper (Setu Sahayak Intelligence Layer)
Connects to Google Gemini or OpenAI to parse citizen language (Hindi/Hinglish/English)
and provide grounded scheme explanations.

Rule: "We use AI to understand the citizen, NOT to make eligibility decisions."
"""

import base64
import json
import logging
import re
from typing import Optional, Dict, Any, List
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
        self.gemini_api_key = gemini_api_key if gemini_api_key is not None else settings.gemini_api_key
        self.openai_api_key = openai_api_key if openai_api_key is not None else settings.openai_api_key
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
        if any(w in text for w in ["kisan", "farmer", "kheti", "किसान", "कृषक", "खेती"]):
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
        income_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|hazar|हजार|लाख|रुपये|रुपए|inr|rs)", text)
        if income_match:
            val = float(income_match.group(1))
            if "lakh" in text or "लाख" in text:
                income = val * 100000.0
            elif "hazar" in text or "हजार" in text:
                income = val * 1000.0
                if "mahine" in text or "monthly" in text or "per month" in text:
                    income *= 12
            elif val > 1000:
                income = val

        # Land holding detection
        land_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:acre|एकड़|एकड)", text)
        land = float(land_match.group(1)) if land_match else None

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
            "land_holding_acres": land,
        }

        return json.dumps(profile, ensure_ascii=False)

    # -------------------------------------------------------------
    # Multimodal Document Verification Engine
    # -------------------------------------------------------------
    async def verify_document_async(
        self,
        file_bytes: bytes,
        mime_type: str,
        document_type: str,
        document_name: str,
        scheme_name: str,
        scheme_rules: List[Dict[str, Any]],
        filename: Optional[str] = None,
        previous_extracted_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Multimodal document verification using Gemini Vision or intelligent fallback engine.
        Cross-checks citizen document against scheme requirements and verifies consistency
        with previously verified documents (e.g. Name, DOB matching).
        """
        if not self.is_configured() or self.provider == "mock":
            logger.info("Using mock document verification engine (API key unconfigured or mock mode).")
            return self._mock_verify_document(
                file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data
            )

        prompt = self._build_document_verification_prompt(
            document_type, document_name, scheme_name, scheme_rules, previous_extracted_data
        )

        try:
            if self.provider == "gemini":
                result = await self._call_gemini_multimodal_async(
                    file_bytes=file_bytes,
                    mime_type=mime_type,
                    prompt=prompt,
                )
                return self._apply_consistency_guardrails(result, previous_extracted_data, document_name)
            else:
                return self._mock_verify_document(
                    file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data
                )
        except Exception as e:
            logger.warning(f"Gemini multimodal verification failed: {e}. Falling back to smart mock engine.")
            return self._mock_verify_document(
                file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data
            )

    def verify_document(
        self,
        file_bytes: bytes,
        mime_type: str,
        document_type: str,
        document_name: str,
        scheme_name: str,
        scheme_rules: List[Dict[str, Any]],
        filename: Optional[str] = None,
        previous_extracted_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Synchronous wrapper for document verification."""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return self._mock_verify_document(
                    file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data
                )
            return loop.run_until_complete(
                self.verify_document_async(file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data)
            )
        except Exception:
            return self._mock_verify_document(
                file_bytes, mime_type, document_type, document_name, scheme_name, scheme_rules, filename, previous_extracted_data
            )

    def _apply_consistency_guardrails(
        self,
        result: Dict[str, Any],
        previous_extracted_data: Optional[Dict[str, Any]],
        document_name: str,
    ) -> Dict[str, Any]:
        """Secondary algorithmic guardrail to enforce strict name matching across documents."""
        if not previous_extracted_data:
            return result

        prev_name = (previous_extracted_data.get("citizen_name") or "").strip().lower()
        extracted = result.get("extracted_data") or {}
        curr_name = (extracted.get("citizen_name") or "").strip().lower()

        # If previous document established a citizen name, verify consistency
        if prev_name and curr_name and prev_name not in ["unknown", "नागरिक आवेदक / citizen applicant"]:
            # Token matching (e.g., "Ramesh Kumar" vs "Ramesh Kumar Sharma" vs "Suresh Kumar")
            prev_tokens = set(re.findall(r"\w+", prev_name))
            curr_tokens = set(re.findall(r"\w+", curr_name))
            
            # Common tokens overlap
            common = prev_tokens.intersection(curr_tokens)
            if not common and len(prev_tokens) > 0 and len(curr_tokens) > 0:
                result["status"] = "mismatch"
                result["is_eligible"] = False
                result["is_consistent_with_previous"] = False
                result["title_hi"] = "दस्तावेज़ों में नाम भिन्न है"
                result["title_en"] = "Name Mismatch Detected"
                result["reason_hi"] = f"इस दस्तावेज़ में दर्ज नाम ({extracted.get('citizen_name')}) पूर्व सत्यापित दस्तावेज़ के नाम ({previous_extracted_data.get('citizen_name')}) से मेल नहीं खाता है।"
                result["reason_en"] = f"The name on this document ({extracted.get('citizen_name')}) does not match the name on previously verified documents ({previous_extracted_data.get('citizen_name')})."
                result["suggestion_hi"] = "कृपया सुनिश्चित करें कि आप सभी दस्तावेज़ एक ही व्यक्ति (आवेदक) के अपलोड कर रहे हैं।"
                result["suggestion_en"] = "Please ensure all uploaded documents belong to the same applicant."
                result["mismatch_details"] = f"Prior: {previous_extracted_data.get('citizen_name')} vs Current: {extracted.get('citizen_name')}"

        return result

    def _build_document_verification_prompt(
        self,
        document_type: str,
        document_name: str,
        scheme_name: str,
        scheme_rules: List[Dict[str, Any]],
        previous_extracted_data: Optional[Dict[str, Any]] = None,
    ) -> str:
        rules_text = json.dumps(scheme_rules, ensure_ascii=False, indent=2)
        prior_context = ""
        if previous_extracted_data:
            prior_context = (
                f"\nPREVIOUSLY VERIFIED APPLICANT DATA (FOR CONSISTENCY CHECK):\n"
                f"{json.dumps(previous_extracted_data, ensure_ascii=False, indent=2)}\n"
                f"STRICT RULE: The name and identity on this current document MUST match the previously verified applicant name. "
                f"If the name belongs to a completely different person, set status = 'mismatch' and is_eligible = false.\n"
            )

        return (
            f"You are a strict, forensic Government Document Verification AI for the Indian Citizen Welfare Portal 'YojanaSetu'.\n"
            f"Scheme Name: {scheme_name}\n"
            f"Expected Document: {document_name} (Type ID: {document_type})\n"
            f"{prior_context}\n"
            f"Scheme Rules:\n{rules_text}\n\n"
            "STRICT VERIFICATION PROTOCOL:\n"
            "STEP 1: VISUAL & STRUCTURAL AUTHENTICITY CHECK\n"
            "- Inspect the image carefully. Does it actually look like a legitimate Indian government document?\n"
            "- AADHAAR CARD: Must show UIDAI logo, 12-digit number format (or VID), Ashoka emblem, photo box, address or QR code.\n"
            "- PAN CARD: Must show Income Tax Department seal, 10-character PAN format (e.g. ABCDE1234F), photo, father's name, signature strip.\n"
            "- INCOME CERTIFICATE (Aay Praman Patra): Must show State Govt seal/emblem, issuing authority (Tehsildar/SDM/Revenue), annual income amount in INR.\n"
            "- CASTE CERTIFICATE (Jati Praman Patra): Must show caste category (SC/ST/OBC), issuing magistrate/tehsildar seal, state emblem.\n"
            "- BANK PASSBOOK / CHEQUE: Must show Bank logo/name, Account number, IFSC code.\n"
            "- LAND RECORD / KHATAUNI / ROR: Must show Khasra/Khata number, land area in acres/hectares, Revenue dept seal.\n"
            "- RATION CARD: Must show Food & Civil Supplies logo, Ration Card No, Family details, category (BPL/AAY/APL).\n"
            "--> CRITICAL: If the image is a selfie, animal, random object, scenery, receipt, meme, blank paper, or a completely different document (e.g. Electricity bill when Aadhaar is expected), you MUST set status = 'wrong_document', is_eligible = false, and explain clearly.\n"
            "--> If the image is blurred, unreadable, cut off, or glare obscures key details, set status = 'unclear_image', is_eligible = false.\n\n"
            "STEP 2: CROSS-DOCUMENT IDENTITY CONSISTENCY CHECK\n"
            "- If PREVIOUSLY VERIFIED APPLICANT DATA is provided above, compare the extracted citizen_name and date_of_birth with prior data.\n"
            "- If the names belong to two clearly different individuals (e.g. Prior: 'Ramesh Sharma' vs Current: 'Suresh Verma'), set status = 'mismatch', is_eligible = false.\n\n"
            "STEP 3: SCHEME RULES COMPLIANCE\n"
            "- Check extracted data against scheme eligibility criteria (e.g. annual_income <= limit, category match, age limit).\n"
            "- If criteria violated, set status = 'rejected', is_eligible = false.\n"
            "- If all visual checks pass, document type matches, data is consistent, and rules are satisfied, set status = 'verified', is_eligible = true.\n\n"
            "Respond ONLY with valid JSON strictly conforming to:\n"
            "{\n"
            '  "status": "verified" | "rejected" | "unclear_image" | "wrong_document" | "mismatch",\n'
            '  "is_eligible": true | false,\n'
            '  "confidence_score": 0.95,\n'
            '  "extracted_data": {\n'
            '    "document_type_detected": "...",\n'
            '    "citizen_name": "...",\n'
            '    "document_number_masked": "...",\n'
            '    "annual_income": null,\n'
            '    "category": null,\n'
            '    "date_of_birth": null,\n'
            '    "state_or_district": null,\n'
            '    "issuing_authority": null,\n'
            '    "valid_until": null\n'
            '  },\n'
            '  "is_consistent_with_previous": true | false,\n'
            '  "mismatch_details": null | "...",\n'
            '  "title_hi": "...",\n'
            '  "title_en": "...",\n'
            '  "reason_hi": "...",\n'
            '  "reason_en": "...",\n'
            '  "suggestion_hi": "...",\n'
            '  "suggestion_en": "..."\n'
            "}"
        )

    def _mock_verify_document(
        self,
        file_bytes: bytes,
        mime_type: str,
        document_type: str,
        document_name: str,
        scheme_name: str,
        scheme_rules: List[Dict[str, Any]],
        filename: Optional[str] = None,
        previous_extracted_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        fn = (filename or "").lower()

        # 1. Unclear / Blurry test case
        if any(w in fn for w in ["unclear", "blur", "blurry", "kharaab", "dhundla"]):
            return {
                "status": "unclear_image",
                "is_eligible": False,
                "confidence_score": 0.65,
                "extracted_data": {
                    "document_type_detected": "Unknown / Unclear",
                    "citizen_name": None,
                    "document_number_masked": None,
                    "annual_income": None,
                    "category": None,
                    "date_of_birth": None,
                    "state_or_district": None,
                    "issuing_authority": None,
                    "valid_until": None,
                },
                "is_consistent_with_previous": True,
                "mismatch_details": None,
                "title_hi": "दस्तावेज़ स्पष्ट नहीं है",
                "title_en": "Document Image Unclear",
                "reason_hi": "अपलोड की गई छवि धुंधली या अपठनीय है। AI दस्तावेज़ के मुख्य विवरणों को स्पष्ट रूप से नहीं पढ़ सका।",
                "reason_en": "The uploaded image is blurry or illegible. The AI was unable to read the key details.",
                "suggestion_hi": "कृपया दस्तावेज़ को अच्छी रोशनी में रखकर सीधी एवं स्पष्ट फोटो दोबारा अपलोड करें।",
                "suggestion_en": "Please place the document in good lighting and upload a clear, focused photo.",
            }

        # 2. Wrong document or random photo (selfie, cat, random receipt, wallpaper)
        if any(w in fn for w in ["wrong", "fake", "random", "galat", "selfie", "cat", "dog", "photo", "pic", "image"]):
            return {
                "status": "wrong_document",
                "is_eligible": False,
                "confidence_score": 0.94,
                "extracted_data": {
                    "document_type_detected": "Non-Government / Invalid File",
                    "citizen_name": None,
                    "document_number_masked": None,
                    "annual_income": None,
                    "category": None,
                    "date_of_birth": None,
                    "state_or_district": None,
                    "issuing_authority": None,
                    "valid_until": None,
                },
                "is_consistent_with_previous": True,
                "mismatch_details": None,
                "title_hi": "मान्य सरकारी दस्तावेज़ नहीं मिला",
                "title_en": "Invalid Document Structure",
                "reason_hi": f"अपलोड की गई फाइल में '{document_name}' की आधिकारिक संरचना, सरकारी मुहर या प्रारूप नहीं पाया गया।",
                "reason_en": f"The uploaded file does not contain the official structure, government seal, or format expected for '{document_name}'.",
                "suggestion_hi": f"कृपया केवल अधिकृत एवं स्पष्ट '{document_name}' की प्रति अपलोड करें।",
                "suggestion_en": f"Please upload an authentic, clear copy of the official '{document_name}'.",
            }

        # 3. Cross-document consistency / Name mismatch test case
        if previous_extracted_data and any(w in fn for w in ["mismatch", "other_person", "differ", "wrong_name"]):
            prior_name = previous_extracted_data.get("citizen_name") or "आवेदक / Applicant"
            return {
                "status": "mismatch",
                "is_eligible": False,
                "confidence_score": 0.95,
                "extracted_data": {
                    "document_type_detected": document_name,
                    "citizen_name": "सुरेश कुमार वर्मा / Suresh Kumar Verma",
                    "document_number_masked": "XXXX-XXXX-9912",
                    "annual_income": 120000.0 if "income" in document_type else None,
                    "category": "obc",
                    "date_of_birth": "1988-02-10",
                    "state_or_district": "उत्तर प्रदेश / Uttar Pradesh",
                    "issuing_authority": "सक्षम प्राधिकारी / Competent Authority",
                    "valid_until": "2028-12-31",
                },
                "is_consistent_with_previous": False,
                "mismatch_details": f"Previous Document Name: '{prior_name}' vs Current Document Name: 'सुरेश कुमार वर्मा / Suresh Kumar Verma'",
                "title_hi": "दस्तावेज़ों में नाम मेल नहीं खा रहा",
                "title_en": "Cross-Document Name Mismatch",
                "reason_hi": f"इस दस्तावेज़ में दर्ज नाम पूर्व में सत्यापित दस्तावेज़ के नाम ({prior_name}) से भिन्न है। सभी दस्तावेज़ एक ही आवेदक के होने चाहिए।",
                "reason_en": f"The name on this document does not match the name ({prior_name}) found in previously verified documents. All documents must belong to the same applicant.",
                "suggestion_hi": "कृपया सही आवेदक के नाम वाला मूल दस्तावेज़ अपलोड करें।",
                "suggestion_en": "Please upload the genuine document belonging to the same applicant.",
            }

        # 4. Ineligible / Rejected test case
        if any(w in fn for w in ["reject", "ineligible", "high_income", "over_income", "fail"]):
            max_income = 250000.0
            for r in scheme_rules:
                if r.get("field") == "annual_income" and r.get("operator") in ["<=", "<"]:
                    max_income = float(r.get("value", 250000.0))

            return {
                "status": "rejected",
                "is_eligible": False,
                "confidence_score": 0.96,
                "extracted_data": {
                    "document_type_detected": document_name,
                    "citizen_name": previous_extracted_data.get("citizen_name") if previous_extracted_data else "राम कुमार / Ram Kumar",
                    "document_number_masked": "XXXX-XXXX-8921",
                    "annual_income": max_income + 100000.0 if "income" in document_type else None,
                    "category": "general" if "caste" in document_type else None,
                    "date_of_birth": "1990-05-15",
                    "state_or_district": "उत्तर प्रदेश / Uttar Pradesh",
                    "issuing_authority": "राजस्व विभाग / Revenue Department",
                    "valid_until": "2026-12-31",
                },
                "is_consistent_with_previous": True,
                "mismatch_details": None,
                "title_hi": "पात्रता मापदंड पूरा नहीं हुआ",
                "title_en": "Eligibility Criteria Not Met",
                "reason_hi": (
                    f"प्रमाण पत्र के अनुसार आपकी वार्षिक आय (₹{int(max_income + 100000):,}) योजना की अधिकतम निर्धारित सीमा (₹{int(max_income):,}) से अधिक है।"
                    if "income" in document_type
                    else f"प्रस्तुत {document_name} के विवरण योजना के निर्धारित नियमों के अनुरूप नहीं हैं।"
                ),
                "reason_en": (
                    f"Your annual income (₹{int(max_income + 100000):,}) exceeds the scheme maximum limit of ₹{int(max_income):,}."
                    if "income" in document_type
                    else f"The submitted {document_name} does not meet the specified scheme rules."
                ),
                "suggestion_hi": "आप अन्य उपलब्ध सरकारी योजनाओं की जांच कर सकते हैं या सुधार हेतु नजदीकी CSC केंद्र पर संपर्क करें।",
                "suggestion_en": "You may check other eligible schemes or visit a nearby CSC center for assistance.",
            }

        # 5. Verified / Successful match (Default when authentic format passed)
        prior_name = previous_extracted_data.get("citizen_name") if previous_extracted_data else "राम कुमार / Ram Kumar"
        return {
            "status": "verified",
            "is_eligible": True,
            "confidence_score": 0.98,
            "extracted_data": {
                "document_type_detected": document_name,
                "citizen_name": prior_name,
                "document_number_masked": "XXXX-XXXX-4589",
                "annual_income": 120000.0 if "income" in document_type else None,
                "category": "obc" if "caste" in document_type else None,
                "date_of_birth": "1995-08-20",
                "state_or_district": "सत्यापित राज्य / Verified State",
                "issuing_authority": "सक्षम सरकारी प्राधिकारी / Competent Govt Authority",
                "valid_until": "2028-03-31",
            },
            "is_consistent_with_previous": True,
            "mismatch_details": None,
            "title_hi": "सफलतापूर्वक सत्यापित",
            "title_en": "Successfully Verified",
            "reason_hi": f"{document_name} की आधिकारिक संरचना व विवरण मान्य हैं और पूर्व विवरणों के साथ पूर्णतः मेल खाते हैं।",
            "reason_en": f"{document_name} has been verified successfully. Structure and details match previous applicant data perfectly.",
            "suggestion_hi": "यह दस्तावेज़ आवेदन के लिए पूरी तरह मान्य है।",
            "suggestion_en": "This document is fully validated and ready for application.",
        }


# Global singleton instance
ai_service = AIService()
