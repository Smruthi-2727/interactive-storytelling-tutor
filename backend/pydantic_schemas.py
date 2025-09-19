
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
    content: List[Dict[str, Any]]
    comprehension_questions: List[Dict[str, Any]]
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

class SessionChoice(BaseModel):
    scene_id: int
    choice_id: str

class UserSession(BaseModel):
    id: int
    user_id: int
    story_id: int
    current_scene_id: int
    choices_made: List[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_completed: bool

    class Config:
        from_attributes = True

# Assessment schemas
class AssessmentCreate(BaseModel):
    session_id: int
    question_id: int
    question_type: str
    user_answer: str

class Assessment(BaseModel):
    id: int
    user_id: int
    session_id: int
    question_id: int
    question_type: str
    user_answer: str
    is_correct: Optional[bool]
    score: Optional[float]
    ai_feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class UserStats(BaseModel):
    total_sessions: int
    stories_completed: int
    average_score: float
    favorite_categories: List[str]
    recent_activity: List[Dict[str, Any]]

class DashboardData(BaseModel):
    user: User
    stats: UserStats
    recent_sessions: List[UserSession]

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
