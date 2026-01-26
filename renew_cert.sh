#!/bin/bash

CERT_DIR="./certs"
IP_ADDRESS="10.50.1.58"

# Ensure the certs directory exists
mkdir -p $CERT_DIR

echo "Generating a new self-signed SSL certificate for $IP_ADDRESS..."

# Generate new SSL certificate (valid for 1 year)
openssl req -x509 -newkey rsa:4096 -keyout $CERT_DIR/server.key -out $CERT_DIR/server.crt -days 365 -nodes -subj "/CN=$IP_ADDRESS"

echo "New certificate generated."

# Restart the Nginx container to apply the new certificate
echo "Restarting Nginx container..."
docker restart inventory-nginx

echo "SSL certificate renewed and Nginx restarted successfully!"
