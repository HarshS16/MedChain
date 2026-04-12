# MedChain — Decentralized AI-Powered Medical Record Ledger

## Vision

A blockchain-backed, AI-enhanced medical record system for India where every patient carries a single, tamper-proof health history — accessible by any verified doctor or hospital, owned entirely by the patient, and queryable through natural language.

No more fragmented records. No more "bring your old reports." No more doctors flying blind.

---

## Problem Statement

Patient medical records in India are:

- **Fragmented** — scattered across hospitals, clinics, labs, pharmacies with zero interoperability
- **Paper-dependent** — most prescriptions and reports exist as physical paper or unstructured photos
- **Inaccessible** — a doctor in Delhi has no way to see what a doctor in Chennai prescribed last year
- **Tamper-prone** — records can be altered, lost, or fabricated with no audit trail
- **Unqueryable** — even when digital, no system lets a doctor ask "what medications has this patient tried for diabetes?" and get a synthesized answer

---

## Solution Overview

MedChain is a **permissioned blockchain application** where:

1. Every patient has a unique on-chain identity (linked to ABHA ID)
2. Every medical interaction (consultation, prescription, lab report, surgery, diagnosis) is recorded as an immutable transaction
3. Only verified doctors and hospitals can read/write patient records (via smart contract access control)
4. An AI layer (RAG + summarization) sits on top, making years of medical history instantly queryable and digestible
5. The patient retains full ownership — they grant and revoke access

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Blockchain | Hyperledger Fabric | Permissioned, no gas fees, channel-based privacy, built for enterprise consortiums |
| Smart Contracts | Chaincode (Go/Node.js) | Native to Fabric, handles access control + record indexing |
| Off-Chain Storage | IPFS (private cluster) + PostgreSQL | IPFS for immutable file storage (reports, images), Postgres for structured metadata |
| Encryption | AES-256 (data at rest) + ECIES (key exchange) | Patient-controlled encryption, only authorized parties decrypt |
| Backend API | Node.js (Express/Fastify) | Connects frontend to blockchain, manages auth, orchestrates AI pipeline |
| Frontend | React (Next.js) | Doctor dashboard, patient portal, admin panel |
| AI — Embeddings | PubMedBERT / BGE-Med | Domain-specific medical embeddings for accurate retrieval |
| AI — Vector Store | pgvector (Supabase) | Vector search inside Postgres — single DB for metadata + embeddings, Supabase handles hosting, auth, and edge functions |
| AI — LLM | GLM-4 API (ZhipuAI) / Gemini API (fallback) | API-based inference — no GPU infra to manage, cost-effective for MVP, swap-friendly |
| AI — Orchestration | LangChain / LlamaIndex | RAG pipeline, chain-of-thought prompting, retrieval orchestration |
| Auth | OAuth 2.0 + Fabric CA (Certificate Authority) | Doctor/hospital identity verified via digital certificates |
| Compliance | ABDM/FHIR standards | Interoperability with India's national health infrastructure |

---

## Architecture Layers — Deep Dive

### Layer 1: Blockchain (Trust + Immutability)

**Network Topology (MVP)**

- 3 organizations: Hospital A, Hospital B, Regulatory Body (admin)
- Each org runs 1-2 peer nodes
- 1 orderer node (Raft consensus)
- Fabric CA per organization for identity management

**What Lives On-Chain**

- Patient registration records (hashed identity, ABHA link, public key)
- Record transaction metadata:
  - Record ID (UUID)
  - Patient ID (hashed)
  - Doctor ID (verified)
  - Hospital/Org ID
  - Record type enum: `CONSULTATION | PRESCRIPTION | LAB_REPORT | SURGERY | DIAGNOSIS | IMAGING | VACCINATION | ALLERGY | FAMILY_HISTORY`
  - Timestamp
  - Hash of the off-chain encrypted data (SHA-256) — for integrity verification
  - IPFS CID (content identifier) pointing to encrypted off-chain data
  - Access control list (ACL) — which doctor/hospital IDs have been granted access

**What Does NOT Live On-Chain**

