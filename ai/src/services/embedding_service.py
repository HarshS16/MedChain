import os
import logging
from typing import List, Union
from sentence_transformers import SentenceTransformer
import torch
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("medchain-ai")

class EmbeddingService:
    def __init__(self):
        self.model_name = os.getenv("EMBEDDING_MODEL_NAME", "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._model = None
        logger.info(f"Initializing EmbeddingService with {self.model_name} on {self.device}")

    @property
    def model(self):
        if self._model is None:
            # Lazy load the model
            try:
                self._model = SentenceTransformer(self.model_name, device=self.device)
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                # Fallback to a smaller model for development if needed
                self._model = SentenceTransformer("all-MiniLM-L6-v2", device=self.device)
        return self._model

    def embed_text(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Convert text into vector embeddings."""
        try:
            embeddings = self.model.encode(text)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            raise

    def get_dimension(self) -> int:
        """Get the embedding dimension (e.g., 768 for PubMedBERT)."""
        return self.model.get_sentence_embedding_dimension()

# Singleton instance
embedding_service = EmbeddingService()
