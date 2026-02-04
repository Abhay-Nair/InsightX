from pymongo import MongoClient
import os

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "InsightX")  # Match documentation

try:
    client = MongoClient(MONGODB_URL)
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB: {DB_NAME}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    db = None

def get_db():
    if db is None:
        raise Exception("Database not connected")
    return db
