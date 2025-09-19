import google.generativeai as genai
import os
from typing import Dict, Any, List
from datetime import datetime
import logging
from dotenv import load_dotenv
import asyncio

load_dotenv()
logger = logging.getLogger(__name__)

class TutorChatService:
    def __init__(self):
        """Initialize Gemini-powered educational chat service with timeout protection"""
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("Gemini API key is required. Please set GEMINI_API_KEY in your .env file")
        
        # Configure Gemini
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("🤖 Gemini AI TutorChatService initialized successfully!")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {str(e)}")
            raise
        
        self.conversation_history = {}
        
    async def get_tutor_response(
        self, 
        user_message: str, 
        user_id: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate educational response using Gemini AI with timeout protection"""
        if context is None:
            context = {}
            
        try:
            # Validate input
            if not user_message or not user_message.strip():
                return self._create_success_response(
                    "Please ask me a question about the story or your learning! 📚",
                    user_id,
                    context
                )
            
            # Build educational prompt
            system_prompt = self._build_educational_prompt(context)
            full_prompt = f"{system_prompt}\n\nStudent Question: {user_message}\n\nAI Tutor Response:"
            
            # Get Gemini response with timeout protection
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.model.generate_content,
                        full_prompt,
                        generation_config=genai.types.GenerationConfig(
                            max_output_tokens=250,
                            temperature=0.7,
                        )
                    ),
                    timeout=10.0  # 10 second timeout
                )
                
                ai_response = response.text.strip()
                
            except asyncio.TimeoutError:
                logger.warning(f"Gemini API timeout for user {user_id}")
                return self._create_fallback_response(user_message, user_id, context)
            except Exception as api_error:
                logger.error(f"Gemini API error for user {user_id}: {str(api_error)}")
                return self._create_fallback_response(user_message, user_id, context)
            
            # Track conversation
            if user_id not in self.conversation_history:
                self.conversation_history[user_id] = []
                
            self.conversation_history[user_id].append({
                "user": user_message,
                "assistant": ai_response,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "response": ai_response,
                "suggestions": self._generate_suggestions(context, user_message),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
                "mode": "gemini_ai"
            }
            
        except Exception as e:
            logger.error(f"Gemini service error for user {user_id}: {str(e)}")
            return self._create_fallback_response(user_message, user_id, context)
    
    def _create_fallback_response(
        self, user_message: str, user_id: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create intelligent fallback response when Gemini fails"""
        story = context.get('currentStory', {})
        story_title = story.get('title', 'this story')
        
        message_lower = user_message.lower()
        
        # Intelligent fallback based on message content
        if any(word in message_lower for word in ['hello', 'hi', 'hey']):
            response = f"Hello! 👋 I'm your AI tutor, excited to explore '{story_title}' with you! What would you like to discover about this fascinating story?"
        elif any(word in message_lower for word in ['friend', 'friendship']):
            response = f"Friendship is a beautiful theme in '{story_title}'! 🤝 This story shows us how true friends support each other through challenges. What aspect of friendship in this story interests you most?"
        elif any(word in message_lower for word in ['character']):
            response = f"Great question about characters! 🎭 In '{story_title}', each character has unique qualities and growth. Characters teach us about human nature and how we can develop ourselves. Which character would you like to explore?"
        elif any(word in message_lower for word in ['lesson', 'moral', 'learn']):
            response = f"Every great story has valuable lessons! 💡 '{story_title}' teaches us important truths about life, relationships, and personal growth. What lesson from this story resonates with you?"
        else:
            response = f"That's a thoughtful question about '{story_title}'! 💭 I'm here to help you explore the deeper meanings, characters, and lessons in this story. Can you tell me more about what specifically interests you?"
        
        return {
            "response": response,
            "suggestions": self._generate_suggestions(context, user_message),
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "mode": "gemini_ai_fallback"
        }
    
    def _create_success_response(
        self, message: str, user_id: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create success response"""
        return {
            "response": message,
            "suggestions": self._generate_suggestions(context, ""),
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "mode": "gemini_ai"
        }
    
    def _build_educational_prompt(self, context: Dict[str, Any]) -> str:
        """Build educational prompt for Gemini"""
        story = context.get('currentStory', {})
        story_title = story.get('title', 'General Learning')
        story_theme = story.get('theme', 'General')
        user_level = context.get('userProgress', {}).get('level', 'Beginner')
        completion = context.get('userProgress', {}).get('completion_percentage', 0)
        
        return f"""You are an AI tutor for an Interactive Storytelling educational platform. Be encouraging, educational, and engaging.

CONTEXT:
- Story: {story_title}
- Theme: {story_theme} 
- Student Level: {user_level}
- Progress: {completion}%

GUIDELINES:
1. Be a friendly, supportive teacher 😊
2. Give clear, age-appropriate explanations
3. Ask follow-up questions to check understanding
4. Use examples from the story when relevant
5. Keep responses under 150 words
6. Encourage critical thinking
7. Make learning fun and engaging
8. Focus on character development, themes, and life lessons

Response should be educational, encouraging, and directly answer the student's question."""
    
    def _generate_suggestions(self, context: Dict[str, Any], user_message: str) -> List[str]:
        """Generate smart suggestions"""
        story = context.get('currentStory', {})
        story_title = story.get('title', 'this story')
        
        return [
            f"What's your favorite part of {story_title}? ⭐",
            "How do the characters grow and change? 🌱",
            "What life lesson speaks to you most? 💡"
        ]
    
    def clear_conversation_history(self, user_id: str) -> bool:
        """Clear conversation history"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
            return True
        return False
    
    def health_check(self) -> Dict[str, Any]:
        """Health check with timeout protection"""
        try:
            # Quick test with timeout
            asyncio.wait_for(
                asyncio.to_thread(
                    self.model.generate_content, "Hello"
                ),
                timeout=5.0
            )
            return {
                "status": "healthy",
                "mode": "gemini_ai",
                "model": "gemini-1.5-flash",
                "message": "Gemini AI ready for tutoring! 🚀",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "degraded",
                "mode": "gemini_ai_fallback",
                "error": str(e),
                "message": "Gemini AI with fallback protection active",
                "timestamp": datetime.now().isoformat()
            }

# Create singleton instance
try:
    tutor_chat_service = TutorChatService()
    logger.info("✅ Gemini TutorChatService created successfully")
except Exception as e:
    logger.error(f"Failed to create Gemini TutorChatService: {str(e)}")
    tutor_chat_service = None


