import sqlite3
import json
import os
from datetime import datetime

def migrate_database():
    """Migrate existing database to new 3-scene format"""
    db_path = "storytelling_tutor.db"
    
    print("🔄 Starting database migration...")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("📋 Checking current schema...")
        cursor.execute("PRAGMA table_info(stories);")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'scenes' not in columns:
            print("➕ Adding 'scenes' column to stories table...")
            cursor.execute("ALTER TABLE stories ADD COLUMN scenes TEXT;")
        
        if 'quiz' not in columns:
            print("➕ Adding 'quiz' column to stories table...")
            cursor.execute("ALTER TABLE stories ADD COLUMN quiz TEXT;")
            
        if 'total_scenes' not in columns:
            print("➕ Adding 'total_scenes' column to stories table...")
            cursor.execute("ALTER TABLE stories ADD COLUMN total_scenes INTEGER DEFAULT 3;")
        
        # Update existing stories or clear them
        cursor.execute("DELETE FROM stories;")  # Clear old stories
        print("🗑️ Cleared old story data")
        
        # Load new 3-scene stories
        sample_path = "sample_stories.json"
        if os.path.exists(sample_path):
            print(f"📖 Loading new stories from {sample_path}...")
            with open(sample_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for story_data in data['stories']:
                cursor.execute("""
                    INSERT INTO stories (
                        id, title, description, difficulty_level, category, 
                        scenes, quiz, total_scenes, is_active, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    story_data['id'],
                    story_data['title'],
                    story_data['description'],
                    story_data['difficulty_level'],
                    story_data['category'],
                    json.dumps(story_data['scenes']),
                    json.dumps(story_data['quiz']),
                    len(story_data['scenes']),
                    True,
                    datetime.utcnow().isoformat()
                ))
                print(f"✅ Added story: {story_data['title']}")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("✅ Database migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate_database()
