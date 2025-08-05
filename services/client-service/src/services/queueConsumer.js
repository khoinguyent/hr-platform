const amqp = require('amqplib');
const logger = require('../utils/logger');

class QueueConsumer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // RabbitMQ connection parameters
            const credentials = {
                hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
                port: parseInt(process.env.RABBITMQ_PORT) || 5672,
                username: process.env.RABBITMQ_USER || 'guest',
                password: process.env.RABBITMQ_PASS || 'guest',
                vhost: process.env.RABBITMQ_VHOST || '/'
            };

            this.connection = await amqp.connect(credentials);
            this.channel = await this.connection.createChannel();
            
            // Declare exchange and queue
            await this.channel.assertExchange('document_processing', 'topic', { durable: true });
            await this.channel.assertQueue('client-doc-queue', { durable: true });
            await this.channel.bindQueue('client-doc-queue', 'document_processing', 'client-doc.*');
            
            this.isConnected = true;
            logger.info('Connected to RabbitMQ and bound to client-doc-queue');
            
            // Handle connection close
            this.connection.on('close', () => {
                logger.warn('RabbitMQ connection closed');
                this.isConnected = false;
                // Attempt to reconnect after a delay
                setTimeout(() => this.connect(), 5000);
            });
            
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ:', error);
            this.isConnected = false;
            // Attempt to reconnect after a delay
            setTimeout(() => this.connect(), 5000);
        }
    }

    async startConsuming() {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            await this.channel.consume('client-doc-queue', async (msg) => {
                if (msg) {
                    try {
                        const message = JSON.parse(msg.content.toString());
                        logger.info('Received message:', message);
                        
                        await this.processClientDocumentMessage(message);
                        
                        // Acknowledge the message
                        this.channel.ack(msg);
                        
                    } catch (error) {
                        logger.error('Error processing message:', error);
                        
                        // Reject the message and requeue it
                        this.channel.nack(msg, false, true);
                    }
                }
            });
            
            logger.info('Started consuming messages from client-doc-queue');
            
        } catch (error) {
            logger.error('Error starting consumer:', error);
        }
    }

    async processClientDocumentMessage(message) {
        try {
            const { type, data } = message;
            
            if (type === 'client-doc' && data) {
                const { document_id, document_type, client_id, s3_url, filename } = data;
                
                logger.info(`Processing client document: ${document_id} for client: ${client_id}`);
                
                // Here you can add any client-specific document processing logic
                // For example:
                // - Update client record with document information
                // - Send notifications
                // - Update document status in the upload service
                // - Trigger any client-specific workflows
                
                await this.handleClientDocument(document_id, document_type, client_id, s3_url, filename);
                
                logger.info(`Successfully processed client document: ${document_id}`);
            }
            
        } catch (error) {
            logger.error('Error processing client document message:', error);
            throw error;
        }
    }

    async handleClientDocument(documentId, documentType, clientId, s3Url, filename) {
        try {
            // Example: Update client record with document information
            // This is where you would add your client-specific logic
            
            logger.info(`Handling client document:
                Document ID: ${documentId}
                Type: ${documentType}
                Client ID: ${clientId}
                Filename: ${filename}
                S3 URL: ${s3Url}
            `);
            
            // Example: You could update a client_documents table or add document metadata
            // to the client record, or trigger notifications, etc.
            
            // For now, we'll just log the information
            // In a real implementation, you might:
            // 1. Update client record with document count
            // 2. Store document metadata in client service database
            // 3. Send notifications to relevant users
            // 4. Trigger document processing workflows
            // 5. Update document status in upload service
            
        } catch (error) {
            logger.error('Error handling client document:', error);
            throw error;
        }
    }

    async stop() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            logger.info('Stopped RabbitMQ consumer');
        } catch (error) {
            logger.error('Error stopping consumer:', error);
        }
    }
}

module.exports = QueueConsumer; 