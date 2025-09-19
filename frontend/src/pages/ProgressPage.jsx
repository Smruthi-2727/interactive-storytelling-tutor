import React, { useState, useEffect } from 'react';

const ProgressPage = ({ onBack }) => {
  const [progressData, setProgressData] = useState({
    storiesCompleted: 2,
    totalStories: 4,
    totalReadingTime: 45,
    averageScore: 85,
    currentStreak: 5,
    achievements: [
      { id: 1, title: 'First Story', description: 'Completed your first story', earned: true, icon: '📖' },
      { id: 2, title: 'Character Expert', description: 'Answered 5 character questions correctly', earned: true, icon: '🎭' },
      { id: 3, title: 'Moral Master', description: 'Identified 3 story morals correctly', earned: false, icon: '💡' },
      { id: 4, title: 'Reading Streak', description: '7 days of consistent reading', earned: false, icon: '🔥' }
    ],
    recentActivity: [
      { id: 1, action: 'Completed "The Lion and the Mouse"', time: '2 hours ago', score: 92 },
      { id: 2, action: 'Started "The Tortoise and the Hare"', time: '1 day ago', score: null },
      { id: 3, action: 'Answered character question', time: '2 days ago', score: 88 },
      { id: 4, action: 'Completed assessment', time: '3 days ago', score: 95 }
    ]
  });
  const [loading, setLoading] = useState(false);

  const completionPercentage = Math.round((progressData.storiesCompleted / progressData.totalStories) * 100);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>
            📊 Your Learning Progress
          </h1>
          <p style={{ color: '#6b7280', fontSize: '18px', margin: 0 }}>
            Track your storytelling journey and achievements
          </p>
        </div>
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
          ← Back to Dashboard
        </button>
      </div>

      {/* Progress Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Stories Progress */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
          <h3 style={{ color: '#1f2937', fontSize: '1.3rem', marginBottom: '10px' }}>
            Stories Completed
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
            {progressData.storiesCompleted}/{progressData.totalStories}
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: getProgressColor(completionPercentage),
              transition: 'width 0.5s ease'
            }} />
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '10px 0 0 0' }}>
            {completionPercentage}% Complete
          </p>
        </div>

        {/* Reading Time */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⏰</div>
          <h3 style={{ color: '#1f2937', fontSize: '1.3rem', marginBottom: '10px' }}>
            Total Reading Time
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
            {formatTime(progressData.totalReadingTime)}
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Great dedication!
          </p>
        </div>

        {/* Average Score */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
          <h3 style={{ color: '#1f2937', fontSize: '1.3rem', marginBottom: '10px' }}>
            Average Score
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '10px' }}>
            {progressData.averageScore}%
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Excellent performance!
          </p>
        </div>

        {/* Current Streak */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔥</div>
          <h3 style={{ color: '#1f2937', fontSize: '1.3rem', marginBottom: '10px' }}>
            Current Streak
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '10px' }}>
            {progressData.currentStreak} days
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Keep it up!
          </p>
        </div>
      </div>

      {/* Achievements and Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Achievements */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏆 Achievements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {progressData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  borderRadius: '8px',
                  background: achievement.earned ? '#f0fdf4' : '#f9fafb',
                  border: achievement.earned ? '2px solid #22c55e' : '2px solid #e5e7eb',
                  opacity: achievement.earned ? 1 : 0.6
                }}
              >
                <div style={{ fontSize: '2rem' }}>
                  {achievement.earned ? achievement.icon : '🔒'}
                </div>
                <div>
                  <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '16px' }}>
                    {achievement.title}
                  </h4>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div style={{
                    marginLeft: 'auto',
                    background: '#22c55e',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ✓ EARNED
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📈 Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {progressData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <p style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '500' }}>
                    {activity.action}
                  </p>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>
                    {activity.time}
                  </p>
                </div>
                {activity.score && (
                  <div style={{
                    background: activity.score >= 90 ? '#22c55e' : activity.score >= 80 ? '#f59e0b' : '#ef4444',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {activity.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Progress Details */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '20px' }}>
          📖 Story Progress
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { title: 'The Lion and the Mouse', progress: 100, status: 'Completed', color: '#22c55e' },
            { title: 'The Tortoise and the Hare', progress: 75, status: 'In Progress', color: '#f59e0b' },
            { title: 'The Boy Who Cried Wolf', progress: 0, status: 'Not Started', color: '#e5e7eb' },
            { title: 'The Ant and the Grasshopper', progress: 0, status: 'Not Started', color: '#e5e7eb' }
          ].map((story, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${story.color}`,
                background: story.progress > 0 ? `${story.color}10` : '#f9fafb'
              }}
            >
              <h4 style={{ color: '#1f2937', fontSize: '16px', margin: '0 0 10px 0' }}>
                {story.title}
              </h4>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#e5e7eb',
                borderRadius: '3px',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: `${story.progress}%`,
                  height: '100%',
                  background: story.color,
                  borderRadius: '3px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: story.color }}>
                  {story.status}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {story.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
