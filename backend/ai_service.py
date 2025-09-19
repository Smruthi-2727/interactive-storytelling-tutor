
import openai
import os
from typing import Dict, List, Any
import json

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
        # Note: In production, you would set up proper OpenAI client
        # For MVP, we'll provide template-based responses

    def generate_comprehension_feedback(self, question: Dict[str, Any], user_answer: str, correct_answer: Any = None) -> Dict[str, Any]:
        """Generate AI feedback for comprehension questions"""

        if question["type"] == "multiple_choice":
            return self._generate_mcq_feedback(question, user_answer, correct_answer)
        elif question["type"] == "short_answer":
            return self._generate_short_answer_feedback(question, user_answer)
        elif question["type"] == "reflection":
            return self._generate_reflection_feedback(question, user_answer)
        else:
            return {"feedback": "Great job answering the question!", "score": 1.0}

    def _generate_mcq_feedback(self, question: Dict[str, Any], user_answer: str, correct_answer: int) -> Dict[str, Any]:
        """Generate feedback for multiple choice questions"""
        try:
            user_choice = int(user_answer)
            is_correct = user_choice == correct_answer

            if is_correct:
                feedback = f"Excellent! You chose the correct answer. {question.get('explanation', '')}"
                score = 1.0
            else:
                correct_text = question['options'][correct_answer]
                feedback = f"Not quite right. The correct answer is: {correct_text}. {question.get('explanation', '')}"
                score = 0.0

            return {
                "feedback": feedback,
                "score": score,
                "is_correct": is_correct
            }
        except (ValueError, IndexError):
            return {
                "feedback": "Please select a valid option.",
                "score": 0.0,
                "is_correct": False
            }

    def _generate_short_answer_feedback(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """Generate feedback for short answer questions"""
        user_answer_lower = user_answer.lower().strip()
        sample_answers = question.get('sample_answers', [])

        # Simple keyword matching for MVP
        score = 0.0
        for sample in sample_answers:
            sample_words = set(sample.lower().split())
            user_words = set(user_answer_lower.split())

            # Calculate overlap
            overlap = len(sample_words.intersection(user_words))
            if overlap > 0:
                score = max(score, min(1.0, overlap / len(sample_words)))

        if score >= 0.7:
            feedback = f"Great answer! You captured the key points. {question.get('explanation', '')}"
        elif score >= 0.4:
            feedback = f"Good effort! You're on the right track. {question.get('explanation', '')} Consider including more specific details."
        else:
            feedback = f"Your answer shows some understanding. {question.get('explanation', '')} Try to think about the main themes of the story."

        return {
            "feedback": feedback,
            "score": score,
            "is_correct": score >= 0.6
        }

    def _generate_reflection_feedback(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """Generate feedback for reflection questions"""
        feedback_templates = [
            "Thank you for sharing your thoughts! Reflection helps us learn and grow.",
            "Great reflection! Connecting the story to your own experiences shows deep thinking.",
            "Wonderful insight! Your personal connection to the story shows you understand its message.",
            "Excellent reflection! This kind of thinking helps develop emotional intelligence."
        ]

        # For MVP, provide encouraging feedback for any substantive response
        if len(user_answer.strip()) < 10:
            feedback = "Try to elaborate more on your thoughts and feelings. What specific aspects of the story resonated with you?"
            score = 0.3
        else:
            import random
            feedback = random.choice(feedback_templates)
            score = 1.0  # Reflection questions get full credit for thoughtful responses

        return {
            "feedback": feedback,
            "score": score,
            "is_correct": True  # Reflection questions don't have "correct" answers
        }

    def generate_hint(self, question: Dict[str, Any], previous_attempts: int = 0) -> str:
        """Generate hints for questions"""
        hint_templates = {
            "multiple_choice": [
                "Read the story carefully and think about what was explicitly mentioned.",
                "Look for key words in the question that match information in the story.",
                "Eliminate answers that you know are incorrect."
            ],
            "short_answer": [
                "Think about the main events and characters in the story.",
                "What were the key actions or decisions made by the characters?",
                "Consider the cause and effect relationships in the story."
            ],
            "reflection": [
                "Think about your own experiences and how they relate to the story.",
                "What emotions did the characters feel, and have you felt similar emotions?",
                "What lessons can you learn from the characters' choices?"
            ]
        }

        question_type = question.get("type", "multiple_choice")
        hints = hint_templates.get(question_type, hint_templates["multiple_choice"])

        if previous_attempts < len(hints):
            return hints[previous_attempts]
        else:
            return hints[-1]  # Return last hint if too many attempts

    # Placeholder for future LLM integration
    def _call_llm_api(self, prompt: str) -> str:
        """
        Placeholder for actual LLM API calls
        In production, this would call OpenAI, Anthropic, or other LLM APIs
        """
        # This is where you would integrate with actual LLM services
        # For now, return template responses
        return "AI-generated response would go here"
