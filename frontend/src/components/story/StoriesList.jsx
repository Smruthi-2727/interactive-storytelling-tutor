import React, { useState, useEffect } from 'react';

const StoriesList = ({ onSelectStory }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false for immediate load

  useEffect(() => {
    // Direct story setup - no API calls
    setStories([
      {
        id: 1,
        title: "The Lion and the Mouse",
        theme: "friendship",
        difficulty_level: "beginner",
        estimated_reading_time: 5,
        moral_lesson: "No act of kindness, however small, is ever wasted",
        key_characters: ["Lion", "Mouse", "Hunters"],
        description: "A tale of unlikely friendship and the power of kindness"
      },
      {
        id: 2,
        title: "The Tortoise and the Hare",
        theme: "perseverance", 
        difficulty_level: "beginner",
        estimated_reading_time: 4,
        moral_lesson: "Slow and steady wins the race",
        key_characters: ["Tortoise", "Hare", "Fox"],
        description: "A story about persistence overcoming natural talent"
      },
      {
        id: 3,
        title: "The Boy Who Cried Wolf",
        theme: "honesty",
        difficulty_level: "intermediate", 
        estimated_reading_time: 6,
        moral_lesson: "Nobody believes a liar, even when they are telling the truth",
        key_characters: ["Shepherd Boy", "Villagers", "Wolf", "Sheep"],
        description: "The importance of honesty and trustworthiness"
      },
      {
        id: 4,
        title: "The Ant and the Grasshopper",
        theme: "responsibility",
        difficulty_level: "beginner",
        estimated_reading_time: 5, 
        moral_lesson: "It is best to prepare for the days of necessity",
        key_characters: ["Ant", "Grasshopper"],
        description: "A lesson about hard work and preparation"
      }
    ]);
    setLoading(false);
  }, []);

  const handleStorySelect = (story) => {
    console.log('Story selected:', story);
    onSelectStory(story);
  };

  const getThemeColor = (theme) => {
    const colors = {
      'friendship': '#3b82f6',
      'perseverance': '#10b981',
      'honesty': '#f59e0b',
      'responsibility': '#8b5cf6'
    };
    return colors[theme] || '#6b7280';
  };

  const getThemeEmoji = (theme) => {
    const emojis = {
      'friendship': '🤝',
      'perseverance': '🐢',
      'honesty': '✋',
      'responsibility': '🐜'
    };
    return emojis[theme] || '📚';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📚 Loading stories...</h2>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>
          📚 Choose Your Story
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Select one of our {stories.length} interactive stories to begin your learning journey!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {stories.map((story) => (
          <div
            key={story.id}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: `3px solid ${getThemeColor(story.theme)}20`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onClick={() => handleStorySelect(story)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
          >
            {/* Theme badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: getThemeColor(story.theme),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {story.theme}
            </div>

            {/* Story icon */}
            <div style={{
              fontSize: '3rem',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              {getThemeEmoji(story.theme)}
            </div>

            {/* Story title */}
            <h2 style={{
              color: '#1f2937',
              fontSize: '1.5rem',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {story.title}
            </h2>

            {/* Story description */}
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {story.description}
            </p>

            {/* Story details */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Reading Time</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.estimated_reading_time} min
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Level</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.difficulty_level}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Characters</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.key_characters?.length || 2}
                </div>
              </div>
            </div>

            {/* Moral lesson preview */}
            <div style={{
              background: `${getThemeColor(story.theme)}10`,
              padding: '15px',
              borderRadius: '8px',
              borderLeft: `4px solid ${getThemeColor(story.theme)}`,
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>
                MORAL LESSON
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontStyle: 'italic', 
                color: '#374151',
                lineHeight: '1.4'
              }}>
                "{story.moral_lesson}"
              </div>
            </div>

            {/* Read button */}
            <button
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${getThemeColor(story.theme)}, ${getThemeColor(story.theme)}CC)`,
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 15px ${getThemeColor(story.theme)}40`
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleStorySelect(story);
              }}
            >
              📖 Start Reading
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StoriesList;



