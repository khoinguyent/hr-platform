import os
import boto3
import logging
from typing import Tuple, Optional
from botocore.exceptions import ClientError, NoCredentialsError
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class S3UploadService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'hr-platform-documents')
        self.endpoint_url = os.getenv('S3_ENDPOINT_URL')
        self.region = os.getenv('AWS_REGION', 'us-east-1')
        
        # Initialize S3 client
        self._init_s3_client()
    
    def _init_s3_client(self):
        """Initialize S3 client for AWS S3 or MinIO"""
        try:
            if self.endpoint_url:
                # MinIO configuration (development mode)
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=self.endpoint_url,
                    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'minioadmin'),
                    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'minioadmin'),
                    region_name=self.region,
                    use_ssl=False
                )
                logger.info(f"Initialized MinIO client with endpoint: {self.endpoint_url}")
                
                # Ensure bucket exists for MinIO
                self._ensure_bucket_exists()
            else:
                # AWS S3 configuration (production mode)
                self.s3_client = boto3.client(
                    's3',
                    region_name=self.region
                )
                logger.info("Initialized AWS S3 client")
                
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            raise
    
    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            # Check if bucket exists
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                logger.info(f"Bucket {self.bucket_name} already exists")
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == '404':
                    # Bucket doesn't exist, create it
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                    logger.info(f"Created bucket {self.bucket_name}")
                else:
                    raise
        except Exception as e:
            logger.error(f"Error ensuring bucket exists: {str(e)}")
            raise
    
    def generate_s3_key(
        self, 
        document_type: str, 
        filename: str, 
        context_id: str = None
    ) -> str:
        """
        Generate S3 object key for document
        
        Args:
            document_type: Type of document
            filename: Original filename
            context_id: Client ID, Job ID, or User ID
            
        Returns:
            S3 object key
        """
        # Get file extension
        file_extension = os.path.splitext(filename)[1].lower()
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create path structure: documents/{type}/{context_id}/{year}/{month}/{day}/{filename}
        now = datetime.utcnow()
        date_path = now.strftime("%Y/%m/%d")
        
        if context_id:
            s3_key = f"documents/{document_type}/{context_id}/{date_path}/{unique_filename}"
        else:
            s3_key = f"documents/{document_type}/{date_path}/{unique_filename}"
        
        return s3_key
    
    def upload_file(
        self, 
        file_path: str, 
        s3_key: str, 
        content_type: str = None
    ) -> Tuple[bool, str]:
        """
        Upload file to S3/MinIO
        
        Args:
            file_path: Local file path
            s3_key: S3 object key
            content_type: MIME type of the file
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            if not os.path.exists(file_path):
                return False, f"File not found: {file_path}"
            
            # Upload file
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            
            logger.info(f"Successfully uploaded file to S3: {s3_key}")
            return True, "File uploaded successfully"
            
        except NoCredentialsError:
            error_msg = "AWS credentials not found"
            logger.error(error_msg)
            return False, error_msg
        except ClientError as e:
            error_msg = f"S3 upload error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error during upload: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_file_url(self, s3_key: str) -> str:
        """
        Get public URL for uploaded file
        
        Args:
            s3_key: S3 object key
            
        Returns:
            Public URL
        """
        if self.endpoint_url:
            # MinIO URL (development mode)
            return f"{self.endpoint_url}/{self.bucket_name}/{s3_key}"
        else:
            # AWS S3 URL (production mode)
            return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
    
    def delete_file(self, s3_key: str) -> Tuple[bool, str]:
        """
        Delete file from S3/MinIO
        
        Args:
            s3_key: S3 object key
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            
            logger.info(f"Successfully deleted file from S3: {s3_key}")
            return True, "File deleted successfully"
            
        except ClientError as e:
            error_msg = f"S3 delete error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error during delete: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def file_exists(self, s3_key: str) -> bool:
        """
        Check if file exists in S3/MinIO
        
        Args:
            s3_key: S3 object key
            
        Returns:
            True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            else:
                logger.error(f"Error checking file existence: {str(e)}")
                return False
        except Exception as e:
            logger.error(f"Unexpected error checking file existence: {str(e)}")
            return False 