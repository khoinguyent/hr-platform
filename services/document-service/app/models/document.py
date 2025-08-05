from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum
from datetime import datetime, timedelta

Base = declarative_base()

class DocumentType(enum.Enum):
    CONTRACT = "contract"
    APPENDIX = "appendix"
    JOB_DESCRIPTION = "job_description"
    RESUME = "resume"
    INVOICE = "invoice"
    PROPOSAL = "proposal"
    AGREEMENT = "agreement"
    TEMPLATE = "template"
    OTHER = "other"

class DocumentStatus(enum.Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    UPLOADED = "uploaded"
    FAILED = "failed"
    EXPIRED = "expired"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic document information
    name = Column(String(255), nullable=False)  # Document name/title
    original_filename = Column(String(255), nullable=False)  # Original uploaded filename
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)  # File type (pdf, word, etc.)
    file_extension = Column(String(20), nullable=False)  # .pdf, .docx, etc.
    
    # Document classification
    document_type = Column(String(50), nullable=False)  # Store as string, not enum
    status = Column(String(50), default=DocumentStatus.UPLOADING.value)  # Store as string, not enum
    
    # Storage information
    s3_key = Column(String(500), nullable=True)  # S3/MinIO object key
    s3_url = Column(String(500), nullable=True)  # Public URL for the document
    
    # Foreign keys for different document contexts (no constraints - handled by respective services)
    client_id = Column(String(36), nullable=True)  # For client documents
    job_id = Column(String(36), nullable=True)  # For job descriptions
    user_id = Column(String(36), nullable=True)  # For CVs/resumes
    
    # Metadata
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)  # JSON string of tags
    document_metadata = Column(Text, nullable=True)  # JSON string of additional metadata
    
    # Dates
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    expired_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Document(id={self.id}, name='{self.name}', type='{self.document_type.value}', status='{self.status.value}')>"
    
    def is_expired(self):
        """Check if document is expired"""
        if not self.expired_date:
            return False
        return datetime.utcnow() > self.expired_date
    
    def days_until_expiry(self):
        """Get days until document expires"""
        if not self.expired_date:
            return None
        delta = self.expired_date - datetime.utcnow()
        return delta.days 