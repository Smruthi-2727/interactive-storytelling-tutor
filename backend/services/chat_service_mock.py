import os
from typing import Dict, Any, List
from datetime import datetime
import logging
import random
import re

logger = logging.getLogger(__name__)

class TutorChatService:
    def __init__(self):
        """Initialize comprehensive AI-like mock chat service with 4 stories"""
        self.conversation_history = {}
        self.story_database = self._build_story_database()
        logger.info("🎭 Advanced AI-like Mock TutorChatService initialized with 4 stories!")
        
    def _build_story_database(self):
        """Comprehensive story knowledge database with 4 complete stories"""
        return {
            "The Lion and the Mouse": {
                "full_story": "Once upon a time, a tiny mouse ran over a sleeping lion's face and woke him up. The lion was angry and caught the mouse in his huge paw. 'Please don't eat me!' squeaked the mouse. 'I'm sorry I woke you. If you let me go, I promise to help you someday!' The lion laughed at such a small creature offering help, but he was feeling kind that day and let the mouse go. Weeks later, the lion was caught in a hunter's net. He roared and struggled but couldn't escape. The little mouse heard his cries and came running. 'I can help!' said the mouse, and began gnawing through the thick ropes with his sharp teeth. Soon the lion was free. 'Thank you, little friend,' said the lion. 'I learned that even the smallest friend can be the greatest help of all!'",
                "characters": {
                    "lion": {
                        "description": "The king of the jungle, powerful and mighty, but learns important lessons about humility",
                        "personality": "Initially proud and dismissive, becomes humble and grateful",
                        "role": "Protagonist who experiences character growth",
                        "lessons_learned": "That size doesn't determine worth, and kindness matters more than power"
                    },
                    "mouse": {
                        "description": "A tiny but brave and clever creature with a big heart",
                        "personality": "Courageous, determined, loyal, and quick-thinking",
                        "role": "Helper and true friend who saves the day",
                        "lessons_taught": "That courage comes in all sizes and promises should be kept"
                    }
                },
                "themes": {
                    "friendship": "True friendship transcends differences in size, status, or appearance. Real friends help each other.",
                    "kindness": "Small acts of kindness create ripple effects. The lion's mercy leads to his salvation.",
                    "courage": "Bravery isn't about size or strength - it's about doing what's right when it matters.",
                    "humility": "The lion learns not to judge others by their appearance or dismiss their potential."
                },
                "morals": [
                    "No act of kindness, however small, is ever wasted",
                    "Little friends may prove to be great friends", 
                    "Don't judge others by their size or appearance",
                    "Everyone has something valuable to offer"
                ]
            },
            
            "The Tortoise and the Hare": {
                "full_story": "A hare was making fun of a tortoise for being so slow. 'Do you ever get anywhere?' he asked with a mocking laugh. 'Yes,' replied the tortoise, 'and I get there sooner than you think. I'll run you a race and prove it.' The hare was much amused at the idea of racing a tortoise, but for the fun of it he agreed. So the fox, who had consented to act as judge, marked the distance and started the runners off. The hare soon left the tortoise behind and, confident of winning, took a nap midway through the race. When the hare awoke, he found that the tortoise, moving slowly but steadily, had arrived before him. The tortoise won the race through perseverance and determination, while the hare lost due to his overconfidence and laziness.",
                "characters": {
                    "tortoise": {
                        "description": "Slow but steady, wise and determined",
                        "personality": "Patient, humble, persistent, and focused",
                        "role": "Underdog hero who wins through perseverance",
                        "lessons_taught": "That consistency and determination overcome natural talent without effort"
                    },
                    "hare": {
                        "description": "Fast and talented but overconfident",
                        "personality": "Arrogant, lazy, overconfident, and dismissive",
                        "role": "Cautionary character who learns about humility",
                        "lessons_learned": "That talent without effort leads to failure"
                    },
                    "fox": {
                        "description": "Fair and wise judge of the race",
                        "personality": "Impartial, wise, and observant",
                        "role": "Neutral observer who ensures fairness",
                        "lessons_taught": "The importance of fair play and objectivity"
                    }
                },
                "themes": {
                    "perseverance": "Steady effort and determination lead to success",
                    "humility": "Don't underestimate others or overestimate yourself",
                    "overconfidence": "Pride and arrogance can lead to failure",
                    "hard_work": "Consistent effort beats natural talent without practice"
                },
                "morals": [
                    "Slow and steady wins the race",
                    "Overconfidence can lead to defeat",
                    "Persistence pays off in the end",
                    "Don't underestimate others based on appearances"
                ]
            },
            
            "The Boy Who Cried Wolf": {
                "full_story": "There once was a shepherd boy who was bored as he sat on the hillside watching the village sheep. To amuse himself he took a great breath and sang out, 'Wolf! Wolf! The wolf is chasing the sheep!' The villagers came running up the hill to help the boy drive the wolf away. But when they arrived at the top of the hill, they found no wolf. The boy laughed at the sight of their angry faces. 'Don't cry wolf when there is no wolf!' they said sternly and went back down the hill. Later, the boy sang out again, 'Wolf! Wolf! The wolf is chasing the sheep!' To his naughty delight, he watched the villagers run up the hill to help him drive the wolf away. When the villagers saw no wolf they sternly said, 'Save your frightened song for when there is really something wrong!' But the boy just grinned and watched them go grumbling down the hill once more. Later, he saw a real wolf prowling about his flock. Alarmed, he leaped to his feet and sang out as loudly as he could, 'Wolf! Wolf!' But the villagers thought he was trying to fool them again, and so they didn't come.",
                "characters": {
                    "shepherd_boy": {
                        "description": "Young, bored, and mischievous shepherd",
                        "personality": "Playful, irresponsible, attention-seeking, learns hard lessons",
                        "role": "Protagonist who learns about consequences",
                        "lessons_learned": "That lying destroys trust and has serious consequences"
                    },
                    "villagers": {
                        "description": "Helpful community members who lose trust",
                        "personality": "Kind, helpful, but become skeptical after being deceived",
                        "role": "Community that shows both support and consequences",
                        "lessons_taught": "Trust is precious and hard to rebuild once broken"
                    },
                    "wolf": {
                        "description": "Real danger that threatens the sheep",
                        "personality": "Dangerous predator representing real problems",
                        "role": "Symbol of genuine crisis that requires trust",
                        "lessons_taught": "Real problems need real responses and trust"
                    }
                },
                "themes": {
                    "honesty": "Truth and trustworthiness are precious qualities",
                    "consequences": "Our actions have real results that affect others",
                    "responsibility": "Duties and jobs should be taken seriously",
                    "trust": "Trust is easily broken and difficult to rebuild"
                },
                "morals": [
                    "Nobody believes a liar, even when they are telling the truth",
                    "Honesty is the foundation of trust",
                    "Actions have consequences",
                    "Responsibility should be taken seriously"
                ]
            },
            
            "The Ant and the Grasshopper": {
                "full_story": "In a field one summer's day a grasshopper was hopping about, chirping and singing to its heart's content. An ant passed by, bearing along with great toil an ear of corn he was taking to the nest. 'Why not come and chat with me,' said the grasshopper, 'instead of toiling and moiling in that way?' 'I am helping to lay up food for the winter,' said the ant, 'and recommend you to do the same.' 'Why bother about winter?' said the grasshopper. 'We have got plenty of food at present.' But the ant went on its way and continued its toil. When the winter came the grasshopper found itself dying of hunger, while it saw the ants distributing, every day, corn and grain from the stores they had collected in the summer. Then the grasshopper knew that it was best to prepare for the days of necessity. The ant's hard work during summer saved him during the harsh winter, while the grasshopper's laziness led to his suffering.",
                "characters": {
                    "ant": {
                        "description": "Hardworking, wise, and forward-thinking",
                        "personality": "Disciplined, responsible, wise, and caring",
                        "role": "Model of good planning and work ethic",
                        "lessons_taught": "That preparation and hard work lead to security and success"
                    },
                    "grasshopper": {
                        "description": "Carefree, fun-loving, but short-sighted",
                        "personality": "Playful, careless, present-focused, learns the hard way",
                        "role": "Cautionary example of poor planning",
                        "lessons_learned": "That ignoring future needs leads to hardship"
                    }
                },
                "themes": {
                    "preparation": "Planning ahead prevents future problems",
                    "work_ethic": "Hard work and diligence bring rewards",
                    "responsibility": "Taking care of our needs is important",
                    "foresight": "Thinking about the future helps us make better choices"
                },
                "morals": [
                    "It is best to prepare for the days of necessity",
                    "Hard work and planning pay off",
                    "Play has its time, but work must come first",
                    "Those who don't prepare will face difficulties"
                ]
            }
        }
        
    async def get_tutor_response(
        self, 
        user_message: str, 
        user_id: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive AI-like educational response to ANY question"""
        if context is None:
            context = {}
            
        # Extract context - Handle None values properly
        story = context.get('currentStory') or {}
        story_title = story.get('title', 'the story') if story else 'the story'
        story_theme = story.get('theme', 'general learning') if story else 'general learning'
        user_progress = context.get('userProgress') or {}
        user_level = user_progress.get('level', 'Beginner')
        
        # Clean and analyze message
        message_lower = user_message.lower().strip()
        
        # Generate intelligent response
        response = self._generate_intelligent_response(
            message_lower, user_message, story_title, story_theme, user_level
        )
        
        return {
            "response": response,
            "suggestions": self._generate_contextual_suggestions(story_title, story_theme, message_lower),
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "mode": "smart_mock"
        }
    
    def _generate_intelligent_response(self, message_lower: str, original_message: str,
                                     story_title: str, story_theme: str, user_level: str) -> str:
        """Generate contextually appropriate response to ANY question - ENHANCED FOR ALL STORIES"""
        
        story_data = self.story_database.get(story_title, {})
        
        # 1. REAL-WORLD APPLICATION QUESTIONS (Check this FIRST - highest priority)
        if any(word in message_lower for word in ['real life', 'apply', 'school', 'bullies', 'everyday', 'family', 'bully']):
            if story_title == "The Boy Who Cried Wolf":
                return f"What a practical and important question! 🌍 The lessons from '{story_title}' apply beautifully to real life! In school and friendships, always tell the truth - people need to trust you when it really matters. When you're tempted to lie or exaggerate for attention, remember the shepherd boy's consequences. At home, be honest with family members even when it's difficult. In emergencies, people must be able to believe you. These lessons about honesty help build strong, trusting relationships that last a lifetime. How can you practice being more trustworthy in your daily interactions?"
            elif story_title == "The Tortoise and the Hare":
                return f"What a practical and important question! 🌍 The lessons from '{story_title}' apply beautifully to real life! In school, steady studying beats cramming at the last minute - be like the tortoise with consistent effort. When facing bullies or challenges, remember that persistence often wins over raw talent. Don't give up on difficult subjects; steady progress leads to success. Avoid being overconfident like the hare - always do your best even when tasks seem easy. These lessons help you succeed through determination rather than talent alone. What area of your life could benefit from more tortoise-like persistence?"
            elif story_title == "The Ant and the Grasshopper":
                return f"What a practical and important question! 🌍 The lessons from '{story_title}' apply beautifully to real life! In school, do your homework regularly instead of playing all the time - prepare like the ant. Save money for things you want instead of spending everything immediately. Help with chores at home to prepare for adult responsibilities. Study for tests in advance rather than cramming. Balance fun with responsibility so you're ready when challenges come. These lessons about preparation help you succeed in school and life. How can you better balance fun and preparation in your daily routine?"
            else:  # The Lion and the Mouse
                return f"What a practical and important question! 🌍 The lessons from '{story_title}' apply beautifully to real life! When dealing with bullies at school, remember the mouse's courage - stand up for what's right, seek help when needed, and don't let size or status intimidate you. In friendships, be like both characters - show kindness like the lion and loyalty like the mouse. At home, help family members regardless of how small the task might seem. These timeless lessons help us build better relationships, show compassion, and create positive change in our world. How might you use these lessons in your current situation?"
        
        # 2. STORY-SPECIFIC CHARACTER QUESTIONS
        if any(word in message_lower for word in ['tortoise', 'hare', 'rabbit']):
            if 'tortoise' in message_lower:
                return f"The Tortoise is an inspiring character! 🐢✨ What makes the tortoise special is his steady determination and humble confidence. He doesn't boast or show off - he simply believes in himself and keeps moving forward. The tortoise teaches us that success isn't about being the fastest or most talented; it's about consistency, persistence, and never giving up. His wisdom shows us that small, steady steps can lead to great victories. The tortoise proves that patience and perseverance can overcome any obstacle. What can you learn from the tortoise's approach to challenges?"
            elif 'hare' in message_lower or 'rabbit' in message_lower:
                return f"The Hare is a fascinating character study! 🐰 He represents natural talent and speed, but also the dangers of overconfidence. The hare's mistake wasn't being fast - it was assuming that talent alone was enough to win. He became lazy and careless because he underestimated his opponent. The hare teaches us that no matter how gifted we are, we must still work hard and respect others. His character shows us how pride can lead to downfall, and why humility and effort are essential for success. How can you avoid the hare's mistakes in your own life?"
        
        # 3. CHARACTER MOTIVATION QUESTIONS
        if any(word in message_lower for word in ['character', 'motivation', 'why']):
            return f"Excellent question about character motivations! 🎭 In '{story_title}', each character is driven by different desires and needs. Understanding what motivates characters helps us understand ourselves and others better. Characters act based on their values, fears, hopes, and experiences - just like real people do. Whether it's the lion's initial pride, the mouse's determination to help, the tortoise's quiet confidence, or the shepherd boy's desire for attention - each motivation teaches us something important about human nature and the choices we make. What specific character motivation would you like to explore further?"
        
        # 4. MORAL/LESSON QUESTIONS
        if any(word in message_lower for word in ['moral', 'lesson', 'teach', 'learn', 'meaning']):
            moral_lessons = {
                "The Lion and the Mouse": "No act of kindness, however small, is ever wasted",
                "The Tortoise and the Hare": "Slow and steady wins the race",
                "The Boy Who Cried Wolf": "Nobody believes a liar, even when they are telling the truth", 
                "The Ant and the Grasshopper": "It is best to prepare for the days of necessity"
            }
            moral = moral_lessons.get(story_title, "Every story teaches us important life lessons")
            return f"Such an insightful question about life lessons! 💡 The main moral of '{story_title}' is: '{moral}' This story teaches us profound lessons about character, relationships, responsibility, and making good choices. These lessons apply beautifully to our daily lives and help us become better people. When we understand and apply these teachings, we can navigate challenges more successfully and build stronger relationships with others. How might you apply these lessons in your own life?"
        
        # 5. GREETING RESPONSES
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']) and len(message_lower.split()) <= 3:
            return f"Hello! 👋 I'm your AI tutor, excited to explore stories with you! As a {user_level} learner, what aspect of storytelling would you like to discuss? Whether it's characters, themes, or life lessons, I'm here to help you discover deeper meanings! 🌟"
        
        # 6. FALLBACK FOR ANY OTHER QUESTION
        else:
            # Extract key words from the question to personalize response
            key_words = [word for word in message_lower.split() if len(word) > 3]
            key_phrase = ', '.join(key_words[:3]) if key_words else 'story elements'
            
            return f"That's such a thoughtful question! 💭 Your curiosity shows excellent critical thinking skills. Stories offer so many layers of meaning to explore - from character development and themes to real-world applications and life lessons. Whether we're discussing {key_phrase}, there's always something meaningful to discover. Great questions like yours help us dig deeper into storytelling wisdom and find connections to our own lives. What specific aspect interests you most? I'd love to help you explore it further!"
    
    def _generate_contextual_suggestions(self, story_title: str, story_theme: str, message_lower: str) -> List[str]:
        """Generate smart, contextual suggestions based on the conversation"""
        
        # Story-specific suggestions
        story_suggestions = {
            "The Lion and the Mouse": [
                "What's your favorite character in The Lion and the Mouse and why? ⭐",
                "How can you apply the lessons about kindness in real life? 🌍", 
                "What does this story teach about friendship? 💕"
            ],
            "The Tortoise and the Hare": [
                "What can we learn from the tortoise's persistence? 🐢",
                "How does overconfidence affect the hare? 🐰",
                "When has slow and steady helped you succeed? 🎯"
            ],
            "The Boy Who Cried Wolf": [
                "Why is honesty important in relationships? 🤝", 
                "What are the consequences of lying? ⚖️",
                "How can trust be rebuilt once it's broken? 💫"
            ],
            "The Ant and the Grasshopper": [
                "What does this story teach about preparation? 🐜",
                "How do you balance work and play? ⚖️",
                "What happens when we don't plan ahead? 🤔"
            ]
        }
        
        return story_suggestions.get(story_title, [
            "What are your favorite story themes? ⭐",
            "How can you apply story lessons in real life? 🌍",
            "What character do you relate to most? 💭"
        ])
    
    def clear_conversation_history(self, user_id: str) -> bool:
        """Clear conversation history"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
            return True
        return False
    
    def health_check(self) -> Dict[str, Any]:
        """Health check"""
        return {
            "status": "healthy",
            "mode": "smart_mock",
            "message": "Advanced AI-like Mock Service ready with 4 stories! 🚀",
            "stories_available": [
                "The Lion and the Mouse",
                "The Tortoise and the Hare", 
                "The Boy Who Cried Wolf",
                "The Ant and the Grasshopper"
            ],
            "capabilities": [
                "Comprehensive story analysis for 4 stories",
                "Character development insights", 
                "Theme exploration",
                "Real-world applications",
                "Educational guidance",
                "Bullying advice",
                "Emotional intelligence development",
                "Story-specific responses"
            ],
            "timestamp": datetime.now().isoformat()
        }

# Create singleton instance
tutor_chat_service = TutorChatService()


