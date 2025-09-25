
import openai
import os
from typing import Dict, List, Any, Optional
import json
import random
from datetime import datetime

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
        # Note: In production, you would set up proper OpenAI client
        # For MVP, we'll provide template-based responses

    def generate_quiz_feedback(self, quiz_questions: List[Dict], user_answers: Dict[int, int], quiz_score: float) -> Dict[str, Any]:
        """Generate comprehensive feedback for completed quiz"""
        
        feedback_data = {
            "overall_score": quiz_score,
            "total_questions": len(quiz_questions),
            "correct_answers": 0,
            "question_feedback": [],
            "overall_feedback": "",
            "improvement_suggestions": [],
            "story_comprehension_level": ""
        }
        
        # Analyze each question
        for i, question in enumerate(quiz_questions):
            user_answer_index = user_answers.get(i, -1)
            correct_answer_index = question.get("correct", 0)
            is_correct = user_answer_index == correct_answer_index
            
            if is_correct:
                feedback_data["correct_answers"] += 1
            
            question_feedback = {
                "question_index": i,
                "question_text": question["question"],
                "user_answer": question["options"][user_answer_index] if 0 <= user_answer_index < len(question["options"]) else "No answer",
                "correct_answer": question["options"][correct_answer_index],
                "is_correct": is_correct,
                "feedback": self._generate_question_feedback(question, user_answer_index, correct_answer_index, is_correct)
            }
            
            feedback_data["question_feedback"].append(question_feedback)
        
        # Generate overall feedback based on performance
        feedback_data["overall_feedback"] = self._generate_overall_feedback(quiz_score, feedback_data["correct_answers"], len(quiz_questions))
        feedback_data["story_comprehension_level"] = self._determine_comprehension_level(quiz_score)
        feedback_data["improvement_suggestions"] = self._generate_improvement_suggestions(quiz_score, feedback_data["question_feedback"])
        
        return feedback_data

    def _generate_question_feedback(self, question: Dict, user_answer_index: int, correct_answer_index: int, is_correct: bool) -> str:
        """Generate feedback for individual quiz question"""
        
        if is_correct:
            positive_feedback = [
                "Excellent! You understood this part of the story perfectly.",
                "Great job! You picked up on the key details.",
                "Perfect! This shows you were paying attention to the story.",
                "Wonderful! You grasped the important information.",
                "Outstanding! Your reading comprehension is strong here."
            ]
            return random.choice(positive_feedback)
        else:
            correct_answer = question["options"][correct_answer_index]
            constructive_feedback = [
                f"The correct answer is '{correct_answer}'. Try reading that part of the story again to understand why.",
                f"Not quite right. The answer is '{correct_answer}'. Look for clues in the story text that support this.",
                f"Close, but the correct answer is '{correct_answer}'. Consider what the characters said or did in the story.",
                f"The right answer is '{correct_answer}'. Think about the main events and how they connect.",
                f"Actually, it's '{correct_answer}'. Focus on the specific details mentioned in the story."
            ]
            return random.choice(constructive_feedback)

    def _generate_overall_feedback(self, score: float, correct: int, total: int) -> str:
        """Generate overall quiz performance feedback"""
        
        if score >= 90:
            return f"Outstanding performance! You got {correct} out of {total} questions correct. Your reading comprehension is excellent, and you clearly understood all the key elements of the story. Keep up the fantastic work!"
        elif score >= 80:
            return f"Great job! You scored {correct} out of {total} questions correctly. You have strong reading comprehension skills and understood most of the story very well. Just review the questions you missed."
        elif score >= 70:
            return f"Good work! You got {correct} out of {total} questions right. You understood the main parts of the story. Focus on paying attention to specific details as you read."
        elif score >= 60:
            return f"Nice effort! You answered {correct} out of {total} questions correctly. You're getting the hang of it. Try reading more slowly and thinking about what each part of the story tells us."
        else:
            return f"Keep practicing! You got {correct} out of {total} questions right. Reading comprehension takes time to develop. Consider reading the story again and discussing it with someone."

    def _determine_comprehension_level(self, score: float) -> str:
        """Determine reading comprehension level based on quiz score"""
        
        if score >= 90:
            return "Advanced"
        elif score >= 75:
            return "Proficient" 
        elif score >= 60:
            return "Developing"
        else:
            return "Beginning"

    def _generate_improvement_suggestions(self, score: float, question_feedback: List[Dict]) -> List[str]:
        """Generate personalized improvement suggestions"""
        
        suggestions = []
        
        # Analyze wrong answers to give targeted advice
        wrong_questions = [q for q in question_feedback if not q["is_correct"]]
        
        if score < 60:
            suggestions.extend([
                "Try reading each scene more slowly and carefully",
                "After each scene, pause and think about what happened",
                "Look for the main idea in each part of the story",
                "Pay attention to what the characters say and do"
            ])
        elif score < 80:
            suggestions.extend([
                "Focus on specific details mentioned in the story",
                "Think about cause and effect - why things happened",
                "Notice the emotions and motivations of characters",
                "Review the parts where you weren't sure of the answer"
            ])
        else:
            suggestions.extend([
                "You're doing great! Keep reading regularly to maintain your skills",
                "Try reading stories from different categories to expand your comprehension",
                "Consider the deeper meanings and lessons in stories"
            ])
        
        # Add specific suggestions based on question types missed
        if len(wrong_questions) > 0:
            suggestions.append("Review the questions you missed and reread those parts of the story")
        
        return suggestions[:3]  # Return top 3 suggestions

    def generate_story_summary_feedback(self, story_title: str, scenes_completed: int, reading_time_minutes: int) -> Dict[str, Any]:
        """Generate feedback about story reading experience"""
        
        reading_pace = self._assess_reading_pace(reading_time_minutes)
        engagement_feedback = self._generate_engagement_feedback(scenes_completed, reading_time_minutes)
        
        return {
            "story_title": story_title,
            "scenes_completed": scenes_completed,
            "reading_time_minutes": reading_time_minutes,
            "reading_pace": reading_pace,
            "engagement_feedback": engagement_feedback,
            "encouragement": self._generate_encouragement(story_title)
        }

    def _assess_reading_pace(self, reading_time_minutes: int) -> str:
        """Assess if reading pace was appropriate"""
        
        if reading_time_minutes < 3:
            return "You read quite quickly! Make sure you're taking time to understand each scene."
        elif reading_time_minutes > 15:
            return "You took your time reading - that's great for comprehension!"
        else:
            return "Your reading pace was just right for understanding the story."

    def _generate_engagement_feedback(self, scenes_completed: int, reading_time_minutes: int) -> str:
        """Generate feedback about engagement level"""
        
        if scenes_completed == 3 and reading_time_minutes >= 5:
            return "Excellent engagement! You read the complete story thoughtfully."
        elif scenes_completed == 3:
            return "Great job completing all three scenes of the story!"
        else:
            return "Keep going! Try to read all scenes to get the full story experience."

    def _generate_encouragement(self, story_title: str) -> str:
        """Generate encouraging message about the story completed"""
        
        encouragements = [
            f"Congratulations on completing '{story_title}'! Every story you read helps build your skills.",
            f"Well done finishing '{story_title}'! You're becoming a stronger reader with each story.",
            f"Great work on '{story_title}'! Keep up the excellent reading progress.",
            f"Fantastic job with '{story_title}'! Your reading comprehension is improving.",
            f"Awesome completion of '{story_title}'! You're building great reading habits."
        ]
        
        return random.choice(encouragements)

    def generate_progress_insights(self, user_progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights about user's overall progress"""
        
        total_stories = user_progress_data.get("total_stories_completed", 0)
        average_score = user_progress_data.get("average_quiz_score", 0)
        current_streak = user_progress_data.get("current_streak", 0)
        favorite_categories = user_progress_data.get("favorite_categories", [])
        
        insights = {
            "achievement_level": self._determine_achievement_level(total_stories, average_score),
            "streak_feedback": self._generate_streak_feedback(current_streak),
            "category_recommendation": self._recommend_categories(favorite_categories),
            "next_goal": self._suggest_next_goal(total_stories, average_score, current_streak),
            "motivation_message": self._generate_motivation_message(total_stories, average_score)
        }
        
        return insights

    def _determine_achievement_level(self, stories_completed: int, average_score: float) -> str:
        """Determine user's overall achievement level"""
        
        if stories_completed >= 20 and average_score >= 85:
            return "Master Reader"
        elif stories_completed >= 10 and average_score >= 75:
            return "Skilled Reader"
        elif stories_completed >= 5 and average_score >= 65:
            return "Developing Reader"
        else:
            return "Beginning Reader"

    def _generate_streak_feedback(self, streak: int) -> str:
        """Generate feedback about reading streak"""
        
        if streak == 0:
            return "Start a reading streak today! Consistency helps build strong reading habits."
        elif streak == 1:
            return "Great start! You're on day 1 of your reading streak. Keep it going!"
        elif streak < 7:
            return f"Excellent! You're on a {streak}-day reading streak. Keep the momentum going!"
        elif streak < 30:
            return f"Amazing {streak}-day streak! You're building fantastic reading habits."
        else:
            return f"Incredible {streak}-day streak! You're a reading champion!"

    def _recommend_categories(self, favorite_categories: List[str]) -> str:
        """Recommend story categories to explore"""
        
        all_categories = ["wisdom", "social_skills", "personal_development", "adventure", "friendship", "courage"]
        
        if not favorite_categories:
            return "Try exploring different story categories to find what interests you most!"
        
        unexplored = [cat for cat in all_categories if cat not in favorite_categories]
        
        if unexplored:
            recommended = random.choice(unexplored)
            return f"You might enjoy stories in the '{recommended}' category based on your reading history!"
        else:
            return "You've explored many story categories - great diversity in your reading!"

    def _suggest_next_goal(self, stories_completed: int, average_score: float, streak: int) -> str:
        """Suggest next goal for the user"""
        
        if stories_completed < 5:
            return "Goal: Complete 5 stories to unlock new achievements!"
        elif average_score < 75:
            return "Goal: Aim for 75% average quiz score to improve comprehension!"
        elif streak < 7:
            return "Goal: Build a 7-day reading streak for consistent practice!"
        else:
            return "Goal: Explore a new story category or help others with their reading!"

    def _generate_motivation_message(self, stories_completed: int, average_score: float) -> str:
        """Generate motivational message based on progress"""
        
        messages = [
            "Every story you read makes you a better reader and thinker!",
            "Your reading journey is building important life skills!",
            "Keep exploring new stories - each one teaches something valuable!",
            "Your commitment to reading is impressive - keep it up!",
            "Reading regularly is one of the best habits you can develop!"
        ]
        
        if stories_completed >= 10:
            messages.extend([
                "You've completed many stories - you're becoming a reading expert!",
                "Your dedication to reading is truly admirable!",
                "You're building an impressive reading portfolio!"
            ])
        
        if average_score >= 80:
            messages.extend([
                "Your comprehension skills are excellent - keep challenging yourself!",
                "You're demonstrating strong analytical thinking through your reading!",
                "Your quiz performance shows deep understanding of stories!"
            ])
        
        return random.choice(messages)

    # Placeholder for future LLM integration
    def _call_llm_api(self, prompt: str) -> str:
        """
        Placeholder for actual LLM API calls
        In production, this would call OpenAI, Anthropic, or other LLM APIs
        For the 3-scene quiz format, this could generate:
        - More detailed question explanations
        - Personalized reading recommendations
        - Adaptive difficulty suggestions
        """
        # This is where you would integrate with actual LLM services
        # Example prompt for quiz feedback:
        # f"Generate encouraging feedback for a student who scored {score}% on a reading comprehension quiz about {story_title}"
        return "AI-generated response would go here"
