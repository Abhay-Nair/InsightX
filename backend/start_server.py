#!/usr/bin/env python3
"""
InsightX Backend Startup Script
Ensures MongoDB connection and starts the FastAPI server
"""

import os
import sys
import subprocess
import time
from pymongo import MongoClient

def check_mongodb():
    """Check if MongoDB is running and accessible"""
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB is running and accessible")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def start_mongodb():
    """Attempt to start MongoDB service"""
    try:
        # Try to start MongoDB service (Windows)
        subprocess.run(["net", "start", "MongoDB"], check=False, capture_output=True)
        time.sleep(3)  # Wait for service to start
        return check_mongodb()
    except:
        print("⚠️  Could not start MongoDB service automatically")
        return False

def main():
    print("🚀 Starting InsightX Backend...")
    
    # Check if MongoDB is running
    if not check_mongodb():
        print("📦 Attempting to start MongoDB...")
        if not start_mongodb():
            print("\n❌ MongoDB is not running!")
            print("Please start MongoDB manually:")
            print("  - Windows: Run 'net start MongoDB' as administrator")
            print("  - macOS: Run 'brew services start mongodb-community'")
            print("  - Linux: Run 'sudo systemctl start mongod'")
            print("\nOr install MongoDB from: https://www.mongodb.com/try/download/community")
            sys.exit(1)
    
    # Set environment variables
    os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/")
    os.environ.setdefault("MONGO_DB_NAME", "InsightX")
    
    print("🌐 Starting FastAPI server...")
    
    # Start the FastAPI server
    try:
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("❌ uvicorn not installed. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn"])
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )

if __name__ == "__main__":
    main()