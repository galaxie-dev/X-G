from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI
from .config import Settings

settings = Settings()
app = FastAPI()

async def init_db():
    """Initialize database connection"""
    app.state.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.state.mongodb = app.state.mongodb_client[settings.DATABASE_NAME]
    
    # Create indexes
    db = app.state.mongodb
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("handle", unique=True)
    
    # Posts collection indexes
    await db.posts.create_index("user_id")
    await db.posts.create_index("created_at")
    
    # Comments collection indexes
    await db.comments.create_index("post_id")
    await db.comments.create_index("user_id")
    
    # Media collection indexes
    await db.media.create_index("post_id")
    await db.media.create_index("user_id")

async def get_db():
    """Get database instance"""
    return app.state.mongodb

# Database utility functions
async def get_collection(collection_name: str):
    """Get a specific collection from the database"""
    db = await get_db()
    return db[collection_name]
