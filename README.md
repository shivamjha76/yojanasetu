# 🌉 योजनासेतु (YojanaSetu)
> **“Know what you qualify for. Know why. Know what to do next.”**

योजनासेतु (YojanaSetu) एक 100% नागरिक-केंद्रित (Direct Citizen) डिजिटल प्लेटफ़ॉर्म है, जो आम नागरिकों को भारत सरकार (केंद्र एवं राज्य) की कल्याणकारी योजनाओं से सीधे जोड़ता है।

---

## ⚡ मुख्य सिद्धांत (Core Principles)
1. **100% Direct Citizen:** कोई NGO या बिचौलिया नहीं। नागरिक सीधे योजनाओं की खोज, पात्रता जांच और आवेदन कर सकते हैं।
2. **Deterministic Rule Engine (The Heart):** *"We use AI to understand the citizen, not to decide their eligibility."* पात्रता का निर्णय 100% सटीक गणितीय नियमों पर आधारित है, जिससे AI की कोई गलत जानकारी (Hallucination) नहीं होती।
3. **Explainable Eligibility ("Why You Qualify"):** हर योजना के लिए नागरिक को स्पष्ट प्रमाण (Evidence) दिखता है कि वे किस शर्त पर पात्र हैं।
4. **Document Readiness Checklist:** आवश्यक दस्तावेज़ों की स्पष्ट चेकलिस्ट और स्थिति।
5. **Verified Government Links & CSC Path:** सीधे आधिकारिक पोर्टल का लिंक या नजदीकी जन सेवा केंद्र (CSC) की जानकारी।
6. **shadcn/ui Inspired Design:** Slate/Zinc न्यूट्रल बेस, 1px सब्टल बॉर्डर, और उच्च पठनीयता (Accessibility)।

---

## 📁 प्रोजेक्ट संरचना (Directory Structure)

```text
yojanasetu/
├── backend/            # FastAPI Python backend & Deterministic Rule Engine
│   ├── app/
│   │   ├── api/        # REST endpoints (schemes, eligibility, assistant)
│   │   ├── core/       # Configurations & Rule engine logic
│   │   ├── models/     # Pydantic schemas
│   │   └── services/   # Scheme & AI extraction services
│   └── tests/          # Rule engine & API unit tests
├── frontend/           # Next.js / Vite React + TypeScript + shadcn/ui frontend
│   ├── src/
│   │   ├── components/ # Reusable UI atoms, scheme cards, wizard
│   │   ├── pages/      # Landing, Schemes, Eligibility, Scheme Details
│   │   └── lib/        # Utilities, API client, language helpers
├── data/               # Structured schemes JSON dataset
└── docs/               # Architecture, API specs, and research documentation
```

---

## 🚀 50-Step Roadmap Progress
- [x] **Step 1:** Project directory structure, `.gitignore`, and documentation initialized.
- [ ] **Step 2:** Backend Python virtual environment and core dependencies setup.
