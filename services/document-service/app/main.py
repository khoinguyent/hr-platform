from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import logging
import os
import threading
from datetime import datetime
from dotenv import load_dotenv

from .models.database import get_db
from .models.document import DocumentType, DocumentStatus
from .services.document_service import DocumentService
from .services.queue_consumer import QueueConsumer

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Document Service",
    description="Document management service for HR Platform",
    version="1.0.0"
)

# Set maximum file size for uploads
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB in bytes

# Initialize document service
document_service = DocumentService()

# Initialize queue consumer
queue_consumer = None
consumer_thread = None

@app.on_event("startup")
async def startup_event():
    """Startup event to initialize queue consumer"""
    global queue_consumer, consumer_thread
    
    try:
        # Initialize queue consumer
        queue_consumer = QueueConsumer()
        
        # Start consumer in a separate thread
        consumer_thread = threading.Thread(target=queue_consumer.start_consuming, daemon=True)
        consumer_thread.start()
        
        logger.info("Queue consumer started successfully")
    except Exception as e:
        logger.error(f"Failed to start queue consumer: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event to stop queue consumer"""
    global queue_consumer
    
    try:
        if queue_consumer:
            queue_consumer.stop_consuming()
            logger.info("Queue consumer stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping queue consumer: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Document Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "document-service"}

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    name: str = Form(...),
    client_id: Optional[str] = Form(None),
    job_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    expired_date: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a document with message queue processing
    
    Args:
        file: The file to upload
        document_type: Type of document (contract, appendix, job_description, resume, etc.)
        name: Document name/title
        client_id: Client ID (for client documents)
        job_id: Job ID (for job descriptions)
        user_id: User ID (for resumes)
        description: Document description (optional)
        tags: JSON string of tags (optional)
        metadata: JSON string of additional metadata (optional)
        expired_date: Document expiry date in ISO format (optional)
    """
    try:
        # Validate file size
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({file.size} bytes) exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)"
            )
        
        # Validate document type
        try:
            # Try to find the enum by value first
            doc_type = None
            for dt in DocumentType:
                if dt.value == document_type:
                    doc_type = dt
                    break
            
            if not doc_type:
                # Try to find by name (for backward compatibility)
                doc_type = DocumentType[document_type.upper()]
                
        except (ValueError, KeyError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type. Allowed types: {[t.value for t in DocumentType]}"
            )
        
        # Parse expired date if provided
        parsed_expired_date = None
        if expired_date:
            try:
                parsed_expired_date = datetime.fromisoformat(expired_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid expired_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        # Process document upload
        success, message, document = document_service.process_document_upload(
            db=db,
            file=file,
            document_type=doc_type,
            name=name,
            client_id=client_id,
            job_id=job_id,
            user_id=user_id,
            description=description,
            tags=tags,
            metadata=metadata,
            expired_date=parsed_expired_date
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return {
            "success": True,
            "message": message,
            "document": {
                "id": document.id,
                "name": document.name,
                "original_filename": document.original_filename,
                "document_type": document.document_type,
                "status": document.status,
                "client_id": document.client_id,
                "job_id": document.job_id,
                "user_id": document.user_id,
                "upload_date": document.upload_date.isoformat(),
                "expired_date": document.expired_date.isoformat() if document.expired_date else None,
                "created_at": document.created_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upload_document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get document by ID"""
    try:
        document = document_service.get_document(db, document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return {
            "id": document.id,
            "name": document.name,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "file_extension": document.file_extension,
            "document_type": document.document_type.value,
            "status": document.status.value,
            "client_id": document.client_id,
            "job_id": document.job_id,
            "user_id": document.user_id,
            "description": document.description,
            "tags": document.tags,
            "document_metadata": document.document_metadata,
            "s3_url": document.s3_url,
            "upload_date": document.upload_date.isoformat(),
            "expired_date": document.expired_date.isoformat() if document.expired_date else None,
            "created_at": document.created_at.isoformat(),
            "updated_at": document.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/client/{client_id}")
async def get_client_documents(client_id: str, db: Session = Depends(get_db)):
    """Get all documents for a client"""
    try:
        documents = document_service.get_client_documents(db, client_id)
        
        return {
            "client_id": client_id,
            "documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "original_filename": doc.original_filename,
                    "document_type": doc.document_type,
                    "status": doc.status,
                    "s3_url": doc.s3_url,
                    "upload_date": doc.upload_date.isoformat(),
                    "expired_date": doc.expired_date.isoformat() if doc.expired_date else None
                }
                for doc in documents
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_client_documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/job/{job_id}")
async def get_job_documents(job_id: str, db: Session = Depends(get_db)):
    """Get all documents for a job"""
    try:
        documents = document_service.get_job_documents(db, job_id)
        
        return {
            "job_id": job_id,
            "documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "original_filename": doc.original_filename,
                    "document_type": doc.document_type,
                    "status": doc.status,
                    "s3_url": doc.s3_url,
                    "upload_date": doc.upload_date.isoformat(),
                    "expired_date": doc.expired_date.isoformat() if doc.expired_date else None
                }
                for doc in documents
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_job_documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/user/{user_id}")
async def get_user_documents(user_id: str, db: Session = Depends(get_db)):
    """Get all documents for a user"""
    try:
        documents = document_service.get_user_documents(db, user_id)
        
        return {
            "user_id": user_id,
            "documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "original_filename": doc.original_filename,
                    "document_type": doc.document_type,
                    "status": doc.status,
                    "s3_url": doc.s3_url,
                    "upload_date": doc.upload_date.isoformat(),
                    "expired_date": doc.expired_date.isoformat() if doc.expired_date else None
                }
                for doc in documents
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_user_documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/status/{status}")
async def get_documents_by_status(status: str, db: Session = Depends(get_db)):
    """Get documents by status"""
    try:
        try:
            doc_status = DocumentStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed statuses: {[s.value for s in DocumentStatus]}"
            )
        
        documents = document_service.get_documents_by_status(db, doc_status)
        
        return {
            "status": status,
            "documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "original_filename": doc.original_filename,
                    "document_type": doc.document_type.value,
                    "client_id": doc.client_id,
                    "job_id": doc.job_id,
                    "user_id": doc.user_id,
                    "upload_date": doc.upload_date.isoformat()
                }
                for doc in documents
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_documents_by_status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/documents/expired")
async def get_expired_documents(db: Session = Depends(get_db)):
    """Get all expired documents"""
    try:
        documents = document_service.get_expired_documents(db)
        
        return {
            "expired_documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "original_filename": doc.original_filename,
                    "document_type": doc.document_type.value,
                    "expired_date": doc.expired_date.isoformat(),
                    "days_expired": doc.days_until_expiry()
                }
                for doc in documents
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_expired_documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) 