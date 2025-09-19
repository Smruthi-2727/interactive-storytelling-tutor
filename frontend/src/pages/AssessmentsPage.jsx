import React, { useState, useEffect } from 'react';

const AssessmentsPage = ({ onBack }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // In a real app, you'd have an endpoint like /user/assessments
      // For now, we'll create mock data based on what we know works
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock assessment data based on your working system
      const mockAssessments = [
        {
          id: 1,
          story_title: "The Wise Owl and the Young Fox",
          completed_at: new Date().toISOString(),
          questions_answered: 3,
          total_score: 0.85,
          scores: [
            { question_type: "multiple_choice", question: "What was Felix's main problem?", score: 1.0, is_correct: true },
            { question_type: "short_answer", question: "What advice did Oliver give?", score: 0.8, is_correct: true },
            { question_type: "reflection", question: "Personal experience with wisdom", score: 0.75, is_correct: true }
          ]
        },
        {
          id: 2,
          story_title: "Maya's First Day Challenge", 
          completed_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          questions_answered: 3,
          total_score: 0.73,
          scores: [
            { question_type: "multiple_choice", question: "How did Maya feel?", score: 1.0, is_correct: true },
            { question_type: "short_answer", question: "Maya's strategy for friends", score: 0.6, is_correct: true },
            { question_type: "reflection", question: "Social anxiety experiences", score: 0.6, is_correct: false }
          ]
        }
      ];
      
      setAssessments(mockAssessments);
      
      // Calculate stats
      const totalAssessments = mockAssessments.length;
      const avgScore = mockAssessments.reduce((sum, a) => sum + a.total_score, 0) / totalAssessments;
      const totalQuestions = mockAssessments.reduce((sum, a) => sum + a.questions_answered, 0);
      
      setStats({
        total_assessments: totalAssessments,
        average_score: avgScore,
        total_questions: totalQuestions,
        completion_rate: 100 // Since these are completed assessments
      });
      
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
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
            Your comprehension and learning progress
          </p>
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

      {/* Assessment Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        marginBottom: '50px'
      }}>
        {/* Total Assessments */}
        <div style={{
          background: 'linear-gradient(135deg, #fef7ff, #f3e8ff)',
          padding: '40px',
          borderRadius: '20px',
          border: '3px solid #a855f7',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(168, 85, 247, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📝</div>
          <h2 style={{
            fontSize: '3.5rem',
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
            Assessments Completed
          </p>
        </div>

        {/* Average Score */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          padding: '40px',
          borderRadius: '20px',
          border: '3px solid #22c55e',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎯</div>
          <h2 style={{
            fontSize: '3.5rem',
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

        {/* Questions Answered */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
          padding: '40px',
          borderRadius: '20px',
          border: '3px solid #3b82f6',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>❓</div>
          <h2 style={{
            fontSize: '3.5rem',
            margin: '0 0 10px 0',
            color: '#1d4ed8',
            fontWeight: 'bold'
          }}>
            {stats.total_questions || 0}
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#374151', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Questions Answered
          </p>
        </div>
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
          📊 Assessment History
        </h3>

        {assessments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: '#f9fafb',
            borderRadius: '15px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
            <h4 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No assessments taken yet</h4>
            <p style={{ color: '#9ca3af', margin: 0 }}>Complete a story to take your first assessment!</p>
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
                    <p style={{ 
                      margin: 0, 
                      color: '#6b7280', 
                      fontSize: '15px' 
                    }}>
                      Completed on {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
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

                {/* Individual Question Scores */}
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
                        border: '1px solid #e5e7eb'
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
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          {score.question_type.replace('_', ' ')}
                        </span>
                        <span style={{
                          color: getScoreColor(score.score),
                          fontWeight: 'bold'
                        }}>
                          {Math.round(score.score * 100)}%
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
          Ready for More Assessments?
        </h3>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
          Complete more stories to unlock additional assessments and improve your scores!
        </p>
        <button
          onClick={() => {
            onBack();
            // This could be improved to directly navigate to stories
          }}
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
    </div>
  );
};

export default AssessmentsPage;
