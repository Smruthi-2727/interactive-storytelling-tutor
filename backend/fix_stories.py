from database_config import get_db
from database_models import Story
import json
from datetime import datetime

db = next(get_db())

story = Story(
    id=1,
    title="The Wise Owl and the Young Fox",
    description="A story about wisdom, patience, and learning from others",
    difficulty_level="beginner", 
    category="wisdom",
    scenes=json.dumps([
        {
            "scene_id": 1,
            "text": "In a deep forest lived an old owl named Oliver, known throughout the woodland for his wisdom. One sunny morning, a young fox named Felix approached Oliver's tree, feeling frustrated and impatient. The forest was bustling with activity as other animals went about their daily routines, but Felix felt lost and overwhelmed. He had been struggling to find enough food for the coming winter and was worried about his family's survival."
        },
        {
            "scene_id": 2, 
            "text": "Oliver looked down at Felix with kind, understanding eyes. 'Young one,' he said softly, 'I can see you're troubled. What brings you to my tree today?' Felix took a deep breath and explained his problem: he couldn't find enough food for the coming winter and was worried about his family. His voice trembled with anxiety as he described his failed attempts to gather enough supplies."
        },
        {
            "scene_id": 3,
            "text": "Oliver nodded thoughtfully and spoke with gentle authority. 'Patience and observation, young Felix. Watch how the squirrels prepare - they start early and store food in many different places throughout the forest. The secret is not to rush, but to be consistent and methodical in your approach.' Felix listened carefully, absorbing every word of wisdom. Over the following weeks, Felix applied Oliver's teachings and by winter's arrival, his family had enough food stored safely away."
        }
    ]),
    quiz=json.dumps([
        {
            "question": "What was Felix's main problem?",
            "options": ["He was lost in the forest", "He couldn't find enough food for winter", "He was arguing with other animals", "He was sick"],
            "correct": 1
        },
        {
            "question": "What advice did Oliver give?", 
            "options": ["Ask other animals for help", "Be patient, observe squirrels, and be consistent", "Move to a different forest", "Give up"],
            "correct": 1
        },
        {
            "question": "What is the main lesson?",
            "options": ["Wisdom and patience lead to success", "Food is hard to find", "Winter is dangerous", "Owls are smart"],
            "correct": 0
        }
    ]),
    total_scenes=3,
    is_active=True,
    created_at=datetime.utcnow()
)

db.add(story)
db.commit()
print("✅ Story added successfully!")
db.close()
