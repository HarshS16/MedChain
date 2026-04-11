-- MedChain PostgreSQL Initialization
-- Creates extensions, schemas, and base tables

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for AI embeddings

-- ============================================
-- Core Tables
-- ============================================

-- Patients (cached from blockchain for fast lookups)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,       -- PAT-uuid format
    abha_id VARCHAR(20) UNIQUE,                    -- 12-3456-7890-1234
    public_key TEXT,
    demographics_encrypted TEXT,                    -- AES-256 encrypted demographics
    demographics_hash VARCHAR(64),                  -- SHA-256 hash
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id VARCHAR(50) UNIQUE NOT NULL,         -- DOC-uuid format
    nmc_registration_no VARCHAR(20) UNIQUE NOT NULL,
    org_id VARCHAR(50) NOT NULL,                    -- Hospital org reference
    specialization VARCHAR(100),
    public_key TEXT,
    certificate_fingerprint VARCHAR(128),
    verified_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id VARCHAR(50) UNIQUE NOT NULL,        -- HOSP-uuid format
    name VARCHAR(255) NOT NULL,
    registration_no VARCHAR(50),
    fabric_org_msp VARCHAR(100),                    -- HospitalAMSP, etc.
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    accreditation_status VARCHAR(50),                -- NABH/NABL
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Record Cache (mirrors on-chain metadata for fast queries)
CREATE TABLE IF NOT EXISTS record_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id VARCHAR(50) UNIQUE NOT NULL,          -- REC-uuid format
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) NOT NULL,
    hospital_id VARCHAR(50),
    record_type VARCHAR(50) NOT NULL,               -- CONSULTATION, PRESCRIPTION, etc.
    medical_category TEXT[],                          -- {cardiology, diabetes}
    data_hash VARCHAR(64) NOT NULL,                  -- SHA-256 of plaintext
    ipfs_cid VARCHAR(100) NOT NULL,                  -- IPFS content identifier
    tags TEXT[],                                      -- {metformin, hba1c}
    blockchain_tx_id VARCHAR(100),                   -- Fabric transaction ID
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions (for JWT session management)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL,                 -- patient, doctor, admin
    token_hash VARCHAR(128) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Access Grants (cached from blockchain)
CREATE TABLE IF NOT EXISTS access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) NOT NULL,
    granted_to VARCHAR(50) NOT NULL,                -- Doctor or Hospital ID
    granted_to_type VARCHAR(20) NOT NULL,            -- doctor, hospital
    scope VARCHAR(20) DEFAULT 'ALL',                 -- ALL, READ_ONLY, specific record types
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    blockchain_tx_id VARCHAR(100)
);

-- Audit Log (cached from blockchain for fast UI display)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) NOT NULL,
    accessor_id VARCHAR(50) NOT NULL,
    accessor_type VARCHAR(20) NOT NULL,              -- doctor, hospital, system
    action VARCHAR(50) NOT NULL,                     -- VIEW, CREATE, GRANT_ACCESS, REVOKE_ACCESS
    record_id VARCHAR(50),
    details JSONB,
    ip_address INET,
    blockchain_tx_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI / Vector Tables
-- ============================================

-- Medical record embeddings (pgvector)
CREATE TABLE IF NOT EXISTS record_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    chunk_index INTEGER NOT NULL,                    -- Position within record
    chunk_text TEXT NOT NULL,                         -- The text chunk
    embedding vector(768),                            -- PubMedBERT = 768 dims
    record_type VARCHAR(50),
    medical_category TEXT[],
    doctor_id VARCHAR(50),
    hospital_id VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE,
    is_compressed BOOLEAN DEFAULT FALSE,             -- Hierarchical compression flag
    compression_level INTEGER DEFAULT 0,              -- 0=raw, 1=summary, 2=super-summary
    is_anchor BOOLEAN DEFAULT FALSE,                  -- Condition anchor (never compressed)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient summaries (cached AI-generated)
CREATE TABLE IF NOT EXISTS patient_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    level_0 TEXT,                                     -- One-liner summary
    level_1 JSONB,                                    -- Condition-wise breakdown
    level_2 JSONB,                                    -- Full timeline
    last_record_id VARCHAR(50),                       -- Last record that triggered regen
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT FALSE,
    model_used VARCHAR(50),                           -- Which LLM generated this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Record cache indexes
CREATE INDEX idx_record_cache_patient ON record_cache(patient_id);
CREATE INDEX idx_record_cache_doctor ON record_cache(doctor_id);
CREATE INDEX idx_record_cache_type ON record_cache(record_type);
CREATE INDEX idx_record_cache_date ON record_cache(recorded_at DESC);
CREATE INDEX idx_record_cache_patient_type ON record_cache(patient_id, record_type);

-- Access grants indexes
CREATE INDEX idx_access_grants_patient ON access_grants(patient_id);
CREATE INDEX idx_access_grants_target ON access_grants(granted_to);
CREATE INDEX idx_access_grants_active ON access_grants(patient_id, is_active);

-- Audit log indexes
CREATE INDEX idx_audit_patient ON audit_log(patient_id);
CREATE INDEX idx_audit_accessor ON audit_log(accessor_id);
CREATE INDEX idx_audit_date ON audit_log(created_at DESC);

-- Session indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

-- Embedding indexes (IVFFlat for approximate nearest neighbor search)
CREATE INDEX idx_embeddings_vector ON record_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_patient ON record_embeddings(patient_id);
CREATE INDEX idx_embeddings_record_type ON record_embeddings(record_type);
CREATE INDEX idx_embeddings_date ON record_embeddings(recorded_at DESC);
CREATE INDEX idx_embeddings_patient_type ON record_embeddings(patient_id, record_type);
CREATE INDEX idx_embeddings_anchor ON record_embeddings(patient_id, is_anchor) WHERE is_anchor = TRUE;

-- Summary indexes
CREATE INDEX idx_summaries_patient ON patient_summaries(patient_id);
CREATE INDEX idx_summaries_stale ON patient_summaries(is_stale) WHERE is_stale = TRUE;

-- ============================================
-- Functions
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update triggers
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_record_cache_updated_at BEFORE UPDATE ON record_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_embeddings_updated_at BEFORE UPDATE ON record_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON patient_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mark patient summary as stale when new record is inserted
CREATE OR REPLACE FUNCTION mark_summary_stale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_summaries SET is_stale = TRUE WHERE patient_id = NEW.patient_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_summary_stale_on_record AFTER INSERT ON record_cache FOR EACH ROW EXECUTE FUNCTION mark_summary_stale();
