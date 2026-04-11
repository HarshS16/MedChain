import pytesseract
from PIL import Image
import io
import logging
from typing import Optional
from PyPDF2 import PdfReader

logger = logging.getLogger("medchain-ai")

class OCRService:
    def __init__(self):
        # Tesseract path configuration if needed
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
        pass

    async def extract_text(self, file_bytes: bytes, mime_type: str) -> str:
        """Extract text from images or PDFs."""
        try:
            if mime_type == "application/pdf":
                return self._extract_from_pdf(file_bytes)
            elif mime_type.startswith("image/"):
                return self._extract_from_image(file_bytes)
            else:
                logger.warn(f"Unsupported MIME type for OCR: {mime_type}")
                return ""
        except Exception as e:
            logger.error(f"OCR Extraction failed: {e}")
            return ""

    def _extract_from_image(self, image_bytes: bytes) -> str:
        """OCR for images (Prescriptions, Lab results photos)."""
        image = Image.open(io.BytesIO(image_bytes))
        # Enhanced config for medical text: --oem 3 --psm 6 (uniform block of text)
        text = pytesseract.image_to_string(image, config='--oem 3 --psm 6')
        return text.strip()

    def _extract_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from searchable PDFs."""
        text = ""
        reader = PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # If PDF is an image-scan (no text found), we would ideally use pdf2image + Tesseract
        # For now, we return what's available
        return text.strip()

# Singleton instance
ocr_service = OCRService()
