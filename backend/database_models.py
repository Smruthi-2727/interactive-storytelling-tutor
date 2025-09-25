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
    progress = relationship("UserProgress", back_populates="user", uselist=False)

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty_level = Column(String(50))  # beginner, intermediate, advanced
    category = Column(String(100))  # wisdom, social_skills, personal_development, etc.
    scenes = Column(JSON)  # Store 3 scenes as JSON array [{"scene_id": 1, "text": "..."}]
    quiz = Column(JSON)  # Store 5-6 quiz questions as JSON array
    total_scenes = Column(Integer, default=3)  # Always 3 scenes per story
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    sessions = relationship("UserSession", back_populates="story")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    current_scene_index = Column(Integer, default=0)  # 0, 1, 2 for scenes 1, 2, 3
    scenes_completed = Column(Integer, default=0)  # Track how many scenes completed (0-3)
    quiz_started = Column(Boolean, default=False)  # Whether user has started the quiz
    quiz_completed = Column(Boolean, default=False)  # Whether user completed the quiz
    quiz_score = Column(Float, nullable=True)  # Final quiz score percentage (0-100)
    total_reading_time = Column(Integer, default=0)  # Total time spent reading in seconds
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)  # When quiz was completed
    is_completed = Column(Boolean, default=False)  # True when quiz is finished

    # Relationships
    user = relationship("User", back_populates="sessions")
    story = relationship("Story", back_populates="sessions")
    assessments = relationship("Assessment", back_populates="session")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("user_sessions.id"), nullable=False)
    question_index = Column(Integer, nullable=False)  # 0-4 for quiz questions
    question_text = Column(Text, nullable=False)  # The actual question asked
    user_answer_index = Column(Integer, nullable=True)  # Selected option index (0-3)
    user_answer_text = Column(String(255), nullable=True)  # Selected option text
    correct_answer_index = Column(Integer, nullable=False)  # Index of correct answer
    is_correct = Column(Boolean, nullable=False)  # Whether user got it right
    points_earned = Column(Integer, default=0)  # Points for this question (0 or 1)
    answered_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
    session = relationship("UserSession", back_populates="assessments")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Story completion tracking
    total_stories_completed = Column(Integer, default=0)  # Stories where quiz was completed
    total_scenes_read = Column(Integer, default=0)  # Total scenes read across all stories
    total_sessions = Column(Integer, default=0)  # Total story sessions started
    
    # Performance metrics
    average_quiz_score = Column(Float, default=0.0)  # Average across all completed quizzes
    total_reading_time = Column(Integer, default=0)  # Total time spent reading (minutes)
    current_streak = Column(Integer, default=0)  # Days of consecutive activity
    longest_streak = Column(Integer, default=0)  # Longest streak ever achieved
    
    # Category preferences and performance
    favorite_categories = Column(JSON)  # Array of preferred story categories
    category_scores = Column(JSON)  # Performance by category {"wisdom": 85, "social_skills": 92}
    
    # Activity tracking
    last_activity_date = Column(DateTime, default=datetime.utcnow)
    last_completed_story_id = Column(Integer, ForeignKey("stories.id"), nullable=True)
    
    # Achievements/milestones
    achievements = Column(JSON)  # Array of earned achievements
    total_points = Column(Integer, default=0)  # Cumulative points from quizzes

    # Relationships
    user = relationship("User", back_populates="progress")
    last_completed_story = relationship("Story")

class DailyActivity(Base):
    __tablename__ = "daily_activity"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_date = Column(DateTime, nullable=False)  # Date of activity (no time)
    stories_completed = Column(Integer, default=0)  # Stories completed on this day
    scenes_read = Column(Integer, default=0)  # Scenes read on this day
    quiz_attempts = Column(Integer, default=0)  # Quiz attempts on this day
    total_time_minutes = Column(Integer, default=0)  # Time spent on this day
    
    # Relationships
    user = relationship("User")

# Add indexes for better performance
from sqlalchemy import Index

# Indexes for common queries
Index('idx_user_sessions_user_story', UserSession.user_id, UserSession.story_id)
Index('idx_assessments_session', Assessment.session_id)
Index('idx_user_progress_user', UserProgress.user_id)
Index('idx_daily_activity_user_date', DailyActivity.user_id, DailyActivity.activity_date)
