#!/bin/bash

echo "🚀 Starting Docfly Chatbot System"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Python and Node.js found"

# Setup Python backend
echo "📦 Setting up Python backend..."
cd chatbot_backend

# Install Python dependencies
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Create required directories
mkdir -p forms completed_forms

echo "✅ Python backend setup complete"

# Start Python backend in background
echo "🐍 Starting Python backend server..."
python run_server.py &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "✅ Python backend started at http://localhost:8000"

# Go back to main directory
cd ..

# Setup and start React frontend
echo "⚛️  Starting React frontend..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo "🌐 Starting React development server..."
npm run dev &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "🎉 Docfly Chatbot System is now running!"
echo "=================================="
echo "📱 Frontend (Docfly): http://localhost:5173"
echo "🤖 Backend (API): http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🔧 To stop the system:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📝 Usage:"
echo "   1. Create forms in Docfly"
echo "   2. Export as JSON (automatically uploads to chatbot)"
echo "   3. Click 'Form Assistant' to start chatbot"
echo "   4. Fill forms interactively"
echo ""

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
wait
