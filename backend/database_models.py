
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    sessions = relationship("UserSession", back_populates="user")
    assessments = relationship("Assessment", back_populates="user")

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty_level = Column(String(50))  # beginner, intermediate, advanced
    category = Column(String(100))  # wisdom, social_skills, personal_development, etc.
    content = Column(JSON)  # Store story scenes and choices as JSON
    comprehension_questions = Column(JSON)  # Store questions as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    sessions = relationship("UserSession", back_populates="story")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    current_scene_id = Column(Integer, default=1)
    choices_made = Column(JSON)  # Store user choices as JSON array
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="sessions")
    story = relationship("Story", back_populates="sessions")
    assessments = relationship("Assessment", back_populates="session")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("user_sessions.id"), nullable=False)
    question_id = Column(Integer, nullable=False)
    question_type = Column(String(50))  # multiple_choice, short_answer, reflection
    user_answer = Column(Text)
    is_correct = Column(Boolean, nullable=True)  # None for reflection questions
    score = Column(Float, nullable=True)  # 0-1 for graded questions
    ai_feedback = Column(Text)  # Generated feedback from LLM
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
    session = relationship("UserSession", back_populates="assessments")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stories_completed = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    favorite_categories = Column(JSON)  # Array of preferred story categories
    last_activity = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
