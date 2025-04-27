from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId, UserOut

class MediaBase(BaseModel):
    type: str
    url: str
    thumbnail_url: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str}

class PostBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    media: Optional[List[MediaBase]] = []
    
    class Config:
        json_encoders = {ObjectId: str}

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    
    class Config:
        json_encoders = {ObjectId: str}

class PostInDB(PostBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    likes: List[PyObjectId] = []
    shares: List[PyObjectId] = []
    comments_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class PostOut(PostBase):
    id: str = Field(..., alias="_id")
    user: UserOut
    likes_count: int
    shares_count: int
    comments_count: int
    is_liked: bool = False
    is_shared: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    
    class Config:
        json_encoders = {ObjectId: str}

class CommentCreate(CommentBase):
    post_id: str

class CommentInDB(CommentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    post_id: PyObjectId
    user_id: PyObjectId
    likes: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class CommentOut(CommentBase):
    id: str = Field(..., alias="_id")
    post_id: str
    user: UserOut
    likes_count: int
    is_liked: bool = False
    created_at: datetime
    
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True
