# 🏛️ योजनासेतु (YojanaSetu) - आर्किटेक्चर एवं डिज़ाइन गाइड

## 1. सिस्टम आर्किटेक्चर

```text
                     ┌──────────────────────────────┐
                     │           CITIZEN            │
                     │  Web UI (Desktop / Mobile)   │
                     │  Hindi / English / Hinglish  │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │   shadcn/ui Frontend Layer   │
                     │  - 2-Minute Eligibility Form │
                     │  - Omni Search + Voice Mic   │
                     │  - Scheme Detail & Checklist │
                     │  - "Setu Sahayak" AI Sheet   │
                     └──────────────┬───────────────┘
                                    │ REST API
                                    ▼
                     ┌──────────────────────────────┐
                     │     FastAPI Backend Core     │
                     │  - /api/schemes              │
                     │  - /api/eligibility/check    │
                     │  - /api/assistant/extract    │
                     └───────┬──────────────┬───────┘
                             │              │
              ┌──────────────┴──┐        ┌──┴────────────────┐
              ▼                 ▼        ▼                   ▼
    ┌──────────────────┐  ┌───────────┐  ┌─────────────┐  ┌──────────────┐
    │  DETERMINISTIC   │  │ SCHEMES   │  │ AI CITIZEN  │  │ CSC LOCATOR  │
    │   RULE ENGINE    │  │  DATASET  │  │ UNDERSTAND- │  │   SERVICE    │
    │  (Zero Halluc.)  │  │ (15 Real) │  │ ING (LLM)   │  │ (Pincode DB) │
    └──────────────────┘  └───────────┘  └─────────────┘  └──────────────┘
```

## 2. कोर कम्पोनेन्ट्स का विभाजन
1. **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui.
2. **Backend:** FastAPI, Pydantic v2.
3. **Rule Engine:** Pure Deterministic Python logic evaluating boolean/numerical/set rules.
4. **Data Store:** Formally validated JSON (`data/schemes.json`) with Pydantic schema validation.
