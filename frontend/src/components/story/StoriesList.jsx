import React, { useState, useEffect } from 'react';

const StoriesList = ({ onSelectStory, onBack }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true); // Changed back to true for loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  // ✅ NEW: Fetch stories from backend API
  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found, using fallback stories');
        loadFallbackStories();
        return;
      }

      console.log('🔄 Fetching stories from backend...');
      
      const response = await fetch('http://localhost:8000/api/stories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const backendStories = await response.json();
        console.log('✅ Stories loaded from backend:', backendStories);
        
        // Transform backend data to match your UI format
        const transformedStories = backendStories.map(story => ({
          id: story.id,
          title: story.title,
          theme: story.category || 'wisdom', // Map category to theme
          difficulty_level: story.difficulty_level || 'beginner',
          estimated_reading_time: 8, // Default reading time
          scenes: story.total_scenes || 3,
          quiz_questions: 5, // Default quiz questions
          moral_lesson: getMoralLesson(story.title), // Generate moral lesson
          key_characters: getKeyCharacters(story.title), // Generate characters
          description: story.description || "A wonderful story that teaches important life lessons"
        }));

        setStories(transformedStories);
      } else if (response.status === 401) {
        console.log('❌ Authentication failed, using fallback stories');
        setError('Please login to access full features');
        loadFallbackStories();
      } else {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setError('Connection error - using offline stories');
      loadFallbackStories();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper functions to maintain your UI data
  const getMoralLesson = (title) => {
    const lessons = {
      "The Wise Owl and the Young Fox": "Wisdom and patience lead to success",
      "Maya's First Day Challenge": "Taking initiative and being friendly can lead to great friendships",
      "The Garden of Patience": "Patience and consistent effort lead to rewarding results"
    };
    return lessons[title] || "Every story teaches us something valuable";
  };

  const getKeyCharacters = (title) => {
    const characters = {
      "The Wise Owl and the Young Fox": ["Oliver (Owl)", "Felix (Fox)", "Squirrels"],
      "Maya's First Day Challenge": ["Maya", "Sarah", "Students"],
      "The Garden of Patience": ["Jamie", "Garden", "Plants"]
    };
    return characters[title] || ["Story Characters"];
  };

  // ✅ Fallback to your original hardcoded stories
  const loadFallbackStories = () => {
    console.log('📚 Loading fallback story data');
    setStories([
      {
        id: 1,
        title: "The Wise Owl and the Young Fox",
        theme: "wisdom",
        difficulty_level: "beginner",
        estimated_reading_time: 8,
        scenes: 3,
        quiz_questions: 5,
        moral_lesson: "Wisdom and patience lead to success",
        key_characters: ["Oliver (Owl)", "Felix (Fox)", "Squirrels"],
        description: "A story about wisdom, patience, and learning from others"
      },
      {
        id: 2,
        title: "Maya's First Day Challenge",
        theme: "social_skills", 
        difficulty_level: "intermediate",
        estimated_reading_time: 7,
        scenes: 3,
        quiz_questions: 5,
        moral_lesson: "Taking initiative and being friendly can lead to great friendships",
        key_characters: ["Maya", "Sarah", "Students"],
        description: "A story about courage, friendship, and overcoming social anxiety"
      },
      {
        id: 3,
        title: "The Garden of Patience",
        theme: "personal_development",
        difficulty_level: "intermediate", 
        estimated_reading_time: 9,
        scenes: 3,
        quiz_questions: 5,
        moral_lesson: "Patience and consistent effort lead to rewarding results",
        key_characters: ["Jamie", "Garden", "Plants"],
        description: "A story about perseverance, goal-setting, and delayed gratification"
      }
    ]);
  };

  const handleStorySelect = (story) => {
    console.log('Story selected:', story);
    onSelectStory(story);
  };

  const getThemeColor = (theme) => {
    const colors = {
      'wisdom': '#7c3aed',
      'social_skills': '#10b981',  
      'personal_development': '#f59e0b',
      'patience': '#f59e0b', // Add patience theme
      'friendship': '#3b82f6',
      'perseverance': '#10b981',
      'honesty': '#f59e0b',
      'responsibility': '#8b5cf6'
    };
    return colors[theme] || '#6b7280';
  };

  const getThemeEmoji = (theme) => {
    const emojis = {
      'wisdom': '🦉',
      'social_skills': '🤝',
      'personal_development': '🌱',
      'patience': '🌱', // Add patience emoji
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
        <h2>📚 Loading stories from database...</h2>
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
      {/* Header with Back button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto'
      }}>
        <div></div> {/* Spacer */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>
            📚 Choose Your Story
          </h1>
          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '10px' }}>
              ⚠️ {error}
            </p>
          )}
          <p style={{ color: '#6b7280', fontSize: '18px' }}>
            Each story has <strong>3 scenes</strong> followed by a <strong>comprehension quiz</strong>.
            {stories.length > 0 && ` Choose from ${stories.length} available stories!`}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
            {/* Backend Connection Indicator */}
            {!error && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '15px',
                background: '#10b981',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                🔗 LIVE
              </div>
            )}

            {/* Story Format Badge */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}>
              📖 3 Scenes + 🧠 Quiz
            </div>

            {/* Theme badge */}
            <div style={{
              position: 'absolute',
              top: '55px',
              right: '15px',
              background: getThemeColor(story.theme),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {story.theme.replace('_', ' ')}
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

            {/* Story format details */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '2px solid #22c55e',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#059669',
                marginBottom: '4px'
              }}>
                📚 Linear Story Format
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Read {story.scenes} scenes → Take {story.quiz_questions} question quiz
              </div>
            </div>

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
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Total Time</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.estimated_reading_time} min
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Scenes</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.scenes} 📖
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9ca3af', marginBottom: '5px' }}>Quiz</div>
                <div style={{ fontWeight: '600', color: getThemeColor(story.theme) }}>
                  {story.quiz_questions}Q 🧠
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px',
              gap: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Progress:</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3].map(scene => (
                  <div
                    key={scene}
                    style={{
                      width: '25px',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e5e7eb'
                    }}
                  />
                ))}
                <div style={{
                  width: '35px',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#e5e7eb',
                  marginLeft: '6px'
                }} />
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Quiz</div>
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
              📖 Start 3-Scene Journey
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