- Actual medical content (too large, too sensitive for ledger)
- Patient PII in plaintext
- Report PDFs, images, scans

**Smart Contract Functions (Chaincode)**

```
registerPatient(patientId, abhaId, publicKey)
registerDoctor(doctorId, nmcRegistrationNo, orgId)
registerHospital(hospitalId, credentials)

createRecord(patientId, doctorId, recordType, dataHash, ipfsCid, encryptedSymKey)
getRecordsByPatient(patientId, requestorId) → returns metadata list (after ACL check)
getRecordById(recordId, requestorId) → returns single record metadata (after ACL check)

grantAccess(patientId, targetDoctorId, duration, scope)
revokeAccess(patientId, targetDoctorId)
checkAccess(patientId, requestorId) → boolean

getAuditTrail(patientId) → returns all access logs
```

**Access Control Flow**

```
Patient arrives at hospital
    → Doctor requests access via app
    → Patient approves (signs with private key)
    → Smart contract logs consent with timestamp + expiry
    → Doctor's certificate is verified against Fabric CA
    → If valid: returns encrypted symmetric key for off-chain data
    → Doctor decrypts records
    → All access is logged immutably on-chain
```

---

### Layer 2: Off-Chain Storage (Data + Encryption)

**Encryption Model**

1. Each medical record is encrypted with a unique AES-256 symmetric key
2. That symmetric key is encrypted with the patient's ECIES public key
3. When a patient grants access to a doctor, the symmetric key is re-encrypted with the doctor's public key and stored on-chain
4. When access is revoked, the re-encrypted key entry is invalidated

**Storage Architecture**

```
┌─────────────────────────────────────────────────┐
│                  ON-CHAIN (Fabric)               │
│  ┌───────────────────────────────────────────┐   │
│  │ Record Metadata                           │   │
│  │ - recordId, patientId, doctorId           │   │
│  │ - recordType, timestamp                   │   │
│  │ - dataHash (SHA-256 of plaintext)         │   │
│  │ - ipfsCid (pointer to encrypted blob)     │   │
│  │ - encryptedKeys (per authorized user)     │   │
│  │ - accessLog[]                             │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ points to
                       ▼
┌─────────────────────────────────────────────────┐
│         OFF-CHAIN (IPFS + Supabase/Postgres)     │
│                                                  │
│  IPFS (Private Cluster):                         │
│  - Encrypted medical record blobs               │
│  - Report PDFs, imaging files, lab results       │
│  - Immutable, content-addressed                  │
│                                                  │
│  Supabase (PostgreSQL + pgvector):               │
│  - Structured record metadata (for fast queries) │
│  - Patient demographic cache (encrypted)         │
│  - Doctor/hospital registry                      │
│  - Session management                            │
│  - Vector embeddings (pgvector extension)        │
│  - Single DB for both relational + vector data   │
│  - Supabase Auth for frontend auth layer         │
│  - Supabase Storage for non-IPFS file needs      │
└─────────────────────────────────────────────────┘
```

**Tiered Storage (Post-MVP)**

- **Hot tier**: Records from last 2 years — Supabase (Postgres + pgvector) + local IPFS pinning, full vector embeddings in same DB
- **Warm tier**: Records 2-5 years old — compressed summaries in hot tier, raw data in distributed IPFS
- **Cold tier**: Records 5+ years — archived, retrievable on demand, summary-only embeddings in pgvector

---

### Layer 3: AI Layer (RAG + Summarization + Memory Management)

This is the layer that makes MedChain more than just a blockchain CRUD app.

**Ingestion Pipeline**

```
New record written to blockchain
    → Event listener catches the transaction
    → Fetches encrypted data from IPFS
    → Decrypts using system service key (scoped, audited)
    → Parses content:
        - Structured data (JSON prescriptions, lab values) → direct extraction
        - Unstructured text (doctor notes) → NLP extraction
        - PDFs/images → OCR (Tesseract/PaddleOCR) → text extraction
    → Chunks the content (semantic chunking, not fixed-size)
    → Generates embeddings (PubMedBERT / BGE-Med)
    → Stores in Supabase pgvector table with metadata columns:
        - patient_id
        - record_type
        - date
        - doctor_id
        - hospital_id
        - medical_category (cardiology, endocrinology, etc.)
    → Triggers summary regeneration for patient
```

