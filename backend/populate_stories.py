from database_config import get_db
from database_models import Story
import json
from datetime import datetime

def populate_stories():
    db = next(get_db())
    
    # Clear existing stories first
    db.query(Story).delete()
    db.commit()
    print("🗑️ Cleared existing stories")
    
    stories_data = [
        {
            "id": 1,
            "title": "The Wise Owl and the Young Fox",
            "description": "A story about wisdom, patience, and learning from others",
            "difficulty_level": "beginner",
            "category": "wisdom",
            "scenes": [
                {
                    "scene_id": 1,
                    "text": "In a deep forest lived an old owl named Oliver, known throughout the woodland for his wisdom. One sunny morning, a young fox named Felix approached Oliver's tree, feeling frustrated and impatient. The forest was bustling with activity as other animals went about their daily routines, but Felix felt lost and overwhelmed. He had been struggling to find enough food for the coming winter and was worried about his family's survival. The towering oak tree where Oliver perched seemed like his last hope for guidance and wisdom."
                },
                {
                    "scene_id": 2,
                    "text": "Oliver looked down at Felix with kind, understanding eyes. 'Young one,' he said softly, 'I can see you're troubled. What brings you to my tree today?' Felix took a deep breath and explained his problem: he couldn't find enough food for the coming winter and was worried about his family. His voice trembled with anxiety as he described his failed attempts to gather enough supplies. Oliver listened patiently, nodding thoughtfully as Felix shared his concerns about the harsh winter ahead and his fear of not being able to provide for his loved ones."
                },
                {
                    "scene_id": 3,
                    "text": "Oliver nodded thoughtfully and spoke with gentle authority. 'Patience and observation, young Felix. Watch how the squirrels prepare - they start early and store food in many different places throughout the forest. The secret is not to rush, but to be consistent and methodical in your approach.' Felix listened carefully, absorbing every word of wisdom. He thanked Oliver for his guidance and promised to follow the advice. Over the following weeks, Felix applied Oliver's teachings, observing the squirrels' methods and working steadily. By winter's arrival, his family had enough food stored safely away."
                }
            ],
            "quiz": [
                {
                    "question": "What was Felix's main problem?",
                    "options": [
                        "He was lost in the forest",
                        "He couldn't find enough food for winter", 
                        "He was arguing with other animals",
                        "He was sick and needed help"
                    ],
                    "correct": 1
                },
                {
                    "question": "What advice did Oliver give to Felix?",
                    "options": [
                        "To ask other animals for help",
                        "To be patient, observe squirrels, and be consistent",
                        "To move to a different forest",
                        "To give up and try something else"
                    ],
                    "correct": 1
                },
                {
                    "question": "How did Felix solve his problem?",
                    "options": [
                        "He found a magic solution",
                        "Other animals helped him",
                        "He followed Oliver's advice and worked steadily",
                        "He moved away from the forest"
                    ],
                    "correct": 2
                },
                {
                    "question": "What animals did Oliver suggest Felix should observe?",
                    "options": [
                        "Bears and deer",
                        "Squirrels",
                        "Birds and rabbits", 
                        "Other foxes"
                    ],
                    "correct": 1
                },
                {
                    "question": "What is the main lesson of this story?",
                    "options": [
                        "Wisdom and patience lead to success",
                        "Food is hard to find",
                        "Winter is dangerous",
                        "Owls are very smart"
                    ],
                    "correct": 0
                }
            ],
            "total_scenes": 3,
            "is_active": True
        },
        {
            "id": 2,
            "title": "Maya's First Day Challenge",
            "description": "A tale of courage, friendship, and taking the first step",
            "difficulty_level": "beginner",
            "category": "social_skills",
            "scenes": [
                {
                    "scene_id": 1,
                    "text": "Maya stood at the entrance of her new school, Lincoln Middle School, her heart pounding with nervous energy. She had moved to this town just last week, and today was her first day at the enormous-looking building. Students were chattering excitedly as they walked through the doors, their familiar voices echoing in the hallways. Maya clutched her new backpack straps tightly, feeling overwhelmed by the size of the school and the sea of unfamiliar faces. She took a deep breath, reminding herself that everyone was once new somewhere, and gathered her courage to step forward into this new chapter of her life."
                },
                {
                    "scene_id": 2,
                    "text": "Maya gathered her courage and walked through the front doors, her footsteps echoing in the bustling hallway. Students rushed past her, heading to their lockers and greeting friends they hadn't seen over the break. In a quiet corner near the library, she noticed a girl sitting alone, reading a thick book about astronomy and space exploration. The girl looked friendly but seemed shy and reserved, just like Maya felt. Maya recognized the book cover - it was about black holes and distant galaxies, topics that had always fascinated her. She hesitated for a moment, debating whether to approach the girl or find somewhere else to wait before classes began."
                },
                {
                    "scene_id": 3,
                    "text": "'Hi, I'm Maya. I love astronomy too!' she said, pointing to the book with genuine excitement. The girl looked up with a bright, surprised smile that immediately put Maya at ease. 'I'm Sarah! Are you new here? I'd love to show you around the school.' Sarah closed her book and stood up eagerly. By lunchtime, Maya and Sarah were chatting like old friends, sharing their favorite facts about planets and space missions. Maya realized that taking the first step to be friendly, despite her nervousness, had made all the difference. She had found not just a friend, but someone who shared her interests and made her feel welcomed in her new school."
                }
            ],
            "quiz": [
                {
                    "question": "How did Maya feel about starting at her new school?",
                    "options": [
                        "Excited and confident",
                        "Nervous and anxious",
                        "Angry and frustrated", 
                        "Bored and uninterested"
                    ],
                    "correct": 1
                },
                {
                    "question": "What was Sarah reading about?",
                    "options": [
                        "History and ancient civilizations",
                        "Astronomy and space exploration", 
                        "Mystery novels",
                        "Science fiction stories"
                    ],
                    "correct": 1
                },
                {
                    "question": "What helped Maya make her first friend?",
                    "options": [
                        "A teacher introduced them",
                        "They were assigned as partners",
                        "She noticed their shared interest and introduced herself",
                        "Sarah approached Maya first"
                    ],
                    "correct": 2
                },
                {
                    "question": "Where did Maya first see Sarah?",
                    "options": [
                        "In the cafeteria", 
                        "Near the library",
                        "In a classroom",
                        "Outside the school"
                    ],
                    "correct": 1
                },
                {
                    "question": "What lesson does Maya's story teach us?",
                    "options": [
                        "New schools are always scary",
                        "It's better to wait for others to approach you",
                        "Taking initiative and being friendly can lead to great friendships", 
                        "Reading is more important than making friends"
                    ],
                    "correct": 2
                }
            ],
            "total_scenes": 3,
            "is_active": True
        },
        {
            "id": 3,
            "title": "The Garden of Patience",
            "description": "Learning that the best things in life take time and care",
            "difficulty_level": "beginner",
            "category": "patience",
            "scenes": [
                {
                    "scene_id": 1,
                    "text": "Ten-year-old Jamie decided to plant a vegetable garden behind their house, dreaming of fresh tomatoes, carrots, and crisp lettuce. As they looked at the packet of seeds and the empty patch of soil in their backyard, Jamie realized this project would take much longer than initially expected. The soil looked hard and unpromising, and the seed packets showed beautiful, fully-grown vegetables that seemed impossible to achieve. Jamie's excitement was mixed with uncertainty about how to begin such an ambitious project. They had never grown anything before, but the idea of homegrown vegetables motivated them to start this challenging journey."
                },
                {
                    "scene_id": 2,
                    "text": "Jamie spent the first week preparing the soil, reading gardening books, and carefully planning when to plant each type of vegetable. They learned about spacing, watering schedules, and the importance of proper soil preparation. After planting the seeds with great care, Jamie checked the garden every single day, hoping to see signs of growth. Days passed, then a week, then two weeks, but nothing seemed to be happening above ground. The soil looked exactly the same as when they had planted the seeds. Jamie began to worry that they had done something wrong or that the seeds were defective, feeling frustrated by the lack of visible progress."
                },
                {
                    "scene_id": 3,
                    "text": "On the seventeenth day, Jamie noticed tiny green shoots pushing through the soil like small miracles emerging from the earth! Over the following weeks, Jamie watched in amazement as the plants grew stronger and taller each day. They continued to water, weed, and care for the garden with dedication and patience. Three months later, Jamie harvested their first homegrown vegetables - plump tomatoes, orange carrots, and fresh lettuce leaves. Standing in their thriving garden, Jamie felt an enormous sense of pride and accomplishment. They had learned that the most rewarding achievements require patience, consistent effort, and faith in the process, even when progress isn't immediately visible."
                }
            ],
            "quiz": [
                {
                    "question": "What was Jamie's goal?",
                    "options": [
                        "To become a professional farmer",
                        "To grow their own vegetables",
                        "To win a gardening contest", 
                        "To help their neighbors with food"
                    ],
                    "correct": 1
                },
                {
                    "question": "How long did it take before Jamie saw the first signs of growth?",
                    "options": [
                        "One week",
                        "Seventeen days", 
                        "One month",
                        "Three months"
                    ],
                    "correct": 1
                },
                {
                    "question": "What did Jamie do while waiting for the plants to grow?",
                    "options": [
                        "Gave up and tried something else",
                        "Dug up the seeds to check them",
                        "Continued to water and care for the garden patiently",
                        "Planted new seeds every week"
                    ],
                    "correct": 2
                },
                {
                    "question": "How long did it take from planting to harvesting?",
                    "options": [
                        "One month",
                        "Two months", 
                        "Three months",
                        "Six months"
                    ],
                    "correct": 2
                },
                {
                    "question": "What is the main lesson of Jamie's gardening experience?",
                    "options": [
                        "Gardening is easy if you have good seeds",
                        "Patience and consistent effort lead to rewarding results",
                        "It's better to buy vegetables from the store", 
                        "Some plants grow faster than others"
                    ],
                    "correct": 1
                }
            ],
            "total_scenes": 3,
            "is_active": True
        }
    ]
    
    print("📝 Adding stories to database...")
    for story_data in stories_data:
        story = Story(
            id=story_data["id"],
            title=story_data["title"],
            description=story_data["description"],
            difficulty_level=story_data["difficulty_level"],
            category=story_data["category"],
            scenes=json.dumps(story_data["scenes"]),
            quiz=json.dumps(story_data["quiz"]),
            total_scenes=story_data["total_scenes"],
            is_active=story_data["is_active"],
            created_at=datetime.utcnow()
        )
        db.add(story)
        print(f"✅ Added: {story_data['title']}")
    
    db.commit()
    print(f"\n🎉 Successfully added {len(stories_data)} stories to database!")
    db.close()

if __name__ == "__main__":
    populate_stories()
