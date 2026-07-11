"""
MedChain AI Service — FastAPI Application
RAG + Summarization + Query Engine for Medical Records
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import logging

from src.services.embedding_service import embedding_service
from src.services.vector_service import vector_service
from src.services.rag_service import rag_service
from src.services.ocr_service import ocr_service
from fastapi import File, UploadFile, Form

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medchain-ai")

# ============================================
# FastAPI App
# ============================================

app = FastAPI(
    title="MedChain AI Service",
    description="RAG + Summarization engine for medical records",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Models
# ============================================

class QueryRequest(BaseModel):
    patient_id: str
    query: str
    filters: Optional[Dict[str, Any]] = None
    top_k: int = 10

class QueryResponse(BaseModel):
    patient_id: str
    query: str
    answer: str
    citations: List[Dict[str, Any]]
    confidence: float
    model: str
    processing_time_ms: int

class SummaryRequest(BaseModel):
    patient_id: str
    level: int = 0  # 0=one-liner, 1=condition-wise, 2=full timeline

class SummaryResponse(BaseModel):
    patient_id: str
    level: int
    summary: Any
    generated_at: str
    model: str

class IngestRequest(BaseModel):
    record_id: str
    patient_id: str
    record_type: str
    content: Dict[str, Any]
    medical_category: List[str] = []
    doctor_id: str = ""
    hospital_id: str = ""
    timestamp: str = ""


# ============================================
# Routes
# ============================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "medchain-ai",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "embedding_model": "pending_setup",
            "vector_store": "pending_setup",
            "llm": "pending_setup",
        }
    }


@app.post("/query", response_model=QueryResponse)
async def query_patient_records(request: QueryRequest):
    """
    Doctor asks a natural language question about a patient's medical history.
    Uses RAG: embed query → retrieve from pgvector → generate answer with LLM.
    """
    start_time = datetime.utcnow()
    try:
        result = await rag_service.query_patient(
            patient_id=request.patient_id, 
            query_text=request.query, 
            top_k=request.top_k
        )

        elapsed = (datetime.utcnow() - start_time).total_seconds() * 1000

        return QueryResponse(
            patient_id=request.patient_id,
            query=request.query,
            answer=result["answer"],
            citations=[{"id": cid} for cid in result["citations"]],
            confidence=result["confidence"],
            model="medchain-rag-v1",
            processing_time_ms=int(elapsed),
        )
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate hierarchical patient summary.
    Level 0: One-liner | Level 1: Condition-wise | Level 2: Full timeline
    """
    logger.info(f"Summary L{request.level} for patient {request.patient_id}")

    summaries = {
        0: "45M, Type 2 DM (2019), HTN (2023), appendectomy (2022). Current: Metformin 500mg BD, Telmisartan 40mg OD.",
        1: {
            "conditions": [
                {"name": "Type 2 Diabetes", "status": "Chronically Managed", "details": "Diagnosis 2019. HbA1c trend 8.2 → 6.8."},
                {"name": "Essential Hypertension", "status": "Stable (since 2023)", "details": "Switched from Amlodipine to Telmisartan."}
            ],
            "allergies": [{"substance": "Sulfa drugs", "reaction": "Rash"}],
            "surgical": [{"name": "Laparoscopic Appendectomy", "date": "Oct 2022"}]
        },
        2: [
          {"date": "2024-06-20", "event": "Follow-up - Endocrinology", "type": "CONSULTATION"},
          {"date": "2023-11-15", "event": "Hypertension Diagnosis", "type": "DIAGNOSIS"},
          {"date": "2022-10-05", "event": "Appendectomy Surgery", "type": "SURGERY"}
        ]
    }

    return SummaryResponse(
        patient_id=request.patient_id,
        level=request.level,
        summary=summaries.get(request.level, summaries[0]),
        generated_at=datetime.utcnow().isoformat(),
        model="medchain-summarizer-v1",
    )


@app.post("/ingest")
async def ingest_record(request: IngestRequest):
    """
    Ingest a new medical record into the vector store.
    Called by the backend when a new record is created on-chain.
    
    Pipeline: parse → chunk → embed → store in pgvector
    """
    try:
        # 1. Simple chunking (Heuristic: by clinical section or max tokens)
        content_text = str(request.content) # In reality, parse key-value clinical data
        chunks = [content_text[i:i+500] for i in range(0, len(content_text), 450)]
        
        # 2. Embed
        embeddings = embedding_service.embed_text(chunks)
        
        # 3. Store in pgvector
        vector_service.store_chunks(
            record_id=request.record_id,
            patient_id=request.patient_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata={
                "record_type": request.record_type,
                "doctor_id": request.doctor_id,
                "hospital_id": request.hospital_id,
                "recorded_at": request.timestamp or datetime.utcnow()
            }
        )

        return {
            "success": True,
            "message": f"Record {request.record_id} successfully vectorized",
            "chunks": len(chunks)
        }
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-document")
async def process_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    record_id: str = Form(...),
    record_type: str = Form("DOCUMENT")
):
    """
    OCR + Index Pipeline:
    1. Read File
    2. Extract Text via OCR
    3. Index in Vector Store
    """
    try:
        content = await file.read()
        extracted_text = await ocr_service.extract_text(content, file.content_type)
        
        if not extracted_text:
            return {"success": False, "error": "No text could be extracted from document"}

        # Use the existing indexing logic via rag_service/vector_service
        chunks = [extracted_text[i:i+500] for i in range(0, len(extracted_text), 450)]
        embeddings = embedding_service.embed_text(chunks)
        
        vector_service.store_chunks(
            record_id=record_id,
            patient_id=patient_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata={
                "record_type": record_type,
                "recorded_at": datetime.utcnow()
            }
        )

        return {
            "success": True,
            "text": extracted_text[:500] + "...", # Return preview
            "chunks_indexed": len(chunks)
        }
    except Exception as e:
        logger.error(f"Document processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
