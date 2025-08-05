import os
import uuid
import logging
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import UploadFile
from datetime import datetime, timedelta

from ..models.document import Document, DocumentType, DocumentStatus
from .queue_service import QueueService

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.queue_service = QueueService()
        
    def create_document_record(
        self, 
        db: Session, 
        document_data: Dict[str, Any]
    ) -> Document:
        """
        Create a new document record in the database
        
        Args:
            db: Database session
            document_data: Document data dictionary
            
        Returns:
            Document object
        """
        try:
            document = Document(**document_data)
            db.add(document)
            db.commit()
            db.refresh(document)
            
            logger.info(f"Created document record: {document.id}")
            return document
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating document record: {str(e)}")
            raise
    
    def update_document_status(
        self, 
        db: Session, 
        document_id: int, 
        status: DocumentStatus,
        s3_key: str = None,
        s3_url: str = None
    ) -> bool:
        """
        Update document status and optionally S3 information
        
        Args:
            db: Database session
            document_id: Document ID
            status: New status
            s3_key: S3 object key (optional)
            s3_url: S3 URL (optional)
            
        Returns:
            Success status
        """
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                logger.error(f"Document not found: {document_id}")
                return False
            
            document.status = status
            if s3_key:
                document.s3_key = s3_key
            if s3_url:
                document.s3_url = s3_url
            
            db.commit()
            logger.info(f"Updated document {document_id} status to {status.value}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating document status: {str(e)}")
            return False
    
    def process_document_upload(
        self,
        db: Session,
        file: UploadFile,
        document_type: DocumentType,
        name: str,
        client_id: str = None,
        job_id: str = None,
        user_id: str = None,
        description: str = None,
        tags: str = None,
        metadata: str = None,
        expired_date: datetime = None
    ) -> Tuple[bool, str, Optional[Document]]:
        """
        Process document upload with message queue architecture
        
        Args:
            db: Database session
            file: Uploaded file
            document_type: Type of document
            name: Document name/title
            client_id: Client ID (for client documents)
            job_id: Job ID (for job descriptions)
            user_id: User ID (for resumes)
            description: Document description
            tags: JSON string of tags
            metadata: JSON string of additional metadata
            expired_date: Document expiry date
            
        Returns:
            Tuple of (success: bool, message: str, document: Optional[Document])
        """
        try:
            # Validate file
            if not file or not file.filename:
                return False, "No file provided", None
            
            # Get file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            if not file_extension:
                return False, "Invalid file: no extension", None
            
            # Create document record with UPLOADING status
            document_data = {
                'name': name,
                'original_filename': file.filename,
                'file_size': file.size or 0,
                'mime_type': file.content_type or 'application/octet-stream',
                'file_extension': file_extension,
                'document_type': document_type.value,  # Use enum value instead of enum object
                'status': DocumentStatus.UPLOADING.value,  # Use enum value instead of enum object
                'client_id': client_id,
                'job_id': job_id,
                'user_id': user_id,
                'description': description,
                'tags': tags,
                'document_metadata': metadata,
                'expired_date': expired_date
            }
            
            # Create document record
            document = self.create_document_record(db, document_data)
            
            # Prepare message data for queue
            message_data = {
                'document_id': document.id,
                'document_type': document_type.value,
                'name': name,
                'original_filename': file.filename,
                'file_size': file.size or 0,
                'mime_type': file.content_type or 'application/octet-stream',
                'file_extension': file_extension,
                'client_id': client_id,
                'job_id': job_id,
                'user_id': user_id,
                'description': description,
                'tags': tags,
                'metadata': metadata,
                'expired_date': expired_date.isoformat() if expired_date else None
            }
            
            # Publish message to appropriate queue based on document type
            if document_type in [DocumentType.CONTRACT, DocumentType.APPENDIX]:
                message_id = self.queue_service.publish_client_document_message(message_data)
                logger.info(f"Published client document message: {message_id}")
            elif document_type == DocumentType.JOB_DESCRIPTION:
                message_id = self.queue_service.publish_job_description_message(message_data)
                logger.info(f"Published job description message: {message_id}")
            elif document_type == DocumentType.RESUME:
                message_id = self.queue_service.publish_resume_message(message_data)
                logger.info(f"Published resume message: {message_id}")
            else:
                message_id = self.queue_service.publish_general_document_message(message_data)
                logger.info(f"Published general document message: {message_id}")
            
            return True, "Document upload initiated successfully", document
            
        except Exception as e:
            logger.error(f"Error processing document upload: {str(e)}")
            return False, f"Upload processing failed: {str(e)}", None
    
    def get_document(self, db: Session, document_id: int) -> Optional[Document]:
        """Get document by ID"""
        return db.query(Document).filter(Document.id == document_id).first()
    
    def get_client_documents(self, db: Session, client_id: str) -> list[Document]:
        """Get all documents for a client"""
        return db.query(Document).filter(Document.client_id == client_id).all()
    
    def get_job_documents(self, db: Session, job_id: str) -> list[Document]:
        """Get all documents for a job"""
        return db.query(Document).filter(Document.job_id == job_id).all()
    
    def get_user_documents(self, db: Session, user_id: str) -> list[Document]:
        """Get all documents for a user"""
        return db.query(Document).filter(Document.user_id == user_id).all()
    
    def get_documents_by_status(self, db: Session, status: DocumentStatus) -> list[Document]:
        """Get documents by status"""
        return db.query(Document).filter(Document.status == status).all()
    
    def get_expired_documents(self, db: Session) -> list[Document]:
        """Get all expired documents"""
        return db.query(Document).filter(
            Document.expired_date.isnot(None),
            Document.expired_date < datetime.utcnow()
        ).all() 