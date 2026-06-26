from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "InsightX_db")

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