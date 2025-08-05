#!/usr/bin/env python3
"""
Initialize MinIO bucket and policies for Document Service
"""
import boto3
import os
import logging
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_minio():
    """Initialize MinIO bucket and policies"""
    try:
        # MinIO configuration
        endpoint_url = os.getenv('S3_ENDPOINT_URL', 'http://minio:9000')
        access_key = os.getenv('AWS_ACCESS_KEY_ID', 'minioadmin')
        secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', 'minioadmin')
        bucket_name = os.getenv('S3_BUCKET_NAME', 'hr-platform-documents')
        region = os.getenv('AWS_REGION', 'us-east-1')
        
        logger.info(f"Connecting to MinIO at {endpoint_url}")
        
        # Create S3 client
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            use_ssl=False
        )
        
        # Check if bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            logger.info(f"Bucket '{bucket_name}' already exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket doesn't exist, create it
                logger.info(f"Creating bucket '{bucket_name}'")
                s3_client.create_bucket(Bucket=bucket_name)
                logger.info(f"Bucket '{bucket_name}' created successfully")
            else:
                logger.error(f"Error checking bucket: {e}")
                return False
        
        # Set bucket policy for public read access (for development)
        try:
            bucket_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket_name}/*"
                    }
                ]
            }
            
            s3_client.put_bucket_policy(
                Bucket=bucket_name,
                Policy=json.dumps(bucket_policy)
            )
            logger.info("Bucket policy set successfully")
            
        except ClientError as e:
            logger.warning(f"Could not set bucket policy: {e}")
        
        logger.info("MinIO initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"MinIO initialization failed: {e}")
        return False

if __name__ == "__main__":
    import json
    init_minio() 