**RAG Query Flow**

```
Doctor asks: "What medications has this patient tried for hypertension?"
    → Query embedded using same model
    → pgvector similarity search with metadata filters:
        - patient_id = current patient
        - record_type IN [PRESCRIPTION, CONSULTATION, DIAGNOSIS]
        - medical_category includes "cardiology" or "hypertension"
    → Top-k chunks retrieved (k=10-20)
    → Chunks passed as context to LLM
    → LLM generates answer with citations:
        "Patient has been on:
         1. Amlodipine 5mg (prescribed by Dr. X at Hospital Y, March 2023)
         2. Telmisartan 40mg (added by Dr. Z, July 2023, replacing Amlodipine due to ankle edema)
         3. Current: Telmisartan 40mg + Hydrochlorothiazide 12.5mg (since Jan 2024)
         [Sources: Record #R-2023-003, #R-2023-017, #R-2024-002]"
```

**Auto-Summary System**

Generated on every patient access, cached, regenerated when new records arrive.

```
SUMMARY HIERARCHY:

Level 0 — One-liner
"45M, Type 2 DM (2019), HTN (2023), appendectomy (2022). Current: Metformin 500mg BD, Telmisartan 40mg OD."

Level 1 — Condition-wise Breakdown
├── Diabetes: Diagnosed 2019, HbA1c trend (8.2 → 7.1 → 6.8), current Metformin 500mg BD
├── Hypertension: Diagnosed 2023, tried Amlodipine (stopped — edema), current Telmisartan 40mg
├── Surgical: Appendectomy (laparoscopic, 2022, no complications)
├── Allergies: Sulfa drugs (documented 2020, reaction: rash)
└── Family: Father — MI at 52, Mother — Type 2 DM

Level 2 — Full Timeline (linked to raw records)
└── Chronological list of all records with one-line descriptions + record IDs
```

**Memory Management (UMG Prevention)**

This is critical — you know this problem well. A patient with 15 years of records could have thousands of entries.

- **Hierarchical compression**: Old records get compressed into condition-specific summaries. The raw data still exists (on IPFS), but the vector store holds compressed representations.
- **Sliding window**: Most recent 6 months of records always at full granularity in the vector store
- **Condition anchors**: Key events (new diagnosis, surgery, drug allergy, hospitalization) are permanently pinned at full granularity regardless of age
- **Periodic re-summarization**: A background job re-generates the summary hierarchy weekly (or on new record ingestion), pruning redundant embeddings
- **Sparse attention over history**: When retrieving, apply MSA-style attention — recent records get dense attention, older records get sparse. The retrieval pipeline weights recency but still surfaces critical historical events.

---

### Layer 4: API + Backend

**API Endpoints**

```
AUTH
POST   /api/auth/register-patient
POST   /api/auth/register-doctor
POST   /api/auth/login
POST   /api/auth/verify-otp

RECORDS
POST   /api/records/create                    → doctor creates a new record
GET    /api/records/patient/:patientId         → get all records (paginated, filtered)
GET    /api/records/:recordId                  → get single record with decrypted content
GET    /api/records/patient/:patientId/timeline → chronological timeline view

ACCESS CONTROL
POST   /api/access/grant                       → patient grants access to doctor
POST   /api/access/revoke                      → patient revokes access
GET    /api/access/audit/:patientId            → full access audit trail

AI
GET    /api/ai/summary/:patientId              → auto-generated patient summary (Level 0/1/2)
POST   /api/ai/query                           → doctor asks a natural language question about patient
POST   /api/ai/query-history                   → chat-style follow-up queries

ADMIN
GET    /api/admin/verify-doctor/:doctorId      → verify NMC registration
GET    /api/admin/network-status               → blockchain network health
```

**Backend Services**

```
┌──────────────────────────────────────────────────────┐
│                    API Gateway                        │
│              (Express/Fastify + JWT)                  │
└──────────────┬───────────┬───────────┬───────────────┘
               │           │           │
    ┌──────────▼──┐  ┌─────▼─────┐  ┌─▼────────────┐
    │ Blockchain  │  │  Storage   │  │  AI Service   │
    │  Service    │  │  Service   │  │               │
    │             │  │            │  │ - Embedder    │
    │ - Fabric SDK│  │ - IPFS     │  │ - RAG Engine  │
    │ - Chaincode │  │ - Postgres │  │ - Summarizer  │
    │   calls     │  │ - Encrypt/ │  │ - Query API   │
    │ - Event     │  │   Decrypt  │  │ - pgvector    │
    │   listener  │  │            │  │               │
    └─────────────┘  └────────────┘  └───────────────┘
```

---

### Layer 5: Frontend

**Doctor Dashboard**

- Patient search (by ABHA ID / phone / name)
- Patient summary view (Level 0 → drill into Level 1 → Level 2)
- AI chat panel: ask questions about patient history
- New record entry form (structured fields for prescription, diagnosis, notes)
- Access request workflow
- Record timeline view (visual chronological)

**Patient Portal**

- View own records (full history)
- Grant/revoke access to doctors and hospitals
- Access audit log (who viewed what, when)
- Download records
- Emergency access QR code (grants temporary read access)

**Admin Panel**

- Hospital/doctor verification and onboarding
- Network health monitoring
- Chaincode deployment and upgrades

---

## Data Models

### Patient

```json
{
  "patientId": "PAT-uuid",
  "abhaId": "12-3456-7890-1234",
  "publicKey": "0x...",
  "demographicsHash": "sha256-of-encrypted-demographics",
  "registeredAt": "2024-01-15T10:30:00Z",
  "activeAccessGrants": [
    {
      "grantedTo": "DOC-uuid",
      "scope": "ALL",
      "expiresAt": "2024-07-15T10:30:00Z"
    }
  ]
}
```

### Doctor

```json
{
  "doctorId": "DOC-uuid",
  "nmcRegistrationNo": "MH-12345",
  "orgId": "HOSP-uuid",
  "specialization": "Cardiology",
  "publicKey": "0x...",
  "certificateFingerprint": "fabric-ca-cert-hash",
  "verifiedAt": "2024-01-10T08:00:00Z"
}
```

### Medical Record (On-Chain Metadata)

```json
{
  "recordId": "REC-uuid",
  "patientId": "PAT-uuid",
  "doctorId": "DOC-uuid",
  "hospitalId": "HOSP-uuid",
  "recordType": "PRESCRIPTION",
  "medicalCategory": ["endocrinology", "diabetes"],
  "timestamp": "2024-06-20T14:30:00Z",
  "dataHash": "sha256-of-plaintext-record",
  "ipfsCid": "QmXyz...",
  "encryptedKeys": {
    "PAT-uuid": "encrypted-sym-key-for-patient",
    "DOC-uuid": "encrypted-sym-key-for-doctor"
  },
  "tags": ["metformin", "hba1c", "follow-up"]
}
```

### Medical Record (Off-Chain Content — Decrypted)

```json
{
  "recordId": "REC-uuid",
  "type": "CONSULTATION",
  "content": {
    "chiefComplaint": "Increased thirst and frequent urination for 2 weeks",
    "examination": {
      "vitals": {
        "bp": "130/85",
        "pulse": 78,
        "weight": 82,
        "height": 175,
        "bmi": 26.8
      },
      "findings": "No pedal edema, no organomegaly"
    },
    "diagnosis": [
      {
        "icdCode": "E11",
        "description": "Type 2 Diabetes Mellitus",
        "status": "NEW"
      }
    ],
    "prescriptions": [
      {
        "drug": "Metformin",
        "dose": "500mg",
        "frequency": "BD",
        "duration": "3 months",
        "instructions": "After meals"
      }
    ],
    "labOrders": ["HbA1c", "FBS", "PPBS", "Lipid Profile", "Creatinine"],
    "followUp": "Review in 3 months with lab reports",
    "doctorNotes": "Patient counseled about diet and exercise. Family history significant — father diabetic."
  },
  "attachments": [
    {
      "type": "LAB_REPORT",
      "ipfsCid": "QmAbc...",
      "filename": "hba1c_report_20240620.pdf"
    }
  ]
}
```

---

## MVP Scope — What We Build First

### Phase 1: Foundation (Weeks 1-3)

- [ ] Set up Hyperledger Fabric network (2 orgs + orderer, local Docker)
- [ ] Write core chaincode: `registerPatient`, `registerDoctor`, `createRecord`, `getRecords`, `grantAccess`, `revokeAccess`
- [ ] Set up PostgreSQL for metadata caching
- [ ] Set up private IPFS node
- [ ] Basic encryption service (AES-256 + ECIES key management)
- [ ] Backend API scaffold (Express + Fabric SDK integration)
- [ ] Basic auth flow (JWT + Fabric CA certificates)

### Phase 2: Core App (Weeks 4-6)

- [ ] Doctor dashboard: patient lookup, record entry form, timeline view
- [ ] Patient portal: view records, grant/revoke access
- [ ] Record creation flow: doctor enters data → encrypts → stores on IPFS → writes hash to chain
- [ ] Record retrieval flow: verify access → fetch from IPFS → decrypt → display
- [ ] Audit trail view

### Phase 3: AI Integration (Weeks 7-9)

- [ ] Ingestion pipeline: on-chain event → IPFS fetch → parse → chunk → embed → Supabase pgvector
- [ ] RAG query endpoint: doctor asks question → retrieve → generate answer
- [ ] Auto-summary generation (Level 0 and Level 1)
- [ ] Summary caching and invalidation on new records
- [ ] Basic memory management (sliding window + condition anchors)

### Phase 4: Polish + Demo (Weeks 10-12)

- [ ] End-to-end demo flow: register patient → doctor adds records → another doctor queries history
- [ ] Emergency access QR code
- [ ] Mobile-responsive frontend
- [ ] Load testing with synthetic patient data (100+ records per patient)
- [ ] Documentation and demo video

---

## Suggested Directory Structure

```
medchain/
│
├── README.md                              # Project overview, setup instructions
├── MEDCHAIN_ARCHITECTURE.md               # This file
├── .env.example                           # Environment variables template
├── docker-compose.yml                     # Full stack local development
├── Makefile                               # Common commands (start, stop, deploy chaincode, seed data)
│
├── blockchain/                            # Hyperledger Fabric network
│   ├── network/
│   │   ├── docker-compose-fabric.yml      # Fabric network containers
│   │   ├── configtx.yaml                  # Channel and consortium config
│   │   ├── crypto-config.yaml             # Org and peer crypto material config
│   │   └── scripts/
│   │       ├── generate-crypto.sh         # Generate certificates
│   │       ├── create-channel.sh          # Create and join channel
│   │       └── deploy-chaincode.sh        # Package and install chaincode
│   │
│   └── chaincode/
│       ├── medrecord/                     # Main chaincode (Go or Node.js)
│       │   ├── index.js                   # Entry point
│       │   ├── lib/
│       │   │   ├── patient-contract.js    # Patient registration + management
│       │   │   ├── record-contract.js     # Medical record CRUD
│       │   │   ├── access-contract.js     # Access control + consent
│       │   │   └── audit-contract.js      # Audit trail logging
│       │   ├── models/
│       │   │   ├── patient.js
│       │   │   ├── record.js
│       │   │   └── access-grant.js
│       │   ├── test/
│       │   │   ├── patient.test.js
│       │   │   ├── record.test.js
│       │   │   └── access.test.js
│       │   └── package.json
│       └── README.md
│
├── backend/                               # Node.js API server
│   ├── src/
│   │   ├── index.js                       # Server entry point
│   │   ├── config/
│   │   │   ├── fabric-connection.js       # Fabric gateway connection profile
│   │   │   ├── database.js                # PostgreSQL config
│   │   │   ├── ipfs.js                    # IPFS client config
│   │   │   └── supabase.js                # Supabase client + pgvector config
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── record.routes.js
│   │   │   ├── access.routes.js
│   │   │   ├── ai.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── record.controller.js
│   │   │   ├── access.controller.js
│   │   │   ├── ai.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── fabric.service.js          # Interact with chaincode
│   │   │   ├── ipfs.service.js            # Store/retrieve from IPFS
│   │   │   ├── encryption.service.js      # AES-256 + ECIES operations
│   │   │   ├── record.service.js          # Business logic for records
│   │   │   └── auth.service.js            # JWT + certificate management
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT verification
│   │   │   ├── role.middleware.js          # Role-based access (doctor/patient/admin)
│   │   │   └── audit.middleware.js         # Log all API access
│   │   │
│   │   ├── models/                        # PostgreSQL models (Sequelize/Prisma)
│   │   │   ├── patient.model.js
│   │   │   ├── doctor.model.js
│   │   │   ├── hospital.model.js
│   │   │   ├── record-cache.model.js
│   │   │   └── session.model.js
│   │   │
│   │   ├── events/
│   │   │   ├── fabric-listener.js         # Listen for on-chain events
│   │   │   └── handlers/
│   │   │       ├── on-record-created.js   # Trigger AI ingestion
│   │   │       └── on-access-granted.js   # Notify doctor
│   │   │
│   │   └── utils/
│   │       ├── crypto.utils.js
│   │       ├── validators.js
│   │       └── logger.js
│   │
│   ├── prisma/                            # or sequelize migrations
│   │   └── schema.prisma
│   ├── test/
│   ├── package.json
│   └── Dockerfile
│
├── ai/                                    # AI/ML pipeline
│   ├── src/
│   │   ├── ingestion/
│   │   │   ├── pipeline.py                # Main ingestion orchestrator
│   │   │   ├── parsers/
│   │   │   │   ├── structured_parser.py   # Parse JSON medical records
│   │   │   │   ├── pdf_parser.py          # OCR + text extraction from PDFs
│   │   │   │   ├── image_parser.py        # Medical imaging metadata
│   │   │   │   └── prescription_parser.py # Drug name normalization, dosage extraction
│   │   │   ├── chunkers/
│   │   │   │   ├── semantic_chunker.py    # Meaning-aware chunking
│   │   │   │   └── medical_chunker.py     # Chunk by medical section (diagnosis, rx, etc.)
│   │   │   └── embedders/
│   │   │       ├── medical_embedder.py    # PubMedBERT / BGE-Med embedding
│   │   │       └── embedding_config.py    # Model selection, dimension config
│   │   │
│   │   ├── rag/
│   │   │   ├── retriever.py               # pgvector retrieval with metadata filtering
│   │   │   ├── reranker.py                # Cross-encoder reranking for precision
│   │   │   ├── generator.py               # LLM response generation with citations
│   │   │   ├── query_router.py            # Route query to appropriate retrieval strategy
│   │   │   └── prompts/
│   │   │       ├── medical_qa.py          # QA prompt templates
│   │   │       ├── summary_prompts.py     # Summary generation prompts (L0, L1, L2)
│   │   │       └── safety_prompts.py      # Medical safety guardrails
│   │   │
│   │   ├── summarization/
│   │   │   ├── summary_generator.py       # Generate hierarchical summaries
│   │   │   ├── condition_extractor.py     # Extract condition-wise narratives
│   │   │   ├── medication_tracker.py      # Track medication changes over time
│   │   │   └── timeline_builder.py        # Build chronological event timeline
│   │   │
│   │   ├── memory/
│   │   │   ├── memory_manager.py          # UMG prevention, hierarchical compression
│   │   │   ├── sliding_window.py          # Recent records at full granularity
│   │   │   ├── condition_anchors.py       # Pin critical events permanently
│   │   │   ├── compression.py             # Compress old records into summaries
│   │   │   └── reindex_job.py             # Periodic re-summarization background job
│   │   │
│   │   ├── api/
│   │   │   ├── app.py                     # FastAPI server
│   │   │   ├── routes/
│   │   │   │   ├── query.py               # /query endpoint
│   │   │   │   ├── summary.py             # /summary endpoint
│   │   │   │   └── ingest.py              # /ingest endpoint (called by backend events)
│   │   │   └── middleware/
│   │   │       └── auth.py                # Verify requests come from backend only
│   │   │
│   │   └── utils/
│   │       ├── medical_ontology.py        # ICD codes, drug databases, medical term mapping
│   │       ├── supabase_vector.py         # Supabase pgvector operations
│   │       └── llm_client.py              # GLM-4 / Gemini API inference client
│   │
│   ├── models/                            # Model weights and configs
│   │   ├── embeddings/
│   │   │   └── .gitkeep                   # PubMedBERT weights downloaded here
│   │   └── llm/
│   │       └── api_config.yaml            # GLM-4 / Gemini API keys, model params, fallback config
│   │
│   ├── scripts/
│   │   ├── seed_synthetic_data.py         # Generate fake patient records for testing
│   │   ├── benchmark_rag.py               # Test RAG accuracy on medical queries
│   │   └── compress_old_records.py        # Manual trigger for memory compression
│   │
│   ├── tests/
│   │   ├── test_ingestion.py
│   │   ├── test_rag.py
│   │   ├── test_summarization.py
│   │   └── test_memory_management.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                              # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Landing page
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── doctor/                    # Doctor dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx           # Overview, recent patients
│   │   │   │   ├── patient/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Patient detail view
│   │   │   │   │   │   ├── summary/
│   │   │   │   │   │   │   └── page.tsx   # AI summary view
│   │   │   │   │   │   ├── timeline/
│   │   │   │   │   │   │   └── page.tsx   # Record timeline
│   │   │   │   │   │   ├── records/
│   │   │   │   │   │   │   └── page.tsx   # All records list
│   │   │   │   │   │   └── chat/
│   │   │   │   │   │       └── page.tsx   # AI chat — query patient history
│   │   │   │   │   └── search/
│   │   │   │   │       └── page.tsx       # Patient search
│   │   │   │   └── new-record/
│   │   │   │       └── page.tsx           # Create new medical record
│   │   │   │
│   │   │   ├── patient/                   # Patient portal
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx           # My health overview
│   │   │   │   ├── records/
│   │   │   │   │   └── page.tsx           # View all my records
│   │   │   │   ├── access/
│   │   │   │   │   └── page.tsx           # Manage who can see my data
│   │   │   │   └── audit/
│   │   │   │       └── page.tsx           # Who accessed my records
│   │   │   │
│   │   │   └── admin/                     # Admin panel
│   │   │       ├── layout.tsx
│   │   │       ├── doctors/
│   │   │       │   └── page.tsx           # Verify and manage doctors
│   │   │       ├── hospitals/
│   │   │       │   └── page.tsx           # Manage hospital orgs
│   │   │       └── network/
│   │   │           └── page.tsx           # Blockchain network status
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                        # Shared UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── medical/
│   │   │   │   ├── RecordCard.tsx         # Display single medical record
│   │   │   │   ├── RecordTimeline.tsx     # Visual timeline of records
│   │   │   │   ├── PrescriptionForm.tsx   # Structured prescription entry
│   │   │   │   ├── DiagnosisForm.tsx      # Diagnosis entry with ICD lookup
│   │   │   │   ├── PatientSummary.tsx     # AI summary display (L0/L1/L2)
│   │   │   │   └── VitalsInput.tsx        # BP, pulse, weight, etc.
│   │   │   ├── ai/
│   │   │   │   ├── ChatPanel.tsx          # AI query interface
│   │   │   │   ├── ChatMessage.tsx        # Individual message with citations
│   │   │   │   └── SummaryView.tsx        # Expandable summary hierarchy
│   │   │   └── access/
│   │   │       ├── AccessGrantModal.tsx   # Grant access workflow
│   │   │       ├── AccessList.tsx         # Current access grants
│   │   │       └── AuditLog.tsx           # Access audit trail
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useRecords.ts
│   │   │   ├── useAIQuery.ts
│   │   │   └── useAccess.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                     # Axios/fetch wrapper
│   │   │   ├── auth.service.ts
│   │   │   ├── record.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── access.service.ts
│   │   │
│   │   └── types/
│   │       ├── patient.ts
│   │       ├── record.ts
│   │       ├── doctor.ts
│   │       └── ai.ts
│   │
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── infrastructure/                        # Deployment configs
│   ├── docker/
│   │   ├── ipfs/
│   │   │   └── Dockerfile
│   │   └── postgres/
│   │       └── init.sql
│   ├── k8s/                               # Kubernetes manifests (post-MVP)
│   │   ├── fabric/
│   │   ├── backend/
│   │   ├── ai/
│   │   └── frontend/
│   └── scripts/
│       ├── setup-dev.sh                   # One-command dev environment setup
│       ├── seed-data.sh                   # Populate with test data
│       └── teardown.sh                    # Clean up everything
│
├── docs/                                  # Documentation
│   ├── api-reference.md                   # Full API documentation
│   ├── smart-contract-spec.md             # Chaincode function specifications
│   ├── data-models.md                     # All data schemas
│   ├── encryption-protocol.md             # Detailed encryption flow
│   ├── ai-pipeline.md                     # RAG architecture details
│   ├── deployment-guide.md                # How to deploy
│   ├── abdm-integration.md               # ABDM/ABHA compliance notes
│   └── diagrams/
│       ├── system-architecture.png
│       ├── access-control-flow.png
│       ├── data-flow.png
│       └── rag-pipeline.png
│
└── scripts/                               # Root-level utility scripts
    ├── generate-test-patients.js          # Generate synthetic patient data
    ├── verify-chain-integrity.js          # Verify all record hashes match
    └── export-patient-data.js             # Patient data export (right to portability)
```

