import React, { useState, useEffect } from 'react';

const ProgressPage = ({ onBack }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found');
        setError('Please login to view your progress');
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching progress data from backend...');

      // Fetch user progress and sessions in parallel
      const [progressResponse, sessionsResponse, storiesResponse] = await Promise.all([
        fetch('http://localhost:8000/api/user/progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/user/sessions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/stories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (progressResponse.ok && sessionsResponse.ok && storiesResponse.ok) {
        const progress = await progressResponse.json();
        const sessions = await sessionsResponse.json();
        const stories = await storiesResponse.json();

        console.log('✅ Progress data loaded:', { progress, sessions, stories });

        // Process the data to match our UI needs
        const processedData = processProgressData(progress, sessions, stories);
        setProgressData(processedData);

      } else {
        const errorStatus = [progressResponse, sessionsResponse, storiesResponse]
          .find(resp => !resp.ok)?.status;
        
        if (errorStatus === 401) {
          setError('Authentication failed - please login again');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
        } else {
          throw new Error(`Failed to fetch progress data: ${errorStatus}`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
      setError('Failed to load progress data');
      // Load fallback data for development
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const processProgressData = (progress, sessions, stories) => {
    // Calculate completion stats
    const completedSessions = sessions.filter(s => s.is_completed);
    const totalStories = stories.length;
    const storiesCompleted = completedSessions.length;
    
    // Calculate average score
    const avgScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.quiz_score || 0), 0) / completedSessions.length)
      : 0;

    // Calculate total reading time (convert seconds to minutes)
    const totalReadingTime = Math.round(
      sessions.reduce((sum, s) => sum + (s.total_reading_time || 0), 0) / 60
    );

    // Generate achievements based on actual progress
    const achievements = generateAchievements(progress, sessions, completedSessions);

    // Generate recent activity from sessions
    const recentActivity = generateRecentActivity(sessions);

    // Map story progress
    const storyProgress = stories.map(story => {
      const userSessions = sessions.filter(s => s.story_id === story.id);
      const completed = userSessions.some(s => s.is_completed);
      const inProgress = userSessions.some(s => !s.is_completed && s.scenes_completed > 0);
      
      let progress = 0;
      let status = 'Not Started';
      let color = '#e5e7eb';

      if (completed) {
        progress = 100;
        status = 'Completed';
        color = '#22c55e';
      } else if (inProgress) {
        const latestSession = userSessions[userSessions.length - 1];
        progress = Math.round(((latestSession.scenes_completed || 0) / (story.total_scenes || 3)) * 100);
        status = 'In Progress';
        color = '#f59e0b';
      }

      return {
        title: story.title,
        progress,
        status,
        color
      };
    });

    return {
      storiesCompleted,
      totalStories,
      totalReadingTime,
      averageScore: avgScore,
      currentStreak: progress?.current_streak || 0,
      longestStreak: progress?.longest_streak || 0,
      totalPoints: progress?.total_points || storiesCompleted * 100,
      achievements,
      recentActivity,
      storyProgress
    };
  };

  const generateAchievements = (progress, sessions, completedSessions) => {
    const achievements = [
      {
        id: 1,
        title: 'First Story',
        description: 'Completed your first story',
        earned: completedSessions.length >= 1,
        icon: '📖'
      },
      {
        id: 2,
        title: 'Quiz Master',
        description: 'Scored 90% or higher on a quiz',
        earned: completedSessions.some(s => (s.quiz_score || 0) >= 90),
        icon: '🎯'
      },
      {
        id: 3,
        title: 'Story Explorer',
        description: 'Completed 3 different stories',
        earned: completedSessions.length >= 3,
        icon: '🗺️'
      },
      {
        id: 4,
        title: 'Reading Streak',
        description: '3 days of consistent reading',
        earned: (progress?.current_streak || 0) >= 3,
        icon: '🔥'
      },
      {
        id: 5,
        title: 'Perfect Score',
        description: 'Achieved 100% on a quiz',
        earned: completedSessions.some(s => (s.quiz_score || 0) >= 100),
        icon: '⭐'
      },
      {
        id: 6,
        title: 'Dedicated Reader',
        description: 'Spent 30+ minutes reading',
        earned: sessions.reduce((sum, s) => sum + (s.total_reading_time || 0), 0) >= 1800, // 30 min in seconds
        icon: '📚'
      }
    ];

    return achievements;
  };

  const generateRecentActivity = (sessions) => {
    const activities = [];

    // Sort sessions by most recent
    const sortedSessions = sessions
      .filter(s => s.started_at)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, 6); // Get last 6 activities

    sortedSessions.forEach(session => {
      if (session.is_completed) {
        activities.push({
          id: `completed-${session.id}`,
          action: `Completed "${session.story?.title || 'Story'}"`,
          time: formatTimeAgo(new Date(session.completed_at || session.started_at)),
          score: session.quiz_score
        });
      } else if (session.scenes_completed > 0) {
        activities.push({
          id: `progress-${session.id}`,
          action: `Reading "${session.story?.title || 'Story'}" - Scene ${session.scenes_completed}`,
          time: formatTimeAgo(new Date(session.started_at)),
          score: null
        });
      } else {
        activities.push({
          id: `started-${session.id}`,
          action: `Started "${session.story?.title || 'Story'}"`,
          time: formatTimeAgo(new Date(session.started_at)),
          score: null
        });
      }
    });

    return activities.slice(0, 4); // Show only 4 most recent
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Fallback data for development/offline mode
  const loadFallbackData = () => {
    console.log('📚 Loading fallback progress data');
    setProgressData({
      storiesCompleted: 1,
      totalStories: 3,
      totalReadingTime: 8,
      averageScore: 85,
      currentStreak: 1,
      longestStreak: 1,
      totalPoints: 100,
      achievements: [
        { id: 1, title: 'First Story', description: 'Completed your first story', earned: true, icon: '📖' },
        { id: 2, title: 'Quiz Master', description: 'Scored 90% or higher', earned: false, icon: '🎯' },
        { id: 3, title: 'Story Explorer', description: 'Completed 3 stories', earned: false, icon: '🗺️' },
        { id: 4, title: 'Reading Streak', description: '3 days consistent reading', earned: false, icon: '🔥' }
      ],
      recentActivity: [
        { id: 1, action: 'Completed "The Wise Owl and the Young Fox"', time: '1 hour ago', score: 85 }
      ],
      storyProgress: [
        { title: 'The Wise Owl and the Young Fox', progress: 100, status: 'Completed', color: '#22c55e' },
        { title: "Maya's First Day Challenge", progress: 0, status: 'Not Started', color: '#e5e7eb' },
        { title: 'The Garden of Patience', progress: 0, status: 'Not Started', color: '#e5e7eb' }
      ]
    });
  };

  const completionPercentage = progressData 
    ? Math.round((progressData.storiesCompleted / progressData.totalStories) * 100) 
    : 0;

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📊 Loading Your Progress...</h2>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
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

  if (!progressData) return null;

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
          <p style={{ margin: '5px 0 0 0', color: '#10b981', fontSize: '14px' }}>
            🔗 Live data from your backend database
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
        gap: '25px',
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
            {progressData.totalReadingTime > 30 ? 'Excellent dedication!' : 'Keep reading!'}
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
            {progressData.averageScore >= 80 ? 'Excellent performance!' : 
             progressData.averageScore >= 60 ? 'Good progress!' : 'Keep practicing!'}
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
            {progressData.currentStreak >= 3 ? 'Amazing streak! 🔥' : 'Keep it up!'}
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
            🏆 Achievements ({progressData.achievements.filter(a => a.earned).length}/{progressData.achievements.length})
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
          {progressData.recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
              <p>Start reading stories to see your activity!</p>
            </div>
          ) : (
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
          )}
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
          📖 Individual Story Progress
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {progressData.storyProgress.map((story, index) => (
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProgressPage;

