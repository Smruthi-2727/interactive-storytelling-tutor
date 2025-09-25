import React, { useState, useEffect, useCallback, useRef } from 'react';

const ProgressCard = ({ onClick, refreshTrigger }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // 🚨 FIX: Prevent duplicate API calls
  const fetchAttempted = useRef(false);
  const lastRefreshTrigger = useRef(0);

  // ✅ FIX: Simplified fetch with only working endpoints
  const fetchProgress = useCallback(async (force = false) => {
    // Prevent duplicate calls unless forced (like quiz completion)
    if (!force && fetchAttempted.current) {
      console.log('🚫 ProgressCard fetch blocked - already attempted');
      return;
    }
    
    fetchAttempted.current = true;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view live progress');
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching real-time progress data...');

      // ✅ FIX: Use ONLY the working endpoint
      const progressResponse = await fetch(`http://localhost:8000/api/user/progress?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      });

      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        console.log('✅ Real-time progress loaded:', progress);

        // ✅ FIX: Use the actual backend data structure
        const processedData = {
          storiesCompleted: progress.total_stories_completed,
          totalStories: 3, // From your database
          completionPercentage: Math.round((progress.total_stories_completed / 3) * 100),
          averageScore: Math.round(progress.average_quiz_score),
          totalReadingTime: Math.round(progress.total_reading_time / 60), // Convert to minutes
          currentStreak: progress.current_streak,
          totalPoints: progress.total_points,
          lastActivity: progress.last_activity_date,
        };

        setProgressData(processedData);
        setError(null);
        setLastUpdated(new Date());
      } else if (progressResponse.status === 401) {
        setError('Authentication expired - please login again');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
      } else {
        throw new Error(`API Error: ${progressResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
      setError(`Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
      // Reset fetch protection after successful completion
      setTimeout(() => {
        fetchAttempted.current = false;
      }, 1000); // Allow refetch after 1 second
    }
  }, []);

  // ✅ FIX: Only refresh when refreshTrigger actually changes
  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current) {
      console.log('🎯 Quiz completed - refreshing progress card!');
      lastRefreshTrigger.current = refreshTrigger;
      setLoading(true);
      fetchAttempted.current = false; // Force refresh for quiz completion
      fetchProgress(true); // Force fetch
    }
  }, [refreshTrigger, fetchProgress]);

  // Initial load only once
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      fetchAttempted.current = false;
      lastRefreshTrigger.current = 0;
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        cursor: 'pointer'
      }}
      onClick={onClick}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
          <p>Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={onClick}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
        <h3>Progress Tracking</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!progressData) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '30px',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
    }}
    onClick={onClick}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
      <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>Learning Progress</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          {progressData?.storiesCompleted || 0}/{progressData?.totalStories || 3}
        </div>
        <div style={{ opacity: 0.9 }}>Stories Completed</div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        fontSize: '14px'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            {progressData?.averageScore || 0}%
          </div>
          <div style={{ opacity: 0.8 }}>Avg Score</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            {progressData?.totalPoints || 0}
          </div>
          <div style={{ opacity: 0.8 }}>Points</div>
        </div>
      </div>

      {/* Live indicator */}
      {refreshTrigger > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          🎯 Updated from Quiz #{refreshTrigger}!
        </div>
      )}

      {lastUpdated && (
        <div style={{
          marginTop: '10px',
          fontSize: '11px',
          opacity: 0.7
        }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ProgressCard;

