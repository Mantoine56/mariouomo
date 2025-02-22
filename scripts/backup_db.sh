#!/bin/bash

# Mario Uomo E-commerce Platform - Database Backup Script
# This script performs weekly backups of the database and stores them in an encrypted format

# Configuration
BACKUP_DIR="${HOME}/mariouomo/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_PASSWORD=${DB_PASSWORD:-"Jeezy05456347"}  # Default password, prefer environment variable
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.erxqwxyhulnycscgbzlm.supabase.co:5432/postgres"
RETENTION_DAYS=90
GPG_KEY="your-gpg-key"  # Replace with your GPG key
S3_BUCKET="your-bucket"  # Replace with your S3 bucket

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Create backup
echo "Creating database backup..."
pg_dump -Fc "${DB_URL}" > "${BACKUP_DIR}/backup_${TIMESTAMP}.dump"

if [ $? -ne 0 ]; then
    echo "Error: Backup failed"
    exit 1
fi

# Encrypt backup
echo "Encrypting backup..."
gpg --encrypt --recipient "${GPG_KEY}" "${BACKUP_DIR}/backup_${TIMESTAMP}.dump"

if [ $? -ne 0 ]; then
    echo "Error: Encryption failed"
    rm "${BACKUP_DIR}/backup_${TIMESTAMP}.dump"
    exit 1
fi

# Upload to S3 (commented out until S3 bucket is configured)
# echo "Uploading to S3..."
# aws s3 cp "${BACKUP_DIR}/backup_${TIMESTAMP}.dump.gpg" "s3://${S3_BUCKET}/backups/"

# Clean old backups
echo "Cleaning old backups..."
find "${BACKUP_DIR}" -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup completed successfully"
echo "Backup file: ${BACKUP_DIR}/backup_${TIMESTAMP}.dump.gpg"
