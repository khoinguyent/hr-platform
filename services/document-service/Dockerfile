FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/temp

# Make init script executable
RUN chmod +x /app/init_minio.py

# Create startup script
RUN echo '#!/bin/bash\necho "Initializing MinIO..."\npython /app/init_minio.py\necho "Starting Document Service..."\nuvicorn app.main:app --host 0.0.0.0 --port 4004 --reload' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 4004

# Start the application
CMD ["/app/start.sh"] 