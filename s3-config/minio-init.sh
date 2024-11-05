#!/bin/sh
minio server /data --console-address ':9001'
# Configure MinIO Client
mc config host add myminio http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

# Create the bucket if it does not exist
echo "Creating bucket: $VIDEO_BUCKET_NAME"
if ! mc ls myminio/$VIDEO_BUCKET_NAME > /dev/null 2>&1; then
    mc mb myminio/$VIDEO_BUCKET_NAME
    echo "Bucket $VIDEO_BUCKET_NAME created."
else
    echo "Bucket $VIDEO_BUCKET_NAME already exists."
fi

# Set CORS configuration
echo "Setting CORS configuration for bucket: $VIDEO_BUCKET_NAME"
mc anonymous set download myminio/$VIDEO_BUCKET_NAME

# Apply CORS configuration from file if it exists
if [ -f /etc/minio/cors.json ]; then
    mc admin config set myminio cors < /etc/minio/cors.json
fi

# Set up bucket notifications if needed
if [ -f /etc/minio/bucket-notification.json ]; then
    mc event add myminio/$VIDEO_BUCKET_NAME arn:minio:sqs::1:rabbitmq --event put,delete
fi

echo "MinIO configuration complete."