import React, { useState, useEffect } from 'react';

const StoryReader = ({ story, onBack, onComplete }) => {
  // ✅ All state variables needed
  const [session, setSession] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [sceneStartTime, setSceneStartTime] = useState(Date.now());
  const [storyScenes, setStoryScenes] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [error, setError] = useState(null);
  
  // ✅ NEW: Track total story reading time from start to finish
  const [totalStoryStartTime, setTotalStoryStartTime] = useState(Date.now());
  const [totalSceneTime, setTotalSceneTime] = useState(0); // Accumulate scene reading times

  useEffect(() => {
    // ✅ Set story start time when component mounts
    const storyStart = Date.now();
    setTotalStoryStartTime(storyStart);
    setSceneStartTime(storyStart);
    setTotalSceneTime(0);
    console.log('📖 Story reading session started at:', new Date(storyStart).toLocaleTimeString());
    
    // ✅ CREATE REAL SESSION when component mounts
    createRealSession();
  }, [story]);

  // ✅ NEW: Create real backend session
  const createRealSession = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found, using fallback stories');
        loadFallbackStories();
        return;
      }

      console.log('🔄 Creating session for story:', story.id);

      // Create session via backend API
      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story_id: story.id })
      });

      if (response.ok) {
        const sessionData = await response.json();
        console.log('✅ Real session created:', sessionData);
        setSession(sessionData);
        
        // Fetch story scenes and quiz from backend
        await fetchStoryContent(story.id, token);
      } else {
        throw new Error(`Session creation failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error creating session:', error);
      setError('Using offline mode - backend connection failed');
      loadFallbackStories();
    }
  };

  // ✅ NEW: Fetch story content from backend
  const fetchStoryContent = async (storyId, token) => {
    try {
      console.log('🔄 Fetching story content for:', storyId);
      
      const response = await fetch(`http://localhost:8000/api/stories/${storyId}/scenes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const storyData = await response.json();
        console.log('✅ Story content fetched from backend:', storyData);
        
        // Parse scenes and quiz (they come as JSON strings from backend)
        const scenes = typeof storyData.scenes === 'string' ? JSON.parse(storyData.scenes) : storyData.scenes;
        const quiz = typeof storyData.quiz === 'string' ? JSON.parse(storyData.quiz) : storyData.quiz;
        
        setStoryScenes(scenes || []);
        setQuizQuestions(quiz || []);
      } else {
        throw new Error(`Story fetch failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      loadFallbackStories();
    }
  };

  // ✅ Fallback to hardcoded data if backend fails
  const loadFallbackStories = () => {
    console.log('📚 Loading fallback story data');
    const fallbackContent = {
      "The Wise Owl and the Young Fox": {
        scenes: [
          {
            scene_id: 1,
            text: "In a deep forest lived an old owl named Oliver, known throughout the woodland for his wisdom. One sunny morning, a young fox named Felix approached Oliver's tree, feeling frustrated and impatient. The forest was bustling with activity as other animals went about their daily routines, but Felix felt lost and overwhelmed. He had been struggling to find enough food for the coming winter and was worried about his family's survival. The towering oak tree where Oliver perched seemed like his last hope for guidance and wisdom."
          },
          {
            scene_id: 2,
            text: "Oliver looked down at Felix with kind, understanding eyes. 'Young one,' he said softly, 'I can see you're troubled. What brings you to my tree today?' Felix took a deep breath and explained his problem: he couldn't find enough food for the coming winter and was worried about his family. His voice trembled with anxiety as he described his failed attempts to gather enough supplies. Oliver listened patiently, nodding thoughtfully as Felix shared his concerns about the harsh winter ahead and his fear of not being able to provide for his loved ones."
          },
          {
            scene_id: 3,
            text: "Oliver nodded thoughtfully and spoke with gentle authority. 'Patience and observation, young Felix. Watch how the squirrels prepare - they start early and store food in many different places throughout the forest. The secret is not to rush, but to be consistent and methodical in your approach.' Felix listened carefully, absorbing every word of wisdom. He thanked Oliver for his guidance and promised to follow the advice. Over the following weeks, Felix applied Oliver's teachings, observing the squirrels' methods and working steadily. By winter's arrival, his family had enough food stored safely away."
          }
        ],
        quiz: [
          {
            question: "What was Felix's main problem?",
            options: [
              "He was lost in the forest",
              "He couldn't find enough food for winter", 
              "He was arguing with other animals",
              "He was sick and needed help"
            ],
            correct: 1
          },
          {
            question: "What advice did Oliver give to Felix?",
            options: [
              "To ask other animals for help",
              "To be patient, observe squirrels, and be consistent",
              "To move to a different forest",
              "To give up and try something else"
            ],
            correct: 1
          },
          {
            question: "How did Felix solve his problem?",
            options: [
              "He found a magic solution",
              "Other animals helped him",
              "He followed Oliver's advice and worked steadily",
              "He moved away from the forest"
            ],
            correct: 2
          },
          {
            question: "What animals did Oliver suggest Felix should observe?",
            options: [
              "Bears and deer",
              "Squirrels",
              "Birds and rabbits", 
              "Other foxes"
            ],
            correct: 1
          },
          {
            question: "What is the main lesson of this story?",
            options: [
              "Wisdom and patience lead to success",
              "Food is hard to find",
              "Winter is dangerous",
              "Owls are very smart"
            ],
            correct: 0
          }
        ]
      },
      "Maya's First Day Challenge": {
        scenes: [
          {
            scene_id: 1,
            text: "Maya stood at the entrance of her new school, Lincoln Middle School, her heart pounding with nervous energy. She had moved to this town just last week, and today was her first day at the enormous-looking building. Students were chattering excitedly as they walked through the doors, their familiar voices echoing in the hallways. Maya clutched her new backpack straps tightly, feeling overwhelmed by the size of the school and the sea of unfamiliar faces. She took a deep breath, reminding herself that everyone was once new somewhere, and gathered her courage to step forward into this new chapter of her life."
          },
          {
            scene_id: 2,
            text: "Maya gathered her courage and walked through the front doors, her footsteps echoing in the bustling hallway. Students rushed past her, heading to their lockers and greeting friends they hadn't seen over the break. In a quiet corner near the library, she noticed a girl sitting alone, reading a thick book about astronomy and space exploration. The girl looked friendly but seemed shy and reserved, just like Maya felt. Maya recognized the book cover - it was about black holes and distant galaxies, topics that had always fascinated her. She hesitated for a moment, debating whether to approach the girl or find somewhere else to wait before classes began."
          },
          {
            scene_id: 3,
            text: "'Hi, I'm Maya. I love astronomy too!' she said, pointing to the book with genuine excitement. The girl looked up with a bright, surprised smile that immediately put Maya at ease. 'I'm Sarah! Are you new here? I'd love to show you around the school.' Sarah closed her book and stood up eagerly. By lunchtime, Maya and Sarah were chatting like old friends, sharing their favorite facts about planets and space missions. Maya realized that taking the first step to be friendly, despite her nervousness, had made all the difference. She had found not just a friend, but someone who shared her interests and made her feel welcomed in her new school."
          }
        ],
        quiz: [
          {
            question: "How did Maya feel about starting at her new school?",
            options: [
              "Excited and confident",
              "Nervous and anxious",
              "Angry and frustrated", 
              "Bored and uninterested"
            ],
            correct: 1
          },
          {
            question: "What was Sarah reading about?",
            options: [
              "History and ancient civilizations",
              "Astronomy and space exploration", 
              "Mystery novels",
              "Science fiction stories"
            ],
            correct: 1
          },
          {
            question: "What helped Maya make her first friend?",
            options: [
              "A teacher introduced them",
              "They were assigned as partners",
              "She noticed their shared interest and introduced herself",
              "Sarah approached Maya first"
            ],
            correct: 2
          },
          {
            question: "Where did Maya first see Sarah?",
            options: [
              "In the cafeteria", 
              "Near the library",
              "In a classroom",
              "Outside the school"
            ],
            correct: 1
          },
          {
            question: "What lesson does Maya's story teach us?",
            options: [
              "New schools are always scary",
              "It's better to wait for others to approach you",
              "Taking initiative and being friendly can lead to great friendships", 
              "Reading is more important than making friends"
            ],
            correct: 2
          }
        ]
      },
      "The Garden of Patience": {
        scenes: [
          {
            scene_id: 1,
            text: "Ten-year-old Jamie decided to plant a vegetable garden behind their house, dreaming of fresh tomatoes, carrots, and crisp lettuce. As they looked at the packet of seeds and the empty patch of soil in their backyard, Jamie realized this project would take much longer than initially expected. The soil looked hard and unpromising, and the seed packets showed beautiful, fully-grown vegetables that seemed impossible to achieve. Jamie's excitement was mixed with uncertainty about how to begin such an ambitious project. They had never grown anything before, but the idea of homegrown vegetables motivated them to start this challenging journey."
          },
          {
            scene_id: 2,
            text: "Jamie spent the first week preparing the soil, reading gardening books, and carefully planning when to plant each type of vegetable. They learned about spacing, watering schedules, and the importance of proper soil preparation. After planting the seeds with great care, Jamie checked the garden every single day, hoping to see signs of growth. Days passed, then a week, then two weeks, but nothing seemed to be happening above ground. The soil looked exactly the same as when they had planted the seeds. Jamie began to worry that they had done something wrong or that the seeds were defective, feeling frustrated by the lack of visible progress."
          },
          {
            scene_id: 3,
            text: "On the seventeenth day, Jamie noticed tiny green shoots pushing through the soil like small miracles emerging from the earth! Over the following weeks, Jamie watched in amazement as the plants grew stronger and taller each day. They continued to water, weed, and care for the garden with dedication and patience. Three months later, Jamie harvested their first homegrown vegetables - plump tomatoes, orange carrots, and fresh lettuce leaves. Standing in their thriving garden, Jamie felt an enormous sense of pride and accomplishment. They had learned that the most rewarding achievements require patience, consistent effort, and faith in the process, even when progress isn't immediately visible."
          }
        ],
        quiz: [
          {
            question: "What was Jamie's goal?",
            options: [
              "To become a professional farmer",
              "To grow their own vegetables",
              "To win a gardening contest", 
              "To help their neighbors with food"
            ],
            correct: 1
          },
          {
            question: "How long did it take before Jamie saw the first signs of growth?",
            options: [
              "One week",
              "Seventeen days", 
              "One month",
              "Three months"
            ],
            correct: 1
          },
          {
            question: "What did Jamie do while waiting for the plants to grow?",
            options: [
              "Gave up and tried something else",
              "Dug up the seeds to check them",
              "Continued to water and care for the garden patiently",
              "Planted new seeds every week"
            ],
            correct: 2
          },
          {
            question: "How long did it take from planting to harvesting?",
            options: [
              "One month",
              "Two months", 
              "Three months",
              "Six months"
            ],
            correct: 2
          },
          {
            question: "What is the main lesson of Jamie's gardening experience?",
            options: [
              "Gardening is easy if you have good seeds",
              "Patience and consistent effort lead to rewarding results",
              "It's better to buy vegetables from the store", 
              "Some plants grow faster than others"
            ],
            correct: 1
          }
        ]
      }
    };

    const data = fallbackContent[story.title] || fallbackContent["The Wise Owl and the Young Fox"];
    setStoryScenes(data.scenes);
    setQuizQuestions(data.quiz);
  };

  // ✅ Handle scene continuation with REAL reading time tracking
  const handleContinue = async () => {
    setLoading(true);
    
    // ✅ Calculate REAL scene reading time
    const sceneReadingTime = Math.floor((Date.now() - sceneStartTime) / 1000);
    setTotalSceneTime(prev => prev + sceneReadingTime);
    
    console.log(`📖 Scene ${currentSceneIndex + 1} reading time: ${sceneReadingTime} seconds`);
    console.log(`📊 Total reading time so far: ${Math.floor((totalSceneTime + sceneReadingTime) / 60)} minutes`);
    
    if (session && session.id && typeof session.id === 'number') {
      // Real session - call backend API
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        console.log('🔄 Completing scene:', currentSceneIndex, 'for session:', session.id);
        
        const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/complete_scene`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scene_index: currentSceneIndex,
            reading_time_seconds: sceneReadingTime // ✅ REAL scene reading time
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Scene completed via backend:', result);
          
          if (result.quiz_ready) {
            setShowQuiz(true);
          } else {
            setCurrentSceneIndex(currentSceneIndex + 1);
            setSceneStartTime(Date.now()); // ✅ Start timing next scene
          }
        } else {
          console.warn('⚠️ Backend scene completion failed, using fallback');
          fallbackSceneProgression();
        }
      } catch (error) {
        console.error('❌ Error completing scene via backend:', error);
        fallbackSceneProgression();
      }
    } else {
      // No real session, use fallback
      fallbackSceneProgression();
    }
    
    setLoading(false);
  };

  // ✅ Fallback scene progression
  const fallbackSceneProgression = () => {
    if (currentSceneIndex < storyScenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setSceneStartTime(Date.now()); // ✅ Start timing next scene
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // ✅ Handle quiz submission with REAL total reading time
  const handleQuizSubmit = async () => {
    // ✅ Calculate REAL total reading time for the entire story + quiz
    const quizStartTime = Date.now() - sceneStartTime; // Time spent on current quiz
    const totalReadingTimeSeconds = Math.floor((Date.now() - totalStoryStartTime) / 1000);
    const totalMinutes = Math.floor(totalReadingTimeSeconds / 60);
    
    console.log(`📊 REAL TOTAL READING TIME: ${totalReadingTimeSeconds} seconds (${totalMinutes} minutes)`);
    console.log(`📖 Story started at: ${new Date(totalStoryStartTime).toLocaleTimeString()}`);
    console.log(`🏁 Story completed at: ${new Date().toLocaleTimeString()}`);

    if (session && session.id && typeof session.id === 'number') {
      // Real session - submit to backend
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        console.log('🔄 Submitting quiz to backend for session:', session.id);
        
        const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/submit_quiz`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quiz_answers: quizAnswers,
            total_quiz_time_seconds: totalReadingTimeSeconds // ✅ REAL TOTAL TIME instead of dummy 180
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Quiz submitted to backend:', result);
          setQuizScore(Math.round(result.score));
          
          // ✅ FIX: Call completion callback with updated session data
          const completedSession = {
            ...session,
            is_completed: true,
            quiz_score: result.score,
            correct_answers: result.correct_answers,
            total_questions: result.total_questions,
            total_reading_time: totalReadingTimeSeconds // ✅ Include real reading time
          };

          // Update session with real data
          setSession(completedSession);

          // Call completion callback to trigger App.js refresh
          if (onComplete) {
            console.log('🎯 Calling onComplete to trigger dashboard refresh');
            onComplete(completedSession);
          }
        } else {
          console.warn('⚠️ Backend quiz submission failed, using fallback');
          fallbackQuizCalculation(totalReadingTimeSeconds);
        }
      } catch (error) {
        console.error('❌ Error submitting quiz to backend:', error);
        fallbackQuizCalculation(totalReadingTimeSeconds);
      }
    } else {
      // No real session, use fallback calculation
      fallbackQuizCalculation(totalReadingTimeSeconds);
    }
  };

  // ✅ Fallback quiz calculation with real reading time
  const fallbackQuizCalculation = (readingTime) => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    
    const completedSession = { 
      ...session, 
      is_completed: true, 
      quiz_score: score,
      correct_answers: correct,
      total_questions: quizQuestions.length,
      total_reading_time: readingTime // ✅ Include real reading time
    };
    
    setSession(completedSession);

    // Call completion callback for fallback too
    if (onComplete) {
      console.log('🎯 Calling onComplete (fallback) to trigger dashboard refresh');
      onComplete(completedSession);
    }
  };

  const currentScene = storyScenes[currentSceneIndex];
  const totalScenes = storyScenes.length || 3;

  if (!currentScene && !showQuiz && storyScenes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📖 Loading story...</h2>
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
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
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '1.8rem' }}>
            {story.title}
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            {showQuiz ? '🧠 Quiz Time!' : `📖 Scene ${currentSceneIndex + 1} of ${totalScenes}`}
          </p>
          {/* ✅ Show real-time reading progress */}
          <p style={{ margin: '5px 0 0 0', color: '#10b981', fontSize: '12px' }}>
            Reading time: {Math.floor((Date.now() - totalStoryStartTime) / 60000)}m {Math.floor(((Date.now() - totalStoryStartTime) % 60000) / 1000)}s
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
        {!showQuiz ? (
          <>
            <div style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '40px',
              fontFamily: 'Georgia, serif'
            }}>
              {currentScene?.text}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleContinue}
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processing...' :
                 currentSceneIndex < totalScenes - 1 ? '📖 Next Scene' : '🧠 Take Quiz'}
              </button>
            </div>
          </>
        ) : (
          <>
            {quizScore === null ? (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
                  📝 Story Quiz
                </h2>
                
                {quizQuestions.map((question, qIndex) => (
                  <div key={qIndex} style={{ marginBottom: '25px' }}>
                    <h3 style={{ marginBottom: '15px' }}>
                      {qIndex + 1}. {question.question}
                    </h3>
                    {question.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleQuizAnswer(qIndex, oIndex)}
                        style={{
                          display: 'block',
                          width: '100%',
                          background: quizAnswers[qIndex] === oIndex ? '#3b82f6' : '#f3f4f6',
                          color: quizAnswers[qIndex] === oIndex ? 'white' : '#374151',
                          border: '1px solid #d1d5db',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {String.fromCharCode(65 + oIndex)}. {option}
                      </button>
                    ))}
                  </div>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    style={{
                      background: Object.keys(quizAnswers).length === quizQuestions.length 
                        ? '#10b981' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: Object.keys(quizAnswers).length === quizQuestions.length 
                        ? 'pointer' : 'not-allowed'
                    }}
                  >
                    📊 Submit Quiz
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '20px' }}>
                  Quiz Complete! 🎉
                </h2>
                <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                  Your Score: {quizScore}%
                </p>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                  {session?.correct_answers || 0} out of {session?.total_questions || quizQuestions.length} questions correct
                </p>
                <p style={{ marginBottom: '20px', color: '#059669', fontSize: '14px' }}>
                  ⏱️ Total reading time: {Math.floor((Date.now() - totalStoryStartTime) / 60000)} minutes
                </p>
                <p style={{ marginBottom: '30px' }}>
                  {quizScore >= 80 ? 'Excellent! You understood the story very well! 🌟' :
                   quizScore >= 60 ? 'Good job! You got most of it right! 👍' :
                   'Keep practicing! Try reading the story again! 📚'}
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={onBack}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    📚 Try Another Story
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryReader;

