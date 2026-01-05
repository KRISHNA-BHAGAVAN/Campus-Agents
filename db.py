import os
from pymongo import AsyncMongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "campus_agent_db"
COLLECTION_NAME = "generations"

client = None
db = None

def get_database():
    global client, db
    if client is None:
        try:
            print(f"Connecting to MongoDB at {MONGODB_URI}")
            client = AsyncMongoClient(MONGODB_URI)
            db = client[DB_NAME]
            print("Connected to MongoDB successfully.")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise e
    return db

async def save_generation_to_db(data: dict):
    """Saves a generated interview plan to the database."""
    database = get_database()
    collection = database[COLLECTION_NAME]
    
    document = {
        **data,
        "created_at": datetime.utcnow()
    }
    
    result = await collection.insert_one(document)
    print(f"Saved generation with ID: {result.inserted_id}")
    return str(result.inserted_id)

async def get_generation_history(limit: int = 10):
    """Retrieves recent generation history."""
    database = get_database()
    collection = database[COLLECTION_NAME]
    
    cursor = collection.find({}).sort("created_at", -1).limit(limit)
    
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        history.append(doc)
        
    return history
