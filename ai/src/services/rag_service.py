import logging
from typing import List, Dict, Any
from .embedding_service import embedding_service
from .vector_service import vector_service

logger = logging.getLogger("medchain-ai")

class RAGService:
    async def query_patient(self, patient_id: str, query_text: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Complete RAG Pipeline:
        1. Embed Query
        2. Vector Search patient records
        3. Format Context
        4. (Optional) Generate LLM Answer
        """
        logger.info(f"RAG Query for {patient_id}: {query_text}")

        # 1. Embed Query
        query_vector = embedding_service.embed_text(query_text)

        # 2. Retrieve top-k context chunks
        context_chunks = vector_service.search_similar(patient_id, query_vector, top_k)

        if not context_chunks:
            return {
                "answer": "I couldn't find any relevant medical records for this patient to answer that question.",
                "citations": [],
                "confidence": 0.0
            }

        # 3. Format context for LLM
        context_str = "\n\n".join([
            f"--- Record [{c['record_id']}] ({c['record_type']} on {c['recorded_at']}) ---\n{c['chunk_text']}"
            for c in context_chunks
        ])

        # 4. Generate Answer (Mocking LLM call for now, but with real context)
        # In production: response = llm.generate(prompt_template.format(context=context_str, query=query_text))
        
        answer = self._generate_mock_answer(query_text, context_chunks)
        
        return {
            "answer": answer,
            "citations": [c['record_id'] for c in context_chunks],
            "confidence": 0.85, # Simulated confidence
            "context_used": len(context_chunks)
        }

    def _generate_mock_answer(self, query: str, context: List[Dict]) -> str:
        """Heuristic-based mock answer for demonstration using real context."""
        if not context: return "No data."
        
        primary_record = context[0]
        date_str = str(primary_record['recorded_at']).split(' ')[0] if primary_record['recorded_at'] else "unknown date"
        
        return (
            f"Based on the clinical logs (specifically the {primary_record['record_type']} from {date_str}), "
            f"the patient has records indicating: \"{primary_record['chunk_text'][:200]}...\" "
            f"I found {len(context)} relevant matching segments across their history."
        )

# Singleton instance
rag_service = RAGService()
