import pika
import json
import os
import logging
from typing import Dict, Any
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class QueueService:
    def __init__(self):
        self.connection = None
        self.channel = None
        # Don't connect immediately, connect when needed
        self._connected = False
        
    def connect(self):
        """Establish connection to RabbitMQ"""
        if self._connected:
            return
            
        try:
            # RabbitMQ connection parameters
            credentials = pika.PlainCredentials(
                os.getenv('RABBITMQ_USER', 'guest'),
                os.getenv('RABBITMQ_PASS', 'guest')
            )
            
            parameters = pika.ConnectionParameters(
                host=os.getenv('RABBITMQ_HOST', 'rabbitmq'),
                port=int(os.getenv('RABBITMQ_PORT', 5672)),
                virtual_host=os.getenv('RABBITMQ_VHOST', '/'),
                credentials=credentials,
                connection_attempts=3,
                retry_delay=5
            )
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare exchanges and queues
            self._setup_queues()
            
            self._connected = True
            logger.info("Successfully connected to RabbitMQ")
            
        except Exception as e:
            logger.warning(f"Failed to connect to RabbitMQ: {str(e)}")
            self._connected = False
            # Don't raise the exception, just log it
    
    def _setup_queues(self):
        """Setup exchanges and queues for different document types"""
        
        # Main exchange for routing messages
        self.channel.exchange_declare(
            exchange='document_processing',
            exchange_type='topic',
            durable=True
        )
        
        # Queues for different document types
        queues = [
            'client-doc-queue',
            'job-description-doc-queue', 
            'resume-doc-queue',
            'general-doc-queue'
        ]
        
        for queue_name in queues:
            self.channel.queue_declare(
                queue=queue_name,
                durable=True
            )
            
            # Bind queues to exchange with appropriate routing keys
            if queue_name == 'client-doc-queue':
                routing_keys = ['client-doc.*']
            elif queue_name == 'job-description-doc-queue':
                routing_keys = ['job-description-doc.*']
            elif queue_name == 'resume-doc-queue':
                routing_keys = ['resume-doc.*']
            elif queue_name == 'general-doc-queue':
                routing_keys = ['general-doc.*']
            else:
                routing_keys = ['*']
                
            for routing_key in routing_keys:
                self.channel.queue_bind(
                    exchange='document_processing',
                    queue=queue_name,
                    routing_key=routing_key
                )
    
    def publish_message(self, message_type: str, data: Dict[str, Any], routing_key: str = None):
        """
        Publish a message to the appropriate queue
        
        Args:
            message_type: Type of message (client-doc, job-description-doc, resume-doc)
            data: Message data
            routing_key: Specific routing key (optional)
        """
        try:
            if not self._connected:
                self.connect()
                
            if not self._connected:
                logger.warning("RabbitMQ not connected, skipping message publish")
                return None
                
            # Create message payload
            message = {
                'id': str(uuid.uuid4()),
                'type': message_type,
                'timestamp': datetime.utcnow().isoformat(),
                'data': data
            }
            
            # Determine routing key if not provided
            if not routing_key:
                routing_key = f"{message_type}.*"
            
            # Publish message
            self.channel.basic_publish(
                exchange='document_processing',
                routing_key=routing_key,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            
            logger.info(f"Published message: {message_type} with ID {message['id']}")
            return message['id']
            
        except Exception as e:
            logger.error(f"Failed to publish message: {str(e)}")
            return None
    
    def publish_client_document_message(self, document_data: Dict[str, Any]):
        """
        Publish a client document processing message
        
        Args:
            document_data: Document data including ID, type, client_id, etc.
        """
        return self.publish_message(
            message_type='client-doc',
            data=document_data,
            routing_key='client-doc.create'
        )
    
    def publish_job_description_message(self, document_data: Dict[str, Any]):
        """
        Publish a job description document processing message
        
        Args:
            document_data: Document data including ID, type, job_id, etc.
        """
        return self.publish_message(
            message_type='job-description-doc',
            data=document_data,
            routing_key='job-description-doc.create'
        )
    
    def publish_resume_message(self, document_data: Dict[str, Any]):
        """
        Publish a resume document processing message
        
        Args:
            document_data: Document data including ID, type, user_id, etc.
        """
        return self.publish_message(
            message_type='resume-doc',
            data=document_data,
            routing_key='resume-doc.create'
        )
    
    def publish_general_document_message(self, document_data: Dict[str, Any]):
        """
        Publish a general document processing message
        
        Args:
            document_data: Document data including ID, type, etc.
        """
        return self.publish_message(
            message_type='general-doc',
            data=document_data,
            routing_key='general-doc.create'
        )
    
    def close(self):
        """Close the RabbitMQ connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ connection closed") 