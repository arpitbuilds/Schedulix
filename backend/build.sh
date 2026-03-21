#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

# Create and isolate the Python environment for Render's Linux container
echo "Setting up Python environment..."
python3 -m venv venv

# Activate and install Python packages
source venv/bin/activate
pip install -r requirements.txt

echo "Build Configuration Complete!"
