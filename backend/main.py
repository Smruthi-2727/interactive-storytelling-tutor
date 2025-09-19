from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Local imports
from database_config import get_db, create_tables
from database_models import User, Story, UserSession, Assessment, UserProgress
from pydantic_schemas import (
    UserCreate, UserLogin, User as UserSchema, Token,
    Story as StorySchema, StoryList, SessionCreate, SessionChoice,
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

# Create FastAPI app
app = FastAPI(
    title="Interactive Storytelling Tutor API",
    description="API for AI-driven personal development and education platform with Gemini AI Support",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Startup event
@app.on_event("startup")
async def startup_event():
    create_tables()
    print("🚀 Interactive Storytelling Tutor API started successfully!")
    if CHAT_SERVICE_AVAILABLE:
        print(f"💬 Chat service is available! (Mode: {CHAT_MODE})")
    else:
        print("⚠️ Chat service is not available. Check services/chat_service_gemini.py")

# Health check
@app.get("/", response_model=MessageResponse)
async def root():
    return {"message": "Interactive Storytelling Tutor API with Gemini AI is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "chat_service": CHAT_SERVICE_AVAILABLE,
        "chat_mode": CHAT_MODE
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
        # Enhanced debug logging to find the exact issue
        logger.info(f"📨 Received chat message:")
        logger.info(f"  - Message: '{chat_message.message}'")
        logger.info(f"  - User ID: '{chat_message.user_id}'")
        logger.info(f"  - Context type: {type(chat_message.context)}")
        logger.info(f"  - Context value: {chat_message.context}")
        
        # Multiple safety checks for context
        if chat_message.context is None:
            logger.info("⚠️ Context was None, setting to empty dict")
            context = {}
        elif not isinstance(chat_message.context, dict):
            logger.info(f"⚠️ Context was not a dict (type: {type(chat_message.context)}), converting to empty dict")
            context = {}
        else:
            context = chat_message.context.copy()  # Make a copy to be safe
            logger.info(f"✅ Context is valid dict: {context}")
        
        logger.info(f"🔄 Calling tutor service with:")
        logger.info(f"  - user_message: '{chat_message.message}'")
        logger.info(f"  - user_id: '{chat_message.user_id}'")
        logger.info(f"  - context: {context}")
        
        # Call the tutor service
        response_data = await tutor_chat_service.get_tutor_response(
            user_message=chat_message.message,
            user_id=chat_message.user_id,
            context=context
        )
        
        logger.info(f"✅ Successfully got response from tutor service")
        logger.info(f"Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        # Enhanced error logging with full stack trace
        logger.error(f"❌ Chat endpoint error: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        
        # Return a helpful error response instead of generic 500
        return ChatResponse(
            response=f"I apologize, but I encountered an error processing your request. Error details: {str(e)}. Please try asking your question again in a different way.",
            suggestions=["Try asking about story themes", "Ask about character motivations", "Request help with lessons"],
            user_id=chat_message.user_id,
            timestamp=datetime.now().isoformat()
        )

@app.websocket("/ws/chat/{user_id}")
async def websocket_chat_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time chat"""
    if not CHAT_SERVICE_AVAILABLE:
        await websocket.close(code=1011, reason="Chat service not available")
        return
    
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "error": "Invalid JSON format",
                    "timestamp": datetime.now().isoformat()
                }))
                continue
            
            # Process with AI tutor
            response_data = await tutor_chat_service.get_tutor_response(
                user_message=message_data.get("message", ""),
                user_id=user_id,
                context=message_data.get("context", {})
            )
            
            # Send response back to client
            await websocket.send_text(json.dumps(response_data))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logging.error(f"WebSocket error for user {user_id}: {str(e)}")
        manager.disconnect(user_id)

@app.post("/api/chat/clear/{user_id}")
async def clear_chat_history(user_id: str):
    """Clear conversation history for a user"""
    if not CHAT_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service not available")
    
    result = tutor_chat_service.clear_conversation_history(user_id)
    return {"message": "Chat history cleared successfully", "cleared": result}

@app.get("/api/chat/suggestions")
async def get_chat_suggestions():
    """Get general chat suggestions for users"""
    suggestions = [
        "Can you help me understand this story? 📖",
        "What's the main lesson in this chapter? 💡",
        "Explain this character's motivation 🤔",
        "How should I approach this assessment? 📝",
        "What does this vocabulary word mean? 📚",
        "Can you give me a story summary? 📋",
        "Help me with comprehension questions 🤓"
    ]
    return {"suggestions": suggestions, "chat_mode": CHAT_MODE}

@app.get("/api/chat/context/{story_id}")
async def get_chat_context(story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get story context for chat"""
    story = db.query(Story).filter(Story.id == story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Get user progress for this story
    user_session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.story_id == story_id
    ).order_by(UserSession.started_at.desc()).first()
    
    progress_data = {
        "level": "Beginner",
        "completion_percentage": 0
    }
    
    if user_session:
        total_scenes = len(story.content) if story.content else 1
        progress_data["completion_percentage"] = int((user_session.current_scene_id / total_scenes) * 100)
        if progress_data["completion_percentage"] > 50:
            progress_data["level"] = "Intermediate"
        if progress_data["completion_percentage"] > 80:
            progress_data["level"] = "Advanced"
    
    return {
        "currentStory": {
            "id": story.id,
            "title": story.title,
            "theme": story.theme,
            "description": story.description,
            "difficulty_level": story.difficulty_level
        },
        "userProgress": progress_data,
        "chat_mode": CHAT_MODE
    }

@app.get("/api/chat/status")
async def get_chat_status():
    """Get current chat service status"""
    if CHAT_SERVICE_AVAILABLE and hasattr(tutor_chat_service, 'health_check'):
        try:
            health_data = tutor_chat_service.health_check()
            return health_data
        except Exception as e:
            return {
                "status": "error",
                "chat_mode": CHAT_MODE,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    else:
        return {
            "status": "unavailable" if not CHAT_SERVICE_AVAILABLE else "unknown",
            "chat_mode": CHAT_MODE,
            "timestamp": datetime.now().isoformat()
        }

# ===============================
# AUTHENTICATION ENDPOINTS
# ===============================

@app.post("/auth/signup", response_model=UserSchema)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    # Create new user
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

@app.post("/auth/register")
async def register(user_data: dict, db: Session = Depends(get_db)):
    """Simple registration endpoint for frontend compatibility"""
    try:
        # Validate required fields
        required_fields = ["username", "password", "email", "full_name"]
        for field in required_fields:
            if field not in user_data or not user_data[field]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{field} is required"
                )
        
        # Validate password length
        if len(user_data["password"]) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Create UserCreate object from dict
        user_create_data = UserCreate(
            username=user_data["username"],
            password=user_data["password"],
            email=user_data["email"],
            full_name=user_data["full_name"]
        )
        
        # Use your existing signup logic
        new_user = await signup(user_create_data, db)
        
        return {
            "message": "Registration successful",
            "user_id": new_user.id,
            "username": new_user.username
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===============================
# STORY ENDPOINTS
# ===============================

@app.get("/stories", response_model=List[StoryList])
async def get_stories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all available stories"""
    stories = db.query(Story).filter(Story.is_active == True).all()
    return stories

@app.get("/stories/{story_id}", response_model=StorySchema)
async def get_story(story_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific story by ID"""
    story = db.query(Story).filter(Story.id == story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

# ===============================
# SESSION ENDPOINTS
# ===============================

@app.post("/sessions", response_model=UserSessionSchema)
async def start_session(session_data: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Start a new story session"""
    # Check if story exists
    story = db.query(Story).filter(Story.id == session_data.story_id, Story.is_active == True).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    # Create new session
    db_session = UserSession(
        user_id=current_user.id,
        story_id=session_data.story_id,
        current_scene_id=1,
        choices_made=[]
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return db_session

@app.get("/sessions/{session_id}", response_model=UserSessionSchema)
async def get_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session

@app.post("/sessions/{session_id}/choice", response_model=UserSessionSchema)
async def make_choice(session_id: int, choice: SessionChoice, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Make a choice in a story session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.is_completed:
        raise HTTPException(status_code=400, detail="Session already completed")

    # Get the story to validate choice and determine next scene
    story = db.query(Story).filter(Story.id == session.story_id).first()

    # Update session with choice
    choices_made = session.choices_made or []
    choices_made.append({
        "scene_id": choice.scene_id,
        "choice_id": choice.choice_id,
        "timestamp": datetime.utcnow().isoformat()
    })

    session.choices_made = choices_made

    # Move to next scene or complete session
    if choice.scene_id < len(story.content):
        session.current_scene_id = choice.scene_id + 1
    else:
        session.is_completed = True
        session.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(session)

    return session

# ===============================
# ASSESSMENT ENDPOINTS
# ===============================

@app.post("/assessments", response_model=AssessmentSchema)
async def submit_assessment(assessment_data: AssessmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Submit an assessment answer"""
    # Get the session to validate
    session = db.query(UserSession).filter(
        UserSession.id == assessment_data.session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get the story and question
    story = db.query(Story).filter(Story.id == session.story_id).first()

    # Find the specific question
    question = None
    for q in story.comprehension_questions:
        if q["id"] == assessment_data.question_id:
            question = q
            break

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Generate AI feedback
    correct_answer = question.get("correct_answer") if question["type"] == "multiple_choice" else None
    feedback_data = ai_service.generate_comprehension_feedback(question, assessment_data.user_answer, correct_answer)

    # Create assessment record
    db_assessment = Assessment(
        user_id=current_user.id,
        session_id=assessment_data.session_id,
        question_id=assessment_data.question_id,
        question_type=assessment_data.question_type,
        user_answer=assessment_data.user_answer,
        is_correct=feedback_data.get("is_correct"),
        score=feedback_data.get("score"),
        ai_feedback=feedback_data.get("feedback")
    )

    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    return db_assessment

@app.get("/sessions/{session_id}/assessments", response_model=List[AssessmentSchema])
async def get_session_assessments(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all assessments for a session"""
    assessments = db.query(Assessment).filter(
        Assessment.session_id == session_id,
        Assessment.user_id == current_user.id
    ).all()

    return assessments

# ===============================
# DASHBOARD ENDPOINTS
# ===============================

@app.get("/dashboard", response_model=DashboardData)
async def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get user dashboard data"""
    # Get user stats
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

    # Calculate statistics
    total_sessions = db.query(UserSession).filter(UserSession.user_id == current_user.id).count()
    completed_sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_completed == True
    ).count()

    # Calculate average score
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()
    if assessments:
        scores = [a.score for a in assessments if a.score is not None]
        avg_score = sum(scores) / len(scores) if scores else 0.0
    else:
        avg_score = 0.0

    # Update progress
    progress.total_sessions = total_sessions
    progress.stories_completed = completed_sessions
    progress.average_score = avg_score
    progress.last_activity = datetime.utcnow()
    db.commit()

    stats = UserStats(
        total_sessions=total_sessions,
        stories_completed=completed_sessions,
        average_score=avg_score,
        favorite_categories=progress.favorite_categories or [],
        recent_activity=[
            {
                "type": "session_completed" if s.is_completed else "session_started",
                "story_title": db.query(Story).filter(Story.id == s.story_id).first().title,
                "timestamp": s.started_at.isoformat()
            }
            for s in recent_sessions[:3]
        ]
    )

    return DashboardData(
        user=current_user,
        stats=stats,
        recent_sessions=recent_sessions
    )

# ===============================
# ADMIN ENDPOINTS
# ===============================

@app.get("/admin/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    """Get overall platform statistics (simplified for MVP)"""
    total_users = db.query(User).count()
    total_sessions = db.query(UserSession).count()
    completed_sessions = db.query(UserSession).filter(UserSession.is_completed == True).count()

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "completion_rate": completed_sessions / total_sessions if total_sessions > 0 else 0,
        "chat_service_status": "available" if CHAT_SERVICE_AVAILABLE else "unavailable",
        "chat_mode": CHAT_MODE,
        "timestamp": datetime.utcnow()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)


