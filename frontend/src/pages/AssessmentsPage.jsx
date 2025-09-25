import React, { useState, useEffect } from 'react';

const AssessmentsPage = ({ onBack }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found');
        setError('Please login to view assessments');
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching assessments from backend...');
      
      // Fetch user sessions with completed quizzes
      const response = await fetch('http://localhost:8000/api/user/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const sessions = await response.json();
        console.log('✅ Sessions fetched:', sessions);
        
        // Filter completed sessions and transform to assessment format
        const completedAssessments = sessions
          .filter(session => session.is_completed && session.quiz_score !== null)
          .map(session => ({
            id: session.id,
            story_title: session.story?.title || "Unknown Story",
            completed_at: session.completed_at || session.started_at,
            quiz_score: session.quiz_score,
            questions_answered: session.assessments?.length || 5, // Default to 5 questions
            total_score: session.quiz_score / 100, // Convert percentage to decimal
            reading_time: Math.round((session.total_reading_time || 0) / 60), // Convert to minutes
            scores: session.assessments || [] // Individual question results
          }))
          .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)); // Most recent first

        setAssessments(completedAssessments);
        
        // Calculate comprehensive stats
        if (completedAssessments.length > 0) {
          const totalAssessments = completedAssessments.length;
          const avgScore = completedAssessments.reduce((sum, a) => sum + a.total_score, 0) / totalAssessments;
          const totalQuestions = completedAssessments.reduce((sum, a) => sum + a.questions_answered, 0);
          const totalReadingTime = completedAssessments.reduce((sum, a) => sum + (a.reading_time || 0), 0);
          
          setStats({
            total_assessments: totalAssessments,
            average_score: avgScore,
            total_questions: totalQuestions,
            total_reading_time: totalReadingTime,
            completion_rate: 100, // These are completed assessments
            best_score: Math.max(...completedAssessments.map(a => a.total_score)),
            improvement_trend: calculateImprovementTrend(completedAssessments)
          });
        } else {
          // No completed assessments
          setStats({
            total_assessments: 0,
            average_score: 0,
            total_questions: 0,
            total_reading_time: 0,
            completion_rate: 0,
            best_score: 0,
            improvement_trend: 0
          });
        }

      } else if (response.status === 401) {
        setError('Authentication failed - please login again');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
      } else {
        throw new Error(`Failed to fetch assessments: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching assessments:', error);
      setError('Failed to load assessments');
      // Load fallback data for development
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Calculate if user is improving over time
  const calculateImprovementTrend = (assessments) => {
    if (assessments.length < 2) return 0;
    
    const recent = assessments.slice(0, Math.ceil(assessments.length / 2));
    const older = assessments.slice(Math.ceil(assessments.length / 2));
    
    const recentAvg = recent.reduce((sum, a) => sum + a.total_score, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.total_score, 0) / older.length;
    
    return recentAvg - olderAvg; // Positive means improvement
  };

  // Fallback data for development/offline mode
  const loadFallbackData = () => {
    console.log('📚 Loading fallback assessment data');
    const mockAssessments = [
      {
        id: 1,
        story_title: "The Wise Owl and the Young Fox",
        completed_at: new Date().toISOString(),
        questions_answered: 5,
        total_score: 0.85,
        quiz_score: 85,
        reading_time: 8,
        scores: [
          { question: "What was Felix's main problem?", score: 1.0, is_correct: true },
          { question: "What advice did Oliver give?", score: 1.0, is_correct: true },
          { question: "How did Felix solve his problem?", score: 1.0, is_correct: true },
          { question: "What animals did Oliver suggest Felix observe?", score: 1.0, is_correct: true },
          { question: "What is the main lesson?", score: 0.0, is_correct: false }
        ]
      }
    ];
    
    setAssessments(mockAssessments);
    setStats({
      total_assessments: mockAssessments.length,
      average_score: 0.85,
      total_questions: 5,
      total_reading_time: 8,
      completion_rate: 100,
      best_score: 0.85,
      improvement_trend: 0
    });
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const getGradeLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🏆 Loading Your Assessments...</h2>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2 style={{ color: '#ef4444' }}>⚠️ {error}</h2>
        <button onClick={onBack} style={{
          background: '#6b7280', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px'
        }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '3px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#1f2937', 
            fontSize: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            🏆 Assessment Results
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1.2rem' }}>
            Your quiz performance and learning progress
          </p>
          {assessments.length > 0 && (
            <p style={{ margin: '5px 0 0 0', color: '#10b981', fontSize: '14px' }}>
              🔗 Live data from your backend database
            </p>
          )}
        </div>
        <button
          onClick={onBack}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Enhanced Assessment Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '50px'
      }}>
        {/* Total Assessments */}
        <div style={{
          background: 'linear-gradient(135deg, #fef7ff, #f3e8ff)',
          padding: '35px',
          borderRadius: '20px',
          border: '3px solid #a855f7',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(168, 85, 247, 0.2)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>📝</div>
          <h2 style={{
            fontSize: '3rem',
            margin: '0 0 10px 0',
            color: '#7c3aed',
            fontWeight: 'bold'
          }}>
            {stats.total_assessments || 0}
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#374151', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Quizzes Completed
          </p>
        </div>

        {/* Average Score */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          padding: '35px',
          borderRadius: '20px',
          border: '3px solid #22c55e',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.2)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🎯</div>
          <h2 style={{
            fontSize: '3rem',
            margin: '0 0 10px 0',
            color: getScoreColor(stats.average_score || 0),
            fontWeight: 'bold'
          }}>
            {Math.round((stats.average_score || 0) * 100)}%
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#374151', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Average Score
          </p>
          <p style={{ 
            margin: '10px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px'
          }}>
            {getGradeLabel(stats.average_score || 0)}
          </p>
        </div>

        {/* Total Reading Time */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
          padding: '35px',
          borderRadius: '20px',
          border: '3px solid #3b82f6',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>⏱️</div>
          <h2 style={{
            fontSize: '3rem',
            margin: '0 0 10px 0',
            color: '#1d4ed8',
            fontWeight: 'bold'
          }}>
            {stats.total_reading_time || 0}m
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#374151', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Total Reading Time
          </p>
        </div>

        {/* Best Score */}
        {stats.best_score > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            padding: '35px',
            borderRadius: '20px',
            border: '3px solid #f59e0b',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🏆</div>
            <h2 style={{
              fontSize: '3rem',
              margin: '0 0 10px 0',
              color: '#d97706',
              fontWeight: 'bold'
            }}>
              {Math.round(stats.best_score * 100)}%
            </h2>
            <p style={{ 
              margin: 0, 
              color: '#374151', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Best Score
            </p>
          </div>
        )}
      </div>

      {/* Assessment History */}
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          color: '#1f2937',
          marginBottom: '30px',
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📊 Quiz History ({assessments.length})
        </h3>

        {assessments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: '#f9fafb',
            borderRadius: '15px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
            <h4 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No quiz results yet</h4>
            <p style={{ color: '#9ca3af', margin: 0 }}>Complete a story and take the quiz to see your results here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                style={{
                  padding: '30px',
                  background: '#f9fafb',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#1f2937',
                      fontSize: '1.4rem'
                    }}>
                      📖 {assessment.story_title}
                    </h4>
                    <div style={{ display: 'flex', gap: '15px', color: '#6b7280', fontSize: '14px' }}>
                      <span>
                        📅 {new Date(assessment.completed_at).toLocaleDateString()}
                      </span>
                      <span>
                        ⏱️ {assessment.reading_time}m reading
                      </span>
                      <span>
                        ❓ {assessment.questions_answered} questions
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '2rem',
                      color: getScoreColor(assessment.total_score),
                      fontWeight: 'bold',
                      marginBottom: '5px'
                    }}>
                      {Math.round(assessment.total_score * 100)}%
                    </div>
                    <span style={{
                      background: getScoreColor(assessment.total_score),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {getGradeLabel(assessment.total_score)}
                    </span>
                  </div>
                </div>

                {/* Individual Question Results */}
                {assessment.scores && assessment.scores.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginTop: '20px'
                  }}>
                    {assessment.scores.map((score, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'white',
                          padding: '15px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          borderLeft: `4px solid ${score.is_correct ? '#10b981' : '#ef4444'}`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            fontWeight: '600'
                          }}>
                            Question {index + 1}
                          </span>
                          <span style={{
                            color: score.is_correct ? '#10b981' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {score.is_correct ? '✓' : '✗'}
                          </span>
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#374151',
                          lineHeight: '1.3'
                        }}>
                          {score.question}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '30px',
        background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
        borderRadius: '15px',
        border: '2px solid #3b82f6'
      }}>
        <h3 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>
          Ready to Improve Your Scores? 🚀
        </h3>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
          {assessments.length === 0 
            ? "Take your first quiz by completing a story!"
            : "Continue reading stories to track your learning progress!"}
        </p>
        <button
          onClick={onBack}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📚 Go to Stories
        </button>
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

export default AssessmentsPage;
