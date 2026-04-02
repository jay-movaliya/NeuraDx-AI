import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        # Test connection
        await db.client.admin.command('ping')
        logger.info("✅ Connected to MongoDB successfully")
    except Exception as e:
        logger.error(f"❌ Could not connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        logger.info("🔌 Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return db.client[settings.DATABASE_NAME]

# Collections
def get_users_collection():
    return get_database()["users"]

def get_scans_collection():
    return get_database()["scans"]

def get_patients_collection():
    return get_database()["patients"]

def get_reports_collection():
    return get_database()["reports"]
