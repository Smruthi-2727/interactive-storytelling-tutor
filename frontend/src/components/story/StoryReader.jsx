import React, { useState, useEffect } from 'react';

const StoryReader = ({ story, onBack, onComplete }) => {
  const [session, setSession] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false

  useEffect(() => {
    // Skip API calls - directly set up the story
    setSession({ 
      id: Date.now(), 
      story_id: story.id, 
      choices_made: [],
      is_completed: false 
    });
    
    const storyScenes = getStoryScenes(story);
    setCurrentScene(storyScenes[0]);
    setLoading(false);
  }, [story]);

  // Fallback story scenes for your 4 stories
  const getStoryScenes = (story) => {
    const storyContent = {
      "The Lion and the Mouse": [
        {
          scene_id: 1,
          text: "Once upon a time, a tiny mouse ran over a sleeping lion's face and woke him up. The lion was angry and caught the mouse in his huge paw. 'Please don't eat me!' squeaked the mouse. 'I'm sorry I woke you. If you let me go, I promise to help you someday!' The lion laughed at such a small creature offering help, but he was feeling kind that day and let the mouse go.",
          choices: [
            { id: 1, text: "The mouse keeps his promise and helps the lion later" },
            { id: 2, text: "Continue reading to see what happens next" }
          ]
        },
        {
          scene_id: 2,
          text: "Weeks later, the lion was caught in a hunter's net. He roared and struggled but couldn't escape. The little mouse heard his cries and came running. 'I can help!' said the mouse, and began gnawing through the thick ropes with his sharp teeth. Soon the lion was free. 'Thank you, little friend,' said the lion. 'I learned that even the smallest friend can be the greatest help of all!'",
          choices: []
        }
      ],
      "The Tortoise and the Hare": [
        {
          scene_id: 1,
          text: "A hare was making fun of a tortoise for being so slow. 'Do you ever get anywhere?' he asked with a mocking laugh. 'Yes,' replied the tortoise, 'and I get there sooner than you think. I'll run you a race and prove it.' The hare was much amused at the idea of racing a tortoise, but for the fun of it he agreed. So the fox, who had consented to act as judge, marked the distance and started the runners off.",
          choices: [
            { id: 1, text: "See how the race unfolds" },
            { id: 2, text: "Continue to the exciting conclusion" }
          ]
        },
        {
          scene_id: 2,
          text: "The hare soon left the tortoise behind and, confident of winning, took a nap midway through the race. When the hare awoke, he found that the tortoise, moving slowly but steadily, had arrived before him. The tortoise won the race through perseverance and determination, while the hare lost due to his overconfidence and laziness.",
          choices: []
        }
      ],
      "The Boy Who Cried Wolf": [
        {
          scene_id: 1,
          text: "There once was a shepherd boy who was bored as he sat on the hillside watching the village sheep. To amuse himself he took a great breath and sang out, 'Wolf! Wolf! The wolf is chasing the sheep!' The villagers came running up the hill to help the boy drive the wolf away. But when they arrived at the top of the hill, they found no wolf. The boy laughed at the sight of their angry faces.",
          choices: [
            { id: 1, text: "See what happens when the boy lies again" },
            { id: 2, text: "Continue to see the consequences" }
          ]
        },
        {
          scene_id: 2,
          text: "Later, the boy sang out again, 'Wolf! Wolf!' To his naughty delight, he watched the villagers run up the hill to help him drive the wolf away. When they saw no wolf they sternly said, 'Save your frightened song for when there is really something wrong!' Later, he saw a real wolf prowling about his flock. Alarmed, he leaped to his feet and sang out as loudly as he could, 'Wolf! Wolf!' But the villagers thought he was trying to fool them again, and so they didn't come.",
          choices: []
        }
      ],
      "The Ant and the Grasshopper": [
        {
          scene_id: 1,
          text: "In a field one summer's day a grasshopper was hopping about, chirping and singing to its heart's content. An ant passed by, bearing along with great toil an ear of corn he was taking to the nest. 'Why not come and chat with me,' said the grasshopper, 'instead of toiling and moiling in that way?' 'I am helping to lay up food for the winter,' said the ant, 'and recommend you to do the same.'",
          choices: [
            { id: 1, text: "See what happens when winter comes" },
            { id: 2, text: "Continue to learn the lesson" }
          ]
        },
        {
          scene_id: 2,
          text: "'Why bother about winter?' said the grasshopper. 'We have got plenty of food at present.' But the ant went on its way and continued its toil. When the winter came the grasshopper found itself dying of hunger, while it saw the ants distributing, every day, corn and grain from the stores they had collected in the summer. Then the grasshopper knew that it was best to prepare for the days of necessity.",
          choices: []
        }
      ]
    };

    return storyContent[story.title] || [
      {
        scene_id: 1,
        text: "This is a wonderful story that teaches us important life lessons.",
        choices: []
      }
    ];
  };

  const makeChoice = (sceneId, choiceId) => {
    if (!session) return;

    setLoading(true);
    
    // Update session with choice
    const updatedSession = {
      ...session,
      choices_made: [...(session.choices_made || []), { scene_id: sceneId, choice_id: choiceId }]
    };

    // Get next scene
    const scenes = getStoryScenes(story);
    const nextSceneIndex = scenes.findIndex(scene => scene.scene_id === sceneId) + 1;
    
    setTimeout(() => { // Small delay for better UX
      if (nextSceneIndex < scenes.length) {
        setCurrentScene(scenes[nextSceneIndex]);
        setSession(updatedSession);
      } else {
        // Story completed
        updatedSession.is_completed = true;
        setSession(updatedSession);
      }
      setLoading(false);
    }, 500);
  };

  if (!currentScene) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📖 Loading story...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
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
          ← Back to Stories
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '1.8rem' }}>
            {story.title}
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Scene {currentScene?.scene_id} • {session?.choices_made?.length || 0} choices made
          </p>
        </div>
        
        <div style={{ width: '120px' }}></div>
      </div>

      {/* Story Content */}
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          fontSize: '18px',
          lineHeight: '1.8',
          color: '#374151',
          marginBottom: '30px',
          fontFamily: 'Georgia, serif'
        }}>
          {currentScene?.text}
        </div>

        {/* Choices */}
        {currentScene?.choices && currentScene.choices.length > 0 && (
          <div>
            <h3 style={{
              color: '#1f2937',
              marginBottom: '20px',
              fontSize: '1.3rem'
            }}>
              What should happen next?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentScene.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => makeChoice(currentScene.scene_id, choice.id)}
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                >
                  <span style={{ fontWeight: '700', marginRight: '10px' }}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Story completed */}
        {(!currentScene?.choices || currentScene.choices.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: '16px',
            border: '3px solid #22c55e',
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              🎉
            </div>
            
            <h3 style={{ 
              color: '#059669', 
              fontSize: '2.2rem', 
              margin: '0 0 15px 0',
              fontWeight: 'bold'
            }}>
              Story Complete!
            </h3>
            
            <p style={{ 
              color: '#374151', 
              fontSize: '18px', 
              margin: '0 0 10px 0',
              fontWeight: '500'
            }}>
              You've finished "{story.title}" and made {session?.choices_made?.length} meaningful choices!
            </p>
            
            <p style={{ 
              color: '#6b7280', 
              fontSize: '16px', 
              margin: '0 0 30px 0',
              lineHeight: '1.5'
            }}>
              Now test your comprehension and get personalized AI feedback with our assessment system
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => onComplete && onComplete(session)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 40px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  minWidth: '250px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                }}
              >
                🧠 Take Assessment
              </button>
              
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #d1d5db',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.color = '#4b5563';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.color = '#6b7280';
                }}
              >
                📚 Choose Another Story
              </button>
            </div>
          </div>
        )}
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

export default StoryReader;


