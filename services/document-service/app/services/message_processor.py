import os
import json
import logging
import tempfile
from typing import Dict, Any
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.document import DocumentStatus
from .document_service import DocumentService
from .s3_upload_service import S3UploadService

logger = logging.getLogger(__name__)

class MessageProcessor:
    def __init__(self):
        self.document_service = DocumentService()
        self.s3_service = S3UploadService()
        
    def process_client_document_message(self, message_data: Dict[str, Any]):
        """
        Process client document upload message
        
        Args:
            message_data: Message data containing document information
        """
        try:
            logger.info(f"Processing client document message: {message_data.get('document_id')}")
            
            # Get database session
            db = next(get_db())
            
            try:
                # Update status to processing
                self.document_service.update_document_status(
                    db, 
                    message_data['document_id'], 
                    DocumentStatus.PROCESSING
                )
                
                # Create temporary file from the uploaded data
                # In a real implementation, you would get the file from the original upload
                # For now, we'll simulate the upload process
                
                # Generate S3 key
                context_id = message_data.get('client_id')
                s3_key = self.s3_service.generate_s3_key(
                    message_data['document_type'],
                    message_data['original_filename'],
                    context_id
                )
                
                # Simulate file upload (in real implementation, you'd have the actual file)
                # For now, we'll create a dummy file for testing
                with tempfile.NamedTemporaryFile(delete=False, suffix=message_data['file_extension']) as temp_file:
                    temp_file.write(b"Simulated document content")
                    temp_file_path = temp_file.name
                
                try:
                    # Upload to S3/MinIO
                    upload_success, upload_message = self.s3_service.upload_file(
                        temp_file_path,
                        s3_key,
                        message_data['mime_type']
                    )
                    
                    if upload_success:
                        # Get the file URL
                        s3_url = self.s3_service.get_file_url(s3_key)
                        
                        # Update document with S3 information and set status to uploaded
                        self.document_service.update_document_status(
                            db,
                            message_data['document_id'],
                            DocumentStatus.UPLOADED,
                            s3_key,
                            s3_url
                        )
                        
                        logger.info(f"Successfully processed client document: {message_data['document_id']}")
                    else:
                        # Update status to failed
                        self.document_service.update_document_status(
                            db,
                            message_data['document_id'],
                            DocumentStatus.FAILED
                        )
                        logger.error(f"Failed to upload client document: {upload_message}")
                        
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                        
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error processing client document message: {str(e)}")
            # Try to update status to failed
            try:
                db = next(get_db())
                self.document_service.update_document_status(
                    db,
                    message_data['document_id'],
                    DocumentStatus.FAILED
                )
                db.close()
            except:
                pass
    
    def process_job_description_message(self, message_data: Dict[str, Any]):
        """
        Process job description document upload message
        
        Args:
            message_data: Message data containing document information
        """
        try:
            logger.info(f"Processing job description message: {message_data.get('document_id')}")
            
            # Similar processing as client document
            self.process_client_document_message(message_data)
            
        except Exception as e:
            logger.error(f"Error processing job description message: {str(e)}")
    
    def process_resume_message(self, message_data: Dict[str, Any]):
        """
        Process resume document upload message
        
        Args:
            message_data: Message data containing document information
        """
        try:
            logger.info(f"Processing resume message: {message_data.get('document_id')}")
            
            # Similar processing as client document
            self.process_client_document_message(message_data)
            
        except Exception as e:
            logger.error(f"Error processing resume message: {str(e)}")
    
    def process_general_document_message(self, message_data: Dict[str, Any]):
        """
        Process general document upload message
        
        Args:
            message_data: Message data containing document information
        """
        try:
            logger.info(f"Processing general document message: {message_data.get('document_id')}")
            
            # Similar processing as client document
            self.process_client_document_message(message_data)
            
        except Exception as e:
            logger.error(f"Error processing general document message: {str(e)}") 