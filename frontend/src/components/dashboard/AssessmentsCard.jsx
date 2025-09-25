import React, { useState, useEffect, useRef } from 'react';

const AssessmentCard = ({ onClick, refreshTrigger }) => {
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  
  // 🚨 FIX: Prevent duplicate API calls
  const fetchAttempted = useRef(false);
  const lastRefreshTrigger = useRef(0);

  useEffect(() => {
    fetchAssessments();
  }, []);

  // ✅ FIX: Only refresh when refreshTrigger actually changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current) {
      console.log('🎯 ASSESSMENT REFRESH TRIGGER - Quiz completed! Refreshing assessments...');
      lastRefreshTrigger.current = refreshTrigger;
      setLoading(true);
      fetchAttempted.current = false; // Force refresh for quiz completion
      fetchAssessments(true);
    }
  }, [refreshTrigger]);

  const fetchAssessments = async (forceRefresh = false) => {
    // Prevent duplicate calls unless forced (like quiz completion)
    if (!forceRefresh && fetchAttempted.current) {
      console.log('🚫 AssessmentCard fetch blocked - already attempted');
      return;
    }
    
    fetchAttempted.current = true;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found for assessment card');
        loadFallbackData();
        setLoading(false);
        return;
      }

      if (forceRefresh) {
        console.log('🚀 FORCE REFRESH ASSESSMENTS - Quiz completed!');
      } else {
        console.log('🔄 Fetching assessment data for dashboard card...');
      }
      
      // ✅ FIX: Use the correct API endpoint that we know works
      const cacheParam = forceRefresh ? `?force=${Date.now()}` : `?t=${Date.now()}`;
      
      const response = await fetch(`http://localhost:8000/api/user/assessments${cacheParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Assessments data loaded for card:', data);
        
        if (forceRefresh) {
          console.log('🎯 IMMEDIATE ASSESSMENT UPDATE - New quiz results loaded!');
        }
        
        // Process the assessment data
        const assessments = data.assessments || [];
        const recentAssessments = assessments.slice(0, 5); // Get last 5
        
        setAssessmentData(recentAssessments);
        
        // Calculate stats from the API response
        setStats({
          total_assessments: data.overall_stats?.total_assessments || 0,
          average_score: (data.overall_stats?.average_score || 0) / 100, // Convert to decimal
          latest_score: assessments.length > 0 ? (assessments[0].quiz_score || 0) / 100 : 0,
          latest_story: assessments.length > 0 ? assessments[0].story_title : "",
          best_score: Math.max(0, ...(assessments.map(a => a.quiz_score || 0))) / 100,
          total_questions_answered: data.overall_stats?.total_questions || 0
        });

        setError(null);
      } else if (response.status === 401) {
        console.log('❌ Authentication failed for assessment card');
        setError('Please login to view quiz results');
        loadFallbackData();
      } else {
        throw new Error(`Failed to fetch assessments: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching assessments for card:', error);
      setError('Connection error');
      loadFallbackData();
    } finally {
      setLoading(false);
      // Reset fetch protection after successful completion
      setTimeout(() => {
        fetchAttempted.current = false;
      }, 1000); // Allow refetch after 1 second
    }
  };

  const loadFallbackData = () => {
    console.log('📚 Loading fallback assessment data for card');
    const mockData = [
      { 
        id: 1, 
        story_title: "Take your first quiz", 
        quiz_score: 0,
        completed_at: new Date().toISOString(),
      }
    ];
    
    setAssessmentData(mockData);
    
    setStats({
      total_assessments: 0,
      average_score: 0,
      latest_score: 0,
      latest_story: "",
      best_score: 0,
      total_questions_answered: 0
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      fetchAttempted.current = false;
      lastRefreshTrigger.current = 0;
    };
  }, []);

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#059669'; // Green for excellent
    if (score >= 0.6) return '#d97706'; // Orange for good
    return '#dc2626'; // Red for needs improvement
  };

  const getPerformanceLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Improving';
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }} onClick={onClick}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
        <h3>Quiz Results</h3>
        <p>{refreshTrigger ? 'Updating quiz performance...' : 'Loading your quiz performance...'}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      color: 'white',
      padding: '30px',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
    }}
    onClick={onClick}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header with refresh indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '3rem' }}>🧠</div>
        {refreshTrigger > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              animation: 'pulse 1s infinite'
            }}></div>
            <span style={{ fontSize: '10px', fontWeight: '600' }}>
              UPDATED
            </span>
          </div>
        )}
      </div>
      
      <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>Quiz Results</h3>
      <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
        Your story comprehension performance
      </p>
      
      {/* Main stats display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            {stats.total_assessments}
          </div>
          <div style={{ opacity: 0.8 }}>Quizzes</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            {Math.round((stats.average_score || 0) * 100)}%
          </div>
          <div style={{ opacity: 0.8 }}>Average</div>
        </div>
      </div>

      {/* Performance indicator */}
      {stats.total_assessments > 0 && (
        <div style={{
          padding: '10px 15px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          fontSize: '14px',
          marginBottom: '15px'
        }}>
          Performance: <strong>{getPerformanceLabel(stats.average_score)}</strong>
        </div>
      )}

      {/* Live indicator */}
      {refreshTrigger > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(245, 158, 11, 0.2)',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          🎯 Updated from Quiz #{refreshTrigger}!
        </div>
      )}

      {/* Latest quiz info */}
      {stats.latest_story && stats.total_assessments > 0 && (
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '12px',
          marginBottom: '15px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Latest: {stats.latest_story.length > 25 ? stats.latest_story.substring(0, 25) + "..." : stats.latest_story}
          </div>
          <div>
            Score: {Math.round((stats.latest_score || 0) * 100)}%
          </div>
        </div>
      )}

      <div style={{
        fontSize: '14px',
        fontWeight: '600'
      }}>
        {stats.total_assessments > 0 ? (
          `📊 View All ${stats.total_assessments} Results →`
        ) : (
          '🎯 Take Your First Quiz →'
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default AssessmentCard;
