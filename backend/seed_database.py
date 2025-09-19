
#!/usr/bin/env python3
"""
Database seeding script for Interactive Storytelling Tutor
Run this script to populate the database with sample data
"""

import json
from sqlalchemy.orm import Session
from database_config import get_db_context, create_tables
from database_models import User, Story, UserSession, Assessment, UserProgress
from auth_utils import get_password_hash

def load_sample_stories():
    """Load sample stories from JSON file"""
    try:
        with open('sample_stories.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ sample_stories.json not found. Make sure to run this script from the backend directory.")
        return None

def seed_database():
    """Seed the database with sample data"""
    print("🌱 Starting database seeding...")

    # Create tables
    create_tables()

    # Load sample stories
    stories_data = load_sample_stories()
    if not stories_data:
        return False

    with get_db_context() as db:
        # Check if stories already exist
        existing_stories = db.query(Story).count()
        if existing_stories > 0:
            print("📚 Stories already exist in database. Skipping story seeding.")
        else:
            # Seed stories
            for story_data in stories_data['stories']:
                db_story = Story(
                    id=story_data['id'],
                    title=story_data['title'],
                    description=story_data['description'],
                    difficulty_level=story_data['difficulty_level'],
                    category=story_data['category'],
                    content=story_data['content'],
                    comprehension_questions=story_data['comprehension_questions']
                )
                db.add(db_story)

            # Commit stories first
            db.commit()
            print(f"✅ Added {len(stories_data['stories'])} sample stories")

        # Create demo users
        demo_users = [
            {
                "username": "demo_student",
                "email": "student@demo.com",
                "full_name": "Demo Student",
                "password": "demo123"
            },
            {
                "username": "demo_teacher", 
                "email": "teacher@demo.com",
                "full_name": "Demo Teacher",
                "password": "demo123"
            },
            {
                "username": "admin",
                "email": "admin@example.com", 
                "full_name": "System Admin",
                "password": "admin123"
            }
        ]

        existing_users = db.query(User).count()
        if existing_users > 0:
            print("👥 Demo users already exist. Skipping user seeding.")
        else:
            created_users = []
            for user_data in demo_users:
                existing_user = db.query(User).filter(
                    (User.username == user_data["username"]) | (User.email == user_data["email"])
                ).first()

                if not existing_user:
                    db_user = User(
                        username=user_data["username"],
                        email=user_data["email"],
                        full_name=user_data["full_name"],
                        hashed_password=get_password_hash(user_data["password"])
                    )
                    db.add(db_user)
                    created_users.append(db_user)

            # Commit users first
            db.commit()

            # Now create progress records for each user (after users are committed and have IDs)
            for db_user in created_users:
                # Refresh to get the ID
                db.refresh(db_user)
                progress = UserProgress(user_id=db_user.id)
                db.add(progress)

            # Commit progress records
            db.commit()
            print(f"✅ Added {len(created_users)} demo users with progress records")

        # Create some demo sessions for the demo student
        demo_student = db.query(User).filter(User.username == "demo_student").first()
        if demo_student:
            existing_sessions = db.query(UserSession).filter(UserSession.user_id == demo_student.id).count()
            if existing_sessions == 0:
                # Create a completed session
                demo_session = UserSession(
                    user_id=demo_student.id,
                    story_id=1,
                    current_scene_id=3,
                    choices_made=[
                        {"scene_id": 1, "choice_id": "a", "timestamp": "2024-01-01T10:00:00"},
                        {"scene_id": 2, "choice_id": "a", "timestamp": "2024-01-01T10:05:00"}
                    ],
                    is_completed=True,
                    completed_at=demo_student.created_at
                )
                db.add(demo_session)
                db.commit()

                print("✅ Added demo session data")

        print("🎉 Database seeding completed successfully!")
        return True

def reset_database():
    """Reset the database by dropping and recreating all tables"""
    print("🔄 Resetting database...")
    from database_config import drop_tables
    drop_tables()
    create_tables()
    print("✅ Database reset completed!")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        reset_database()
        seed_database()
    else:
        success = seed_database()
        if not success:
            print("❌ Seeding failed!")
            sys.exit(1)

        print("\n" + "="*50)
        print("🎯 DEMO CREDENTIALS")
        print("="*50)
        print("Student Account:")
        print("  Username: demo_student")
        print("  Password: demo123")
        print("\nTeacher Account:")
        print("  Username: demo_teacher") 
        print("  Password: demo123")
        print("\nAdmin Account:")
        print("  Username: admin")
        print("  Password: admin123")
        print("="*50)
