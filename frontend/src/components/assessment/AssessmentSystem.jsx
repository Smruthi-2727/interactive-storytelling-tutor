import React, { useState, useEffect } from 'react';

const AssessmentSystem = ({ story, session, onComplete, onBack }) => {
  const [showResults, setShowResults] = useState(true); // ✅ Show results immediately
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    // ✅ Skip quiz entirely - go straight to showing results from the session
    console.log('🚫 AssessmentSystem: Skipping quiz questions - already completed in StoryReader');
    
    if (session && session.quiz_score !== undefined) {
      // Use the results from the session that was already completed in StoryReader
      setQuizResults({
        score: session.quiz_score || 0,
        correct_answers: session.correct_answers || 0,
        total_questions: session.total_questions || 5,
        detailed_feedback: {
          overall_feedback: `Great job! You completed the story and quiz successfully! Your session is already saved.`
        }
      });
    } else {
      // Fallback results
      setQuizResults({
        score: 0,
        correct_answers: 0,
        total_questions: 5,
        detailed_feedback: {
          overall_feedback: `Quiz completed in StoryReader - returning to dashboard.`
        }
      });
    }
  }, [session]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! You understood the story perfectly! 🌟";
    if (score >= 60) return "Good work! You grasped most of the story's key points! 👍";
    return "Keep practicing! Try reading the story again! 📚";
  };

  // ✅ ONLY show results - no quiz questions at all
  if (showResults && quizResults) {
    const score = quizResults.score || 0;
    const correctAnswers = quizResults.correct_answers || 0;
    const totalQuestions = quizResults.total_questions || 5;

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            🎉
          </div>

          <h1 style={{
            color: '#1f2937',
            fontSize: '2.5rem',
            marginBottom: '20px'
          }}>
            Story & Quiz Complete!
          </h1>

          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: getScoreColor(score),
            marginBottom: '20px'
          }}>
            {Math.round(score)}%
          </div>

          <p style={{
            fontSize: '18px',
            color: '#374151',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            {getScoreMessage(score)}
          </p>

          {/* Session info */}
          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>
              📊 Final Results: {correctAnswers} out of {totalQuestions} correct
            </h3>
            <p style={{ color: '#6b7280' }}>
              Your quiz was completed and saved successfully in your learning progress.
            </p>
          </div>

          {/* Feedback */}
          {quizResults.detailed_feedback?.overall_feedback && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              border: '2px solid #0ea5e9',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              <h4 style={{ color: '#0c4a6e', marginBottom: '10px' }}>🎉 Congratulations!</h4>
              <p style={{ color: '#0c4a6e', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
                {quizResults.detailed_feedback.overall_feedback}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={onComplete}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏠 Back to Dashboard
            </button>

            <button
              onClick={onBack}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📚 Try Another Story
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading state (shouldn't normally show)
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#1f2937' }}>Preparing results...</h2>
        <p style={{ color: '#6b7280' }}>Quiz already completed!</p>
        <button onClick={onComplete} style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AssessmentSystem;
