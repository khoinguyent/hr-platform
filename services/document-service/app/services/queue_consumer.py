import os
import json
import logging
import pika
import threading
from typing import Dict, Any
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models.document import DocumentStatus
from .document_service import DocumentService
from .s3_upload_service import S3UploadService

logger = logging.getLogger(__name__)

class QueueConsumer:
    def __init__(self):
        self.document_service = DocumentService()
        self.s3_service = S3UploadService()
        self.connection = None
        self.channel = None
        self.queues = [
            'client-doc-queue',
            'job-description-queue', 
            'resume-queue',
            'general-doc-queue'
        ]
        
    def connect(self):
        """Connect to RabbitMQ"""
        try:
            # Get RabbitMQ connection parameters
            rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
            rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
            rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
            rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
            
            # Create connection parameters
            credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
            parameters = pika.ConnectionParameters(
                host=rabbitmq_host,
                port=rabbitmq_port,
                credentials=credentials,
                connection_attempts=5,
                retry_delay=5
            )
            
            # Establish connection
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare queues
            for queue in self.queues:
                self.channel.queue_declare(queue=queue, durable=True)
            
            logger.info("Successfully connected to RabbitMQ")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {str(e)}")
            return False
    
    def process_message(self, ch, method, properties, body):
        """Process a message from the queue"""
        try:
            # Parse message
            message_data = json.loads(body.decode('utf-8'))
            
            # Handle nested message format where data is in 'data' field
            if 'data' in message_data:
                message_data = message_data['data']
            
            document_id = message_data.get('document_id')
            
            if not document_id:
                logger.warning(f"Message missing document_id: {message_data}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
                
            logger.info(f"Processing message for document: {document_id}")
            
            # Get database session
            db = next(get_db())
            
            try:
                # Update status to processing
                self.document_service.update_document_status(
                    db, 
                    document_id, 
                    DocumentStatus.PROCESSING
                )
                
                # Generate S3 key
                context_id = message_data.get('client_id') or message_data.get('job_id') or message_data.get('user_id')
                s3_key = self.s3_service.generate_s3_key(
                    message_data['document_type'],
                    message_data['original_filename'],
                    context_id
                )
                
                # Create a temporary file with the document content
                # In a real implementation, you would get the actual file from the original upload
                # For now, we'll create a dummy file for testing
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix=message_data.get('file_extension', '.txt')) as temp_file:
                    # Write some dummy content (in real implementation, this would be the actual file content)
                    temp_file.write(b"Document content for " + message_data['name'].encode('utf-8'))
                    temp_file_path = temp_file.name
                
                try:
                    # Upload to S3/MinIO
                    upload_success, upload_message = self.s3_service.upload_file(
                        temp_file_path,
                        s3_key,
                        message_data.get('mime_type', 'application/octet-stream')
                    )
                    
                    if upload_success:
                        # Get the file URL
                        s3_url = self.s3_service.get_file_url(s3_key)
                        
                        # Update document with S3 information and set status to uploaded
                        self.document_service.update_document_status(
                            db,
                            document_id,
                            DocumentStatus.UPLOADED,
                            s3_key,
                            s3_url
                        )
                        
                        logger.info(f"Successfully processed document: {document_id} -> {s3_url}")
                    else:
                        # Update status to failed
                        self.document_service.update_document_status(
                            db,
                            document_id,
                            DocumentStatus.FAILED
                        )
                        logger.error(f"Failed to upload document {document_id}: {upload_message}")
                        
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                
                # Acknowledge message
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except Exception as e:
                logger.error(f"Error processing document {document_id}: {str(e)}")
                # Update status to failed
                try:
                    self.document_service.update_document_status(
                        db,
                        document_id,
                        DocumentStatus.FAILED
                    )
                except:
                    pass
                # Acknowledge message to remove it from queue
                ch.basic_ack(delivery_tag=method.delivery_tag)
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            # Acknowledge message to remove it from queue
            ch.basic_ack(delivery_tag=method.delivery_tag)
    
    def start_consuming(self):
        """Start consuming messages from all queues"""
        try:
            if not self.connect():
                logger.error("Failed to connect to RabbitMQ")
                return
            
            # Set up consumer for each queue
            for queue in self.queues:
                self.channel.basic_consume(
                    queue=queue,
                    on_message_callback=self.process_message,
                    auto_ack=False
                )
                logger.info(f"Started consuming from queue: {queue}")
            
            logger.info("Starting to consume messages...")
            self.channel.start_consuming()
            
        except Exception as e:
            logger.error(f"Error in start_consuming: {str(e)}")
        finally:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
    
    def stop_consuming(self):
        """Stop consuming messages"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("Stopped consuming messages")
        except Exception as e:
            logger.error(f"Error stopping consumer: {str(e)}") 