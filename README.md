# MedChain — Decentralized AI-Powered Medical Record Ledger

A blockchain-backed, AI-enhanced medical record system for India where every patient carries a single, tamper-proof health history — accessible by any verified doctor or hospital, owned entirely by the patient, and queryable through natural language.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                  │
│           Doctor Dashboard | Patient Portal | Admin   │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Backend API (Express.js)                  │
│         Auth | Records | Access Control | AI          │
└───────┬──────────┬──────────┬────────────────────────┘
        │          │          │
┌───────▼───┐ ┌────▼────┐ ┌──▼──────────────┐
│ Blockchain│ │ Storage │ │   AI Service    │
│  (Fabric) │ │(IPFS +  │ │   (FastAPI)     │
│           │ │ Postgres)│ │ RAG + Summary   │
└───────────┘ └─────────┘ └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- Python >= 3.10
- Go >= 1.20

### Setup
```bash
# Clone and install
git clone <repo-url>
cd medchain

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install AI dependencies
cd ../ai && pip install -r requirements.txt

# Start infrastructure (Fabric network, IPFS, Postgres)
docker-compose up -d

# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev

# Run AI service
cd ai && uvicorn src.api.app:app --reload
```

## 📁 Project Structure

```
medchain/
├── blockchain/          # Hyperledger Fabric network + chaincode
├── backend/             # Node.js API server (Express)
├── frontend/            # Next.js application
├── ai/                  # AI/ML pipeline (FastAPI + RAG)
├── infrastructure/      # Docker configs, K8s manifests
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

## 🔑 Key Features
- **Immutable Records**: Every medical interaction recorded on Hyperledger Fabric
- **Patient Ownership**: Patients control who accesses their data
- **AI-Powered Queries**: Ask natural language questions about patient history
- **Auto-Summaries**: Hierarchical patient summaries (one-liner → detailed)
- **End-to-End Encryption**: AES-256 + ECIES, patient-controlled keys
- **ABDM Compatible**: Linked to India's ABHA health ID system

## 📜 License
MIT
