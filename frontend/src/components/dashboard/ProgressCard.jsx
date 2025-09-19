import React, { useState, useEffect } from 'react';

const ProgressCard = ({ onClick }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="feature-card green" style={{ cursor: 'pointer' }} onClick={onClick}>
        <span className="feature-icon">📊</span>
        <h3 className="feature-title green">Progress</h3>
        <p className="feature-description">Loading your progress...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const completionRate = stats.stories_completed > 0 
    ? Math.round((stats.stories_completed / stats.total_sessions) * 100) 
    : 0;

  return (
    <div className="feature-card green" style={{ cursor: 'pointer' }} onClick={onClick}>
      <span className="feature-icon">📊</span>
      <h3 className="feature-title green">Progress</h3>
      <p className="feature-description">Track your learning journey</p>
      
      <div style={{
        marginTop: '15px',
        padding: '15px',
        background: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #dcfce7'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Stories Completed:</span>
          <strong style={{ color: '#059669' }}>{stats.stories_completed || 0}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Average Score:</span>
          <strong style={{ color: '#059669' }}>{Math.round((stats.average_score || 0) * 100)}%</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Completion Rate:</span>
          <strong style={{ color: '#059669' }}>{completionRate}%</strong>
        </div>
      </div>
      
      <button
        style={{
          width: '100%',
          marginTop: '15px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        View Detailed Progress →
      </button>
    </div>
  );
};

export default ProgressCard;