---

## Security Considerations

1. **Zero plaintext on chain** — all medical content encrypted, chain holds only hashes and pointers
2. **Patient-owned keys** — patient's private key is the root of all access. Lost key = recovery via ABHA-linked KYC (not ideal, but necessary)
3. **Certificate-based doctor auth** — Fabric CA issues certificates only to NMC-verified doctors. Revoked license = revoked certificate = no access
4. **Audit everything** — every read, write, and access grant is logged immutably on-chain
5. **AI data minimization** — Only de-identified or chunked medical text is sent to the LLM API (GLM-4/Gemini). Patient PII (name, ABHA ID, demographics) is stripped before inference. Embedding models can run locally. For production, evaluate self-hosted LLM to keep all data in-house.
6. **Encryption key rotation** — support periodic key rotation without re-encrypting all historical data (via key versioning)
7. **Rate limiting** — prevent bulk data exfiltration via API rate limits and anomaly detection

---

## Regulatory Alignment

- **ABDM/ABHA**: Use ABHA ID as patient identifier, follow ABDM's FHIR-based data standards
- **DPDPA (Digital Personal Data Protection Act)**: Patient consent mechanism, right to erasure (mark records as deleted on-chain, purge off-chain), data portability
- **NMC verification**: Validate doctors against National Medical Commission registry
- **NABL/NABH**: Lab reports and hospital records tagged with accreditation status

---

## Success Metrics (MVP)

- A patient registered on the network can have records created by Doctor A at Hospital A
- Doctor B at Hospital B can request access, receive it from the patient, and view all records
- Doctor B can ask "What allergies does this patient have?" and get an accurate AI-generated answer with record citations
- Auto-summary is generated within 5 seconds of patient record access
- All access is auditable via on-chain logs
- End-to-end encryption: at no point is plaintext medical data exposed to unauthorized parties

---

## Future Roadmap (Post-MVP)

- Mobile app (React Native) for patients
- Emergency access protocol (unconscious patient → emergency QR → time-limited read access)
- Cross-state federation (multiple Fabric channels for different state health authorities)
- Drug interaction alerts (AI flags dangerous combinations based on full medication history)
- Predictive health insights (risk scoring based on medical history + family history)
- Insurance integration (patient can share specific records with insurers for claims)
- Research data marketplace (anonymized, aggregated data for medical research — patient-consented)
- Ancestral health tree (family medical history as a graph, genetic risk mapping)
- Voice-based record entry for doctors (speech-to-structured-data)
- Multi-language support (Hindi, Tamil, Bengali medical terminology)
