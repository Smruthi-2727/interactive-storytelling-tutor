import React, { useState } from 'react';

const AssessmentSystem = ({ story, session, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Assessment questions for each story
  const getQuestions = (storyTitle) => {
    const questions = {
      "The Lion and the Mouse": [
        {
          id: 1,
          question: "What was the main lesson in this story?",
          options: [
            "Always rush to get things done",
            "No act of kindness, however small, is ever wasted",
            "Avoid asking for help",
            "Give up when things are difficult"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "How did the mouse help the lion?",
          options: [
            "By bringing food",
            "By scaring away hunters",
            "By gnawing through the ropes",
            "By calling for help"
          ],
          correct: 2
        },
        {
          id: 3,
          question: "What does this story teach about friendship?",
          options: [
            "Size doesn't matter in friendship",
            "Only big friends are helpful",
            "Friends should be similar",
            "Friendship is not important"
          ],
          correct: 0
        }
      ],
      "The Tortoise and the Hare": [
        {
          id: 1,
          question: "What was the main lesson of this story?",
          options: [
            "Fast is always better",
            "Slow and steady wins the race",
            "Sleep is important",
            "Racing is fun"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "Why did the hare lose the race?",
          options: [
            "He got injured",
            "He took a wrong turn",
            "He became overconfident and took a nap",
            "The tortoise cheated"
          ],
          correct: 2
        },
        {
          id: 3,
          question: "What quality helped the tortoise win?",
          options: [
            "Speed",
            "Persistence and determination",
            "Luck",
            "Cheating"
          ],
          correct: 1
        }
      ],
      "The Boy Who Cried Wolf": [
        {
          id: 1,
          question: "What is the main moral of this story?",
          options: [
            "Wolves are dangerous",
            "Nobody believes a liar, even when telling the truth",
            "Shepherds have easy jobs",
            "Villages are safe places"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "Why didn't the villagers come when there was a real wolf?",
          options: [
            "They were busy",
            "They didn't hear him",
            "They thought he was lying again",
            "They were afraid"
          ],
          correct: 2
        },
        {
          id: 3,
          question: "What should the boy have done differently?",
          options: [
            "Shout louder",
            "Been honest from the beginning",
            "Run away from the sheep",
            "Find a new job"
          ],
          correct: 1
        }
      ],
      "The Ant and the Grasshopper": [
        {
          id: 1,
          question: "What lesson does this story teach?",
          options: [
            "Summer is better than winter",
            "It's best to prepare for days of necessity",
            "Music is more important than work",
            "Ants are mean"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "What did the ant do during summer?",
          options: [
            "Played music",
            "Slept all day",
            "Collected food for winter",
            "Danced with grasshopper"
          ],
          correct: 2
        },
        {
          id: 3,
          question: "What happened to the grasshopper in winter?",
          options: [
            "He found plenty of food",
            "He went on vacation",
            "He was dying of hunger",
            "He learned to sing better"
          ],
          correct: 2
        }
      ]
    };

    return questions[storyTitle] || questions["The Lion and the Mouse"];
  };

  const questions = getQuestions(story.title);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctAnswers++;
      }
    });
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    setScore(percentage);
    setShowResults(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return "Excellent! You understood the story very well! 🌟";
    if (score >= 60) return "Good work! You got most of the story's message! 👍";
    return "Keep practicing! Try reading the story again! 📚";
  };

  if (showResults) {
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
            {score >= 80 ? '🎉' : score >= 60 ? '👏' : '📚'}
          </div>

          <h1 style={{
            color: '#1f2937',
            fontSize: '2.5rem',
            marginBottom: '20px'
          }}>
            Assessment Complete!
          </h1>

          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: getScoreColor(score),
            marginBottom: '20px'
          }}>
            {score}%
          </div>

          <p style={{
            fontSize: '18px',
            color: '#374151',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            {getScoreMessage(score)}
          </p>

          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>Results Summary:</h3>
            {questions.map((question, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < questions.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <span>Question {index + 1}</span>
                <span style={{
                  color: answers[index] === question.correct ? '#22c55e' : '#ef4444',
                  fontWeight: 'bold'
                }}>
                  {answers[index] === question.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
            ))}
          </div>

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
                cursor: 'pointer'
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
                cursor: 'pointer'
              }}
            >
              📚 Try Another Story
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back to Stories
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: '#1f2937',
            fontSize: '1.8rem',
            margin: '0 0 5px 0'
          }}>
            📝 Assessment: {story.title}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div style={{ width: '120px' }}></div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '40px'
      }}>
        <div style={{
          width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          height: '100%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontSize: '1.5rem',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          {currentQ.question}
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              style={{
                background: selectedAnswer === index ? '#3b82f6' : 'white',
                color: selectedAnswer === index ? 'white' : '#374151',
                border: `2px solid ${selectedAnswer === index ? '#3b82f6' : '#e5e7eb'}`,
                padding: '20px',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontWeight: selectedAnswer === index ? '600' : '400'
              }}
              onMouseOver={(e) => {
                if (selectedAnswer !== index) {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseOut={(e) => {
                if (selectedAnswer !== index) {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              <span style={{
                fontWeight: 'bold',
                marginRight: '15px',
                fontSize: '18px'
              }}>
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            style={{
              background: selectedAnswer !== undefined ? 'linear-gradient(135deg, #10b981, #059669)' : '#d1d5db',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: selectedAnswer !== undefined ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              minWidth: '200px'
            }}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Complete Assessment 🎯'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSystem;

