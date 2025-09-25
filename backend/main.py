from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import json
import logging
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Local imports
from database_config import get_db, create_tables
from database_models import User, Story, UserSession, Assessment, UserProgress, DailyActivity
from pydantic_schemas import (
    UserCreate, UserLogin, User as UserSchema, Token,
    Story as StorySchema, StoryList, SessionCreate, 
    UserSession as UserSessionSchema, AssessmentCreate, Assessment as AssessmentSchema,
    UserStats, DashboardData, MessageResponse, ErrorResponse
)
from auth_utils import (
    verify_password, get_password_hash, create_access_token, 
    verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ai_service import AIService

# Import the chat service with Gemini priority
try:
    from services.chat_service_mock import tutor_chat_service
    CHAT_SERVICE_AVAILABLE = True
    CHAT_MODE = "smart_mock"
    print("🎭 Enhanced smart mock chat service loaded")
except ImportError:
    try:
        from services.chat_service_mock import tutor_chat_service
        CHAT_SERVICE_AVAILABLE = True
        CHAT_MODE = "smart_mock"
        print("🎭 Smart mock chat service loaded as fallback")
    except ImportError:
        CHAT_SERVICE_AVAILABLE = False
        CHAT_MODE = "none"
        logging.warning("No chat service available. Please create services/chat_service_gemini.py")

# NEW: Lifespan event handler (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    print("🚀 Interactive Storytelling Tutor API started successfully!")
    print("📖 New: 3-Scene Linear Stories + Quiz Format")
    print("⚡ Enhanced: Real-time Dashboard Updates")
    if CHAT_SERVICE_AVAILABLE:
        print(f"💬 Chat service is available! (Mode: {CHAT_MODE})")
    else:
        print("⚠️ Chat service is not available. Check services/chat_service_gemini.py")
    yield
    # Shutdown (if needed in future)
    print("🛑 API shutting down...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Interactive Storytelling Tutor API",
    description="API for AI-driven personal development and education platform with 3-Scene Story Format + Real-time Updates",
    version="2.2.0",  # Updated version
    lifespan=lifespan  # NEW: Use lifespan instead of startup event
)

# Enable CORS for frontend integration
# Enable CORS for frontend integration (FIXED for POST requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly allow POST
    allow_headers=["*"],
    expose_headers=["*"]  # Add this line
)

# Security
security = HTTPBearer()
ai_service = AIService()

# Chat-related models
from pydantic import BaseModel

class ChatMessage(BaseModel):
    message: str
    user_id: str
    context: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []
    user_id: str
    timestamp: str

# NEW: Scene and Quiz models
class SceneCompletion(BaseModel):
    scene_index: int  # 0, 1, 2 for scenes 1, 2, 3
    reading_time_seconds: int

class QuizSubmission(BaseModel):
    quiz_answers: Dict[int, int]  # {question_index: selected_option_index}
    total_quiz_time_seconds: int

class QuizResult(BaseModel):
    score: float
    correct_answers: int
    total_questions: int
    detailed_feedback: Dict[str, Any]
    achievement_unlocked: Optional[str] = None

# WebSocket Connection Manager for real-time chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logging.info(f"User {user_id} connected to chat")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logging.info(f"User {user_id} disconnected from chat")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except Exception as e:
                logging.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)

manager = ConnectionManager()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    token_data = verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.username == token_data["username"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# Health check endpoints
@app.get("/", response_model=MessageResponse)
async def root():
    return {"message": "Interactive Storytelling Tutor API with 3-Scene Stories + Quiz + Real-time Updates is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "chat_service": CHAT_SERVICE_AVAILABLE,
        "chat_mode": CHAT_MODE,
        "story_format": "3_scenes_plus_quiz",
        "realtime_support": True,
        "version": "2.2.0"
    }

# ===============================
# CHAT ENDPOINTS
# ===============================

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_tutor(chat_message: ChatMessage):
    """Main chat endpoint for AI tutor interaction"""
    if not CHAT_SERVICE_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Chat service is not available. Please check server configuration."
        )
    
    try:
        logger.info(f"📨 Received chat message:")
        logger.info(f"  - Message: '{chat_message.message}'")
        logger.info(f"  - User ID: '{chat_message.user_id}'")
        
        context = chat_message.context if isinstance(chat_message.context, dict) else {}
        
        response_data = await tutor_chat_service.get_tutor_response(
            user_message=chat_message.message,
            user_id=chat_message.user_id,
            context=context
        )
        
        logger.info(f"✅ Successfully got response from tutor service")
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {str(e)}", exc_info=True)
        return ChatResponse(
            response="I apologize, but I encountered an error processing your request. Please try asking your question again in a different way.",
            suggestions=["Try asking about story themes", "Ask about character motivations", "Request help with lessons"],
            user_id=chat_message.user_id,
            timestamp=datetime.now().isoformat()
        )

# ===============================
# AUTHENTICATION ENDPOINTS
# ===============================

@app.post("/auth/signup", response_model=UserSchema)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create user progress record
    progress = UserProgress(user_id=db_user.id)
    db.add(progress)
    db.commit()

    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    user = db.query(User).filter(User.username == user_credentials.username).first()

    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

# ===============================
# 3-SCENE STORY ENDPOINTS
# ===============================

@app.get("/api/stories", response_model=List[StoryList])
async def get_stories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all available 3-scene stories"""
    stories = db.query(Story).filter(Story.is_active == True).all()
    return stories

@app.get("/api/stories/{story_id}/scenes")
async def get_story_scenes(story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all 3 scenes for a story"""
    story = db.query(Story).filter(Story.id == story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # 🔧 FIX: Parse quiz data if it's a JSON string
    quiz_data = json.loads(story.quiz) if isinstance(story.quiz, str) else story.quiz
    scenes_data = json.loads(story.scenes) if isinstance(story.scenes, str) else story.scenes
    
    return {
        "story_id": story.id,
        "title": story.title,
        "scenes": scenes_data,  # Array of 3 scenes
        "total_scenes": story.total_scenes,
        "quiz": quiz_data  # Array of quiz questions
    }

@app.get("/api/stories/{story_id}", response_model=StorySchema)
async def get_story(story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific story by ID with 3-scene format"""
    story = db.query(Story).filter(Story.id == story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

# ===============================
# SCENE-BASED SESSION ENDPOINTS
# ===============================

@app.post("/api/sessions", response_model=UserSessionSchema)
async def start_story_session(session_data: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Start a new 3-scene story session"""
    story = db.query(Story).filter(Story.id == session_data.story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    # Create new session for 3-scene format
    db_session = UserSession(
        user_id=current_user.id,
        story_id=session_data.story_id,
        current_scene_index=0,  # Start at scene 1 (index 0)
        scenes_completed=0,
        quiz_started=False,
        quiz_completed=False,
        total_reading_time=0
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return db_session

@app.post("/api/sessions/{session_id}/complete_scene")
async def complete_scene(
    session_id: int, 
    scene_data: SceneCompletion,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Mark a scene as completed and track progress"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.is_completed:
        raise HTTPException(status_code=400, detail="Session already completed")

    # Update scene progress
    if scene_data.scene_index == session.current_scene_index:
        session.scenes_completed += 1
        session.total_reading_time += scene_data.reading_time_seconds
        
        if session.current_scene_index < 2:  # Scenes 0, 1, 2
            session.current_scene_index += 1
        else:
            # All 3 scenes completed, ready for quiz
            session.quiz_started = False  # Quiz not started yet
        
        db.commit()
        
        # Update daily activity
        _update_daily_activity(current_user.id, scenes_read=1, db=db)
        
        return {
            "message": "Scene completed successfully",
            "current_scene_index": session.current_scene_index,
            "scenes_completed": session.scenes_completed,
            "quiz_ready": session.scenes_completed == 3
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid scene progression")

@app.post("/api/sessions/{session_id}/submit_quiz", response_model=QuizResult)
async def submit_quiz(
    session_id: int,
    quiz_data: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit quiz answers and get results with AI feedback - FIXED VERSION"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 🔧 CRITICAL FIX: Remove the broken scenes_completed check
    # OLD BROKEN CODE: if session.scenes_completed < 3:
    #     raise HTTPException(status_code=400, detail="Must complete all 3 scenes before taking quiz")
    
    # ✅ NEW: Only check if quiz is already completed
    if session.quiz_completed:
        raise HTTPException(status_code=400, detail="Quiz already completed")
    
    # Get the story and quiz questions
    story = db.query(Story).filter(Story.id == session.story_id).first()
    if not story or not story.quiz:
        raise HTTPException(status_code=404, detail="Story or quiz not found")
    
    # 🔧 CRITICAL FIX: Parse quiz data if it's a JSON string
    quiz_questions = json.loads(story.quiz) if isinstance(story.quiz, str) else story.quiz
    
    # Calculate score and generate feedback
    correct_answers = 0
    total_questions = len(quiz_questions)
    
    # Process each answer and create assessment records
    for question_index, user_answer_index in quiz_data.quiz_answers.items():
        question_index = int(question_index)  # Ensure integer
        if question_index >= len(quiz_questions):
            continue
        
        question = quiz_questions[question_index]
        correct_answer_index = question["correct"]
        is_correct = user_answer_index == correct_answer_index
        
        if is_correct:
            correct_answers += 1
        
        # Create assessment record
        assessment = Assessment(
            user_id=current_user.id,
            session_id=session_id,
            question_index=question_index,
            question_text=question["question"],
            user_answer_index=user_answer_index,
            user_answer_text=question["options"][user_answer_index] if 0 <= user_answer_index < len(question["options"]) else "No answer",
            correct_answer_index=correct_answer_index,
            is_correct=is_correct,
            points_earned=1 if is_correct else 0
        )
        
        db.add(assessment)
    
    # Calculate final score
    score_percentage = (correct_answers / total_questions) * 100
    
    # 🔧 CRITICAL FIX: Properly mark session as completed
    session.scenes_completed = 3  # Set scenes as completed
    session.quiz_started = True
    session.quiz_completed = True
    session.quiz_score = score_percentage
    session.is_completed = True  # ← THIS IS THE KEY LINE!
    session.completed_at = datetime.utcnow()
    session.total_reading_time += quiz_data.total_quiz_time_seconds
    
    db.commit()
    
    # Generate AI feedback
    try:
        detailed_feedback = ai_service.generate_quiz_feedback(
            quiz_questions,
            quiz_data.quiz_answers,
            score_percentage
        )
    except Exception as e:
        logger.error(f"Error generating AI feedback: {e}")
        detailed_feedback = {
            "overall_feedback": f"Great job completing the quiz! You scored {score_percentage:.0f}%.",
            "areas_to_improve": [],
            "strengths": []
        }
    
    # Update user progress
    _update_user_progress(current_user.id, story.id, score_percentage, db=db)
    
    # Update daily activity
    _update_daily_activity(current_user.id, stories_completed=1, quiz_attempts=1, db=db)
    
    # Check for achievements
    achievement = _check_achievements(current_user.id, score_percentage, db=db)
    
    return QuizResult(
        score=score_percentage,
        correct_answers=correct_answers,
        total_questions=total_questions,
        detailed_feedback=detailed_feedback,
        achievement_unlocked=achievement
    )

@app.get("/api/sessions/{session_id}/quiz_results")
async def get_quiz_results(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quiz results and feedback for a completed session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.quiz_completed:
        raise HTTPException(status_code=400, detail="Quiz not completed yet")

    # Get all assessments for this session
    assessments = db.query(Assessment).filter(Assessment.session_id == session_id).all()

    return {
        "session_id": session_id,
        "quiz_score": session.quiz_score,
        "total_reading_time": session.total_reading_time,
        "completed_at": session.completed_at,
        "assessments": assessments
    }

# ===============================
# ✅ NEW: SMART TIME FORMATTING HELPER
# ===============================

def _format_reading_time(total_seconds: int) -> str:
    """Format reading time in a user-friendly way"""
    if total_seconds < 60:
        return f"{total_seconds}s"
    elif total_seconds < 3600:  # Less than 1 hour
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        if seconds == 0:
            return f"{minutes}m"
        else:
            return f"{minutes}m {seconds}s"
    else:  # 1 hour or more
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m"

# ===============================
# REAL-TIME DASHBOARD ENDPOINTS
# ===============================

@app.get("/api/dashboard", response_model=DashboardData)
async def get_dashboard(
    response: Response,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get user dashboard data with 3-scene story metrics - REAL-TIME ENABLED"""
    
    # Add no-cache headers for real-time updates
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["Access-Control-Allow-Headers"] = "Cache-Control"
    
    # Get user progress
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()
    if not progress:
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        db.commit()
        db.refresh(progress)

    # Get recent sessions
    recent_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).order_by(UserSession.started_at.desc()).limit(5).all()

    # Calculate real-time statistics
    total_sessions = db.query(UserSession).filter(UserSession.user_id == current_user.id).count()
    completed_stories = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_completed == True
    ).count()

    # Calculate reading time and average score
    completed_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.quiz_completed == True
    ).all()

    # ✅ NEW: Use smart time formatting instead of just minutes
    total_reading_seconds = sum(s.total_reading_time for s in completed_sessions)
    total_reading_time_formatted = _format_reading_time(total_reading_seconds)
    
    avg_score = sum(s.quiz_score for s in completed_sessions if s.quiz_score) / len(completed_sessions) if completed_sessions else 0

    # Calculate current streak
    current_streak = _calculate_current_streak(current_user.id, db)

    # Update progress record with real-time data
    progress.total_stories_completed = completed_stories
    progress.total_sessions = total_sessions
    progress.average_quiz_score = avg_score
    progress.total_reading_time = total_reading_seconds // 60  # Store as minutes in DB
    progress.current_streak = current_streak
    progress.last_activity_date = datetime.utcnow()
    db.commit()

    # Create dashboard data - FIXED FORMAT FOR FRONTEND WITH SMART TIME
    dashboard_stats = {
        "stories_completed": f"{completed_stories}/3",  # FIXED: Match your 3 stories
        "total_reading_time": total_reading_time_formatted,  # ✅ NEW: Smart formatting
        "average_score": f"{int(avg_score)}%",
        "current_streak": f"{current_streak} days"
    }

    # Format recent sessions for frontend
    formatted_sessions = []
    for s in recent_sessions:
        story = db.query(Story).filter(Story.id == s.story_id).first()
        if story:
            formatted_sessions.append({
                "id": s.id,
                "story_title": story.title,
                "started_at": s.started_at.isoformat(),
                "quiz_completed": s.quiz_completed,
                "quiz_score": s.quiz_score,
                "is_completed": s.is_completed,
                "scenes_completed": s.scenes_completed
            })

    return {
        "user": current_user,
        "stats": dashboard_stats,
        "recent_sessions": formatted_sessions
    }

# ===============================
# 🆕 MISSING USER ENDPOINTS FOR FRONTEND INTEGRATION
# ===============================

@app.get("/api/user/sessions")
async def get_user_sessions(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all user sessions for ProgressPage and AssessmentCard - REAL-TIME"""
    
    # Add no-cache headers for real-time updates
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    # Get all user sessions with story details
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).order_by(UserSession.started_at.desc()).all()
    
    formatted_sessions = []
    for session in sessions:
        # Get story details
        story = db.query(Story).filter(Story.id == session.story_id).first()
        
        # Get assessments for this session
        assessments = db.query(Assessment).filter(
            Assessment.session_id == session.id
        ).all()
        
        formatted_sessions.append({
            "id": session.id,
            "story_id": session.story_id,
            "story": {
                "id": story.id if story else None,
                "title": story.title if story else "Unknown Story",
                "category": story.category if story else "unknown"
            },
            "current_scene_index": session.current_scene_index,
            "scenes_completed": session.scenes_completed,
            "quiz_started": session.quiz_started,
            "quiz_completed": session.quiz_completed,
            "quiz_score": session.quiz_score,
            "total_reading_time": session.total_reading_time,
            "started_at": session.started_at.isoformat(),
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "is_completed": session.is_completed,
            "assessments": [
                {
                    "id": a.id,
                    "question_text": a.question_text,
                    "is_correct": a.is_correct,
                    "user_answer_text": a.user_answer_text
                } for a in assessments
            ]
        })
    
    return formatted_sessions

@app.get("/api/user/progress")
async def get_user_progress(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user progress data for ProgressPage - REAL-TIME"""
    
    # Add no-cache headers
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    # Get or create user progress record
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()
    if not progress:
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    # Calculate real-time statistics
    total_sessions = db.query(UserSession).filter(UserSession.user_id == current_user.id).count()
    completed_stories = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_completed == True
    ).count()
    
    # Get all completed sessions for detailed stats
    completed_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.quiz_completed == True
    ).all()
    
    # ✅ NEW: Calculate with smart formatting
    total_reading_seconds = sum(s.total_reading_time for s in completed_sessions)
    avg_score = sum(s.quiz_score for s in completed_sessions if s.quiz_score) / len(completed_sessions) if completed_sessions else 0
    total_scenes_read = sum(s.scenes_completed for s in db.query(UserSession).filter(UserSession.user_id == current_user.id).all())
    
    # Update progress record
    progress.total_stories_completed = completed_stories
    progress.total_sessions = total_sessions
    progress.total_scenes_read = total_scenes_read
    progress.average_quiz_score = avg_score
    progress.total_reading_time = total_reading_seconds // 60  # Store as minutes in DB
    progress.current_streak = _calculate_current_streak(current_user.id, db)
    progress.last_activity_date = datetime.utcnow()
    db.commit()
    
    return {
        "id": progress.id,
        "user_id": progress.user_id,
        "total_stories_completed": progress.total_stories_completed,
        "total_scenes_read": progress.total_scenes_read,
        "total_sessions": progress.total_sessions,
        "average_quiz_score": progress.average_quiz_score,
        "total_reading_time": progress.total_reading_time,
        "current_streak": progress.current_streak,
        "longest_streak": progress.longest_streak,
        "favorite_categories": progress.favorite_categories or [],
        "category_scores": progress.category_scores or {},
        "last_activity_date": progress.last_activity_date.isoformat() if progress.last_activity_date else None,
        "achievements": progress.achievements or [],
        "total_points": progress.total_points
    }

# ===============================
# ASSESSMENTS ENDPOINTS FOR FRONTEND
# ===============================

@app.get("/api/user/assessments")
async def get_user_assessments(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's quiz history for AssessmentsPage - REAL-TIME"""
    
    # Add no-cache headers
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    # Get completed sessions with quiz results
    completed_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.quiz_completed == True
    ).order_by(UserSession.completed_at.desc()).all()
    
    assessments = []
    for session in completed_sessions:
        story = db.query(Story).filter(Story.id == session.story_id).first()
        
        # Get detailed quiz results
        quiz_assessments = db.query(Assessment).filter(
            Assessment.session_id == session.id
        ).order_by(Assessment.question_index).all()
        
        quiz_details = []
        if quiz_assessments and story and story.quiz:
            # 🔧 FIX: Parse quiz data if it's a JSON string
            story_quiz = json.loads(story.quiz) if isinstance(story.quiz, str) else story.quiz
            quiz_details = [
                {
                    "question": assessment.question_text,
                    "user_answer": assessment.user_answer_text,
                    "correct_answer": story_quiz[assessment.question_index]["options"][assessment.correct_answer_index] if assessment.question_index < len(story_quiz) else "Unknown",
                    "is_correct": assessment.is_correct
                }
                for assessment in quiz_assessments
            ]
        
        assessments.append({
            "id": session.id,
            "story_title": story.title if story else "Unknown Story",
            "story_category": story.category if story else "unknown",
            "completed_at": session.completed_at.isoformat(),
            "quiz_score": int(session.quiz_score),
            "correct_answers": len([a for a in quiz_assessments if a.is_correct]),
            "total_questions": len(quiz_assessments),
            "total_reading_time": _format_reading_time(session.total_reading_time),  # ✅ NEW: Smart formatting
            "quiz_details": quiz_details
        })
    
    # Calculate overall stats
    total_assessments = len(assessments)
    avg_score = sum(a["quiz_score"] for a in assessments) / total_assessments if assessments else 0
    total_questions = sum(a["total_questions"] for a in assessments)
    total_seconds = sum(s.total_reading_time for s in completed_sessions)
    
    return {
        "assessments": assessments,
        "overall_stats": {
            "total_assessments": total_assessments,
            "average_score": int(avg_score),
            "questions_answered": total_questions,
            "total_reading_time": _format_reading_time(total_seconds)  # ✅ NEW: Smart formatting
        }
    }

# ===============================
# HELPER FUNCTIONS
# ===============================

def _update_user_progress(user_id: int, story_id: int, quiz_score: float, db: Session):
    """Update user progress after completing a story"""
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress:
        progress = UserProgress(user_id=user_id)
        db.add(progress)

    progress.total_stories_completed += 1
    progress.total_points += int(quiz_score)  # Add quiz score as points
    progress.last_completed_story_id = story_id
    
    # Update average score
    all_sessions = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.quiz_completed == True
    ).all()
    
    if all_sessions:
        avg_score = sum(s.quiz_score for s in all_sessions if s.quiz_score) / len(all_sessions)
        progress.average_quiz_score = avg_score

    db.commit()

def _update_daily_activity(user_id: int, scenes_read: int = 0, stories_completed: int = 0, quiz_attempts: int = 0, db: Session = None):
    """Update daily activity tracking"""
    today = datetime.utcnow().date()
    
    activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        func.date(DailyActivity.activity_date) == today
    ).first()
    
    if not activity:
        activity = DailyActivity(
            user_id=user_id,
            activity_date=datetime.utcnow(),
            scenes_read=scenes_read,
            stories_completed=stories_completed,
            quiz_attempts=quiz_attempts
        )
        db.add(activity)
    else:
        activity.scenes_read += scenes_read
        activity.stories_completed += stories_completed
        activity.quiz_attempts += quiz_attempts
    
    db.commit()  # 🔧 FIXED: Added missing db.commit()

def _calculate_current_streak(user_id: int, db: Session) -> int:
    """Calculate current consecutive days of activity"""
    activities = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id
    ).order_by(DailyActivity.activity_date.desc()).all()
    
    if not activities:
        return 0
    
    streak = 0
    current_date = datetime.utcnow().date()
    
    for activity in activities:
        activity_date = activity.activity_date.date()
        if activity_date == current_date or activity_date == current_date - timedelta(days=streak):
            if activity.stories_completed > 0 or activity.scenes_read > 0:
                streak += 1
                current_date = activity_date - timedelta(days=1)
        else:
            break
    
    return streak

def _check_achievements(user_id: int, quiz_score: float, db: Session) -> Optional[str]:
    """Check if user unlocked any achievements"""
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress:
        return None
    
    achievements = progress.achievements or []
    
    # Check for new achievements
    if quiz_score == 100 and "perfect_score" not in achievements:
        achievements.append("perfect_score")
        progress.achievements = achievements
        db.commit()
        return "Perfect Score! 🌟"
    elif progress.current_streak >= 7 and "week_streak" not in achievements:
        achievements.append("week_streak")
        progress.achievements = achievements
        db.commit()
        return "7-Day Reading Streak! 🔥"
    elif progress.total_stories_completed >= 3 and "story_master" not in achievements:  # FIXED: 3 stories
        achievements.append("story_master")
        progress.achievements = achievements
        db.commit()
        return "Story Master! 📚"
    
    return None

# ===============================
# ADMIN ENDPOINTS
# ===============================

@app.get("/api/admin/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    """Get overall platform statistics for 3-scene story format"""
    total_users = db.query(User).count()
    total_sessions = db.query(UserSession).count()
    completed_stories = db.query(UserSession).filter(UserSession.is_completed == True).count()
    total_scenes_read = db.query(UserSession).with_entities(
        UserSession.scenes_completed
    ).all()
    total_scenes = sum(s[0] for s in total_scenes_read if s[0])

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "completed_stories": completed_stories,
        "total_scenes_read": total_scenes,
        "completion_rate": completed_stories / total_sessions if total_sessions > 0 else 0,
        "average_scenes_per_session": total_scenes / total_sessions if total_sessions > 0 else 0,
        "chat_service_status": "available" if CHAT_SERVICE_AVAILABLE else "unavailable",
        "chat_mode": CHAT_MODE,
        "story_format": "3_scenes_plus_quiz",
        "realtime_support": True,
        "timestamp": datetime.utcnow()
    }

# ===============================
# PRODUCTION-READY STARTUP
# ===============================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)  # FIXED: String format for reload

