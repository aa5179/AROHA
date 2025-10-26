#!/bin/bash

# Setup script for local development

echo "Setting up Aroha Mental Health App..."

# Navigate to client directory and install dependencies
echo "Installing client dependencies..."
cd client
npm install

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file from .env.example - please update with your credentials"
fi

cd ..

# Navigate to server directory and setup Python environment
echo "Setting up server environment..."
cd server

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "Created Python virtual environment"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate  # For Unix/Linux/Mac
# venv\Scripts\activate  # Uncomment for Windows

pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created server .env file from .env.example - please update with your API keys"
fi

echo "Setup complete!"
echo ""
echo "To start development:"
echo "1. Update .env files in both client/ and server/ directories"
echo "2. Start the server: cd server && python main.py"
echo "3. Start the client: cd client && npm run dev"