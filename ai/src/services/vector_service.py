import os
import logging
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("medchain-ai")

class VectorService:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        self._conn = None

    def get_connection(self):
        if self._conn is None or self._conn.closed:
            try:
                self._conn = psycopg2.connect(self.db_url)
                register_vector(self._conn)
                logger.info("Connected to pgvector database")
            except Exception as e:
                logger.error(f"Database connection error: {e}")
                raise
        return self._conn

    def store_chunks(self, record_id: str, patient_id: str, chunks: List[str], embeddings: List[List[float]], metadata: Dict[str, Any]):
        """Store record chunks and their embeddings in pgvector."""
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                data = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    data.append((
                        record_id,
                        patient_id,
                        i,
                        chunk,
                        embedding,
                        metadata.get('record_type'),
                        metadata.get('medical_category', []),
                        metadata.get('doctor_id'),
                        metadata.get('hospital_id'),
                        metadata.get('recorded_at')
                    ))
                
                query = """
                INSERT INTO record_embeddings (
                    record_id, patient_id, chunk_index, chunk_text, embedding, 
                    record_type, medical_category, doctor_id, hospital_id, recorded_at
                ) VALUES %s
                """
                execute_values(cur, query, data)
                conn.commit()
                logger.info(f"Stored {len(chunks)} chunks for record {record_id}")
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to store chunks: {e}")
            raise

    def search_similar(self, patient_id: str, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for most similar medical chunks using cosine similarity."""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # pgvector cosine similarity operator: <=>
                query = """
                SELECT 
                    record_id, 
                    chunk_text, 
                    record_type, 
                    recorded_at,
                    1 - (embedding <=> %s) AS similarity
                FROM record_embeddings
                WHERE patient_id = %s
                ORDER BY embedding <=> %s
                LIMIT %s
                """
                cur.execute(query, (query_embedding, patient_id, query_embedding, top_k))
                return cur.fetchall()
        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return []

# Singleton instance
vector_service = VectorService()
