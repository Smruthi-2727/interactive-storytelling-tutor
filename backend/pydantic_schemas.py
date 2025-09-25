
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

# Story schemas
class StoryBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty_level: str
    category: str

class Story(StoryBase):
    id: int
    scenes: List[Dict[str, Any]]  # ← Updated for 3-scene format
    quiz: List[Dict[str, Any]]    # ← Updated for quiz format
    total_scenes: int = 3         # ← Add this
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class StoryList(StoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Session schemas
class SessionCreate(BaseModel):
    story_id: int

class UserSession(BaseModel):
    id: int
    user_id: int
    story_id: int
    current_scene_index: int      # ← Fixed field name
    scenes_completed: int = 0     # ← Added missing field
    quiz_started: bool = False    # ← Added missing field
    quiz_completed: bool = False  # ← Added missing field
    quiz_score: Optional[float] = None  # ← Added missing field
    total_reading_time: int = 0   # ← Added missing field
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_completed: bool
    
    class Config:
        from_attributes = True

# Assessment schemas
class AssessmentCreate(BaseModel):
    session_id: int
    question_index: int
    question_text: str
    user_answer_index: int
    user_answer_text: str

class Assessment(BaseModel):
    id: int
    user_id: int
    session_id: int
    question_index: int
    question_text: str
    user_answer_index: int
    user_answer_text: str
    correct_answer_index: int
    is_correct: Optional[bool]
    points_earned: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Stats schemas
class UserStats(BaseModel):
    total_sessions: int
    stories_completed: int
    average_score: float
    favorite_categories: List[str]
    recent_activity: List[Dict[str, Any]]

class DashboardData(BaseModel):
    user: User
    stats: Dict[str, str]  # ← Simplified for your dashboard format
    recent_sessions: List[Dict[str, Any]]  # ← Simplified

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Response schemas
class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
