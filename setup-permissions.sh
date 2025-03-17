#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Make sure logs directory is writable for the container
chmod 777 logs

echo "Logs directory permissions set up successfully!"