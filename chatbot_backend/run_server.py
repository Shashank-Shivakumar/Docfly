#!/usr/bin/env python3
"""
Run the Docfly Chatbot API Server
"""
import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Ensure directories exist
    Path("forms").mkdir(exist_ok=True)
    Path("completed_forms").mkdir(exist_ok=True)
    
    print("🚀 Starting Docfly Chatbot API Server...")
    print("📁 Forms directory: ./forms")
    print("📁 Completed forms directory: ./completed_forms")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API Documentation at: http://localhost:8000/docs")
    print("\n" + "="*50)
    
    uvicorn.run(
        "chatbot_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
