import React, { useState, useEffect } from 'react';

const AssessmentCard = ({ onClick }) => {
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchRecentAssessments();
  }, []);

  const fetchRecentAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock assessment data - you can replace this with real API call
      const mockData = [
        { id: 1, story_title: "The Wise Owl", score: 0.85, completed_at: new Date().toISOString() },
        { id: 2, story_title: "Maya's Challenge", score: 0.73, completed_at: new Date().toISOString() }
      ];
      
      setAssessmentData(mockData);
      
      // Calculate stats
      const totalAssessments = mockData.length;
      const avgScore = mockData.reduce((sum, a) => sum + a.score, 0) / totalAssessments;
      
      setStats({
        total_assessments: totalAssessments,
        average_score: avgScore,
        latest_score: mockData[0]?.score || 0
      });
      
    } catch (error) {
      console.error('Error fetching assessments:', error);
      // Set default stats on error
      setStats({
        total_assessments: 0,
        average_score: 0,
        latest_score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#059669';
    if (score >= 0.6) return '#d97706';
    return '#dc2626';
  };

  if (loading) {
    return (
      <div className="feature-card purple" style={{ cursor: 'pointer' }} onClick={onClick}>
        <span className="feature-icon">🏆</span>
        <h3 className="feature-title purple">Assessments</h3>
        <p className="feature-description">Loading assessment data...</p>
        
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: '#fef7ff',
          borderRadius: '8px',
          border: '1px solid #f3e8ff',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #f3e8ff',
              borderTop: '2px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="feature-card purple"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <span className="feature-icon">🏆</span>
      <h3 className="feature-title purple">Assessments</h3>
      <p className="feature-description">
        AI feedback on comprehension
      </p>
      
      <div style={{
        marginTop: '15px',
        padding: '15px',
        background: '#fef7ff',
        borderRadius: '8px',
        border: '1px solid #f3e8ff',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Completed:</span>
          <strong style={{ color: '#7c3aed' }}>{stats.total_assessments}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Average:</span>
          <strong style={{ color: getScoreColor(stats.average_score) }}>
            {Math.round((stats.average_score || 0) * 100)}%
          </strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Status:</span>
          <strong style={{ color: '#7c3aed' }}>
            {stats.total_assessments > 0 ? '✅ Active' : '⏳ Ready'}
          </strong>
        </div>
      </div>

      <button
        style={{
          width: '100%',
          marginTop: '15px',
          background: '#7c3aed',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = '#6d28d9';
        }}
        onMouseOut={(e) => {
          e.target.style.background = '#7c3aed';
        }}
      >
        {stats.total_assessments > 0 ? 'View Results →' : 'Start Assessment →'}
      </button>
    </div>
  );
};

export default AssessmentCard;

