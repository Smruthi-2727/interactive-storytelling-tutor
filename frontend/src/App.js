import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AuthForm from './components/auth/AuthForm';
import StoriesList from './components/story/StoriesList';
import StoryReader from './components/story/StoryReader';
import ProgressPage from './pages/ProgressPage';
import AssessmentsPage from './pages/AssessmentsPage';
import AiTutor from './components/tutor/AiTutor';
import ProgressCard from './components/dashboard/ProgressCard';
import AssessmentCard from './components/dashboard/AssessmentsCard';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // ✅ FIX: Add refresh trigger for real-time progress updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 🚨 FIX: Prevent duplicate API calls with useRef protection
  const dashboardFetchAttempted = useRef(false);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (token) {
      console.log('🔍 Found existing token, validating...');
      validateTokenAndSetUser(token);
    } else {
      console.log('ℹ️ No existing token found');
      setLoading(false);
    }
  }, []);

  // Enhanced token validation with user info extraction
  const validateTokenAndSetUser = async (token) => {
    try {
      console.log('🔄 Validating token with backend...');
      
      const response = await fetch('http://localhost:8000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Token valid, setting up user session');
        const data = await response.json();
        
        // Create user object from backend response
        const userData = {
          username: 'student', // Could be extracted from token or separate endpoint
          role: 'student',
          token: token,
          authenticated: true
        };

        setUser(userData);
        setDashboardStats(data.stats);
        setLastUpdated(new Date());
        
        // Store user data
        localStorage.setItem('current_user', JSON.stringify(userData));
      } else if (response.status === 401) {
        console.log('❌ Token expired or invalid');
        handleTokenExpired();
      } else {
        console.log('⚠️ Token validation failed:', response.status);
        handleTokenExpired();
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      // Don't clear token on network errors, user might be offline
      const userData = {
        username: 'student',
        role: 'student', 
        token: token,
        authenticated: true
      };
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // Handle token expiration
  const handleTokenExpired = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    setUser(null);
    setDashboardStats(null);
  };

  // ✅ FIX: Enhanced dashboard stats fetching with duplicate protection
  const fetchDashboardStats = async (token, isRefresh = false) => {
    // Prevent duplicate fetches unless forced refresh
    if (!isRefresh && dashboardFetchAttempted.current) {
      console.log('🚫 Dashboard stats fetch blocked - already attempted');
      return;
    }
    
    dashboardFetchAttempted.current = true;

    try {
      console.log(isRefresh ? '🔄 Refreshing dashboard stats...' : '🔄 Fetching dashboard stats...');
      
      const response = await fetch(`http://localhost:8000/api/dashboard?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats loaded:', data.stats);
        setDashboardStats(data.stats);
        setLastUpdated(new Date());
      } else if (response.status === 401) {
        console.log('❌ Authentication failed while fetching stats');
        handleTokenExpired();
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      // Use fallback stats if API fails
      if (!dashboardStats) {
        setDashboardStats({
          stories_completed: "0/3",
          total_reading_time: "0m", 
          average_score: "0%",
          current_streak: "0 days"
        });
      }
    } finally {
      // Reset fetch protection after 2 seconds to allow future refreshes
      setTimeout(() => {
        dashboardFetchAttempted.current = false;
      }, 2000);
    }
  };

  const handleLogin = (userData) => {
    console.log('✅ User logged in:', userData);
    setUser(userData);
    dashboardFetchAttempted.current = false; // Reset for new user
    fetchDashboardStats(userData.token);
  };

  const handleLogout = () => {
    console.log('🚪 User logging out');
    // Clear all authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    setUser(null);
    setCurrentView('dashboard');
    setSelectedStory(null);
    setCurrentSession(null);
    setDashboardStats(null);
    setLastUpdated(null);
    setRefreshTrigger(0); // Reset refresh trigger
    
    // Reset all ref protections
    dashboardFetchAttempted.current = false;
  };

  const handleSelectStory = (story) => {
    console.log('📖 Story selected:', story.title);
    setSelectedStory(story);
    setCurrentView('reading');
  };

  const handleBackToStories = () => {
    setCurrentView('stories');
    setSelectedStory(null);
    setCurrentSession(null);
  };

  // ✅ FIXED: Skip AssessmentSystem completely - go directly to dashboard
  const handleStoryComplete = (session) => {
    console.log('🎉 Story completed:', session);
    setCurrentSession(session);
    
    // ✅ CRITICAL FIX: Skip AssessmentSystem - go directly to dashboard since quiz is already done
    console.log('✅ Quiz already completed in StoryReader - returning to dashboard');
    setCurrentView('dashboard'); // ← CHANGED from 'assessment' to 'dashboard'
    
    // ✅ IMMEDIATE TRIGGER: Force refresh of progress and assessment cards
    console.log('🚀 TRIGGERING IMMEDIATE COMPONENT REFRESH...');
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log(`🎯 Refresh trigger updated: ${prev} -> ${newTrigger}`);
      return newTrigger;
    });
    
    // Also refresh dashboard stats (with slight delay to ensure backend is updated)
    if (user?.token && !dashboardFetchAttempted.current) {
      setTimeout(() => {
        console.log('🔄 Refreshing dashboard stats after quiz completion...');
        dashboardFetchAttempted.current = false; // Allow forced refresh
        fetchDashboardStats(user.token, true);
      }, 500);
    }
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };

  const handleViewAssessments = () => {
    setCurrentView('assessments');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    // Refresh stats when returning to dashboard (with throttling)
    if (user?.token && !dashboardFetchAttempted.current) {
      dashboardFetchAttempted.current = false; // Allow refresh
      fetchDashboardStats(user.token, true);
    }
  };

  const handleViewAiTutor = () => {
    setCurrentView('ai-tutor');
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dashboardFetchAttempted.current = false;
    };
  }, []);

  // Enhanced navigation header
  const NavHeader = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: (currentView === 'reading' || currentView === 'ai-tutor') ? 'none' : '2px solid #e5e7eb',
      marginBottom: (currentView === 'reading' || currentView === 'ai-tutor') ? '0' : '30px'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h1 style={{
          margin: 0,
          color: '#1f2937',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📚 Interactive Storytelling Tutor
          {user?.role && (
            <span style={{
              background: user.role === 'admin' ? '#dc2626' : user.role === 'teacher' ? '#059669' : '#667eea',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
          )}
          {/* Backend connection indicator */}
          {dashboardStats && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#059669',
              background: '#f0fdf4',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'pulse 2s infinite'
              }}></div>
              LIVE DATA
            </div>
          )}
          {/* Show refresh indicator */}
          {refreshTrigger > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#f59e0b',
              background: '#fefce8',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid #fef3c7'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#f59e0b',
                animation: 'pulse 1s infinite'
              }}></div>
              UPDATING
            </div>
          )}
        </h1>
      </div>
      
      {(currentView !== 'reading' && currentView !== 'ai-tutor') && (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '15px'
          }}>
            <span style={{
              color: '#1f2937',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Welcome, @{user?.username}! 👋
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                color: '#6b7280',
                fontSize: '12px'
              }}>
                {user?.role} account
              </span>
              {lastUpdated && (
                <span style={{
                  color: '#9ca3af',
                  fontSize: '10px'
                }}>
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              {refreshTrigger > 0 && (
                <span style={{
                  color: '#f59e0b',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  • Quiz #{refreshTrigger} completed!
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              background: currentView === 'dashboard' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6',
              color: currentView === 'dashboard' ? 'white' : '#374151',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            🏠 Dashboard
          </button>
          
          <button
            onClick={() => setCurrentView('stories')}
            style={{
              background: currentView === 'stories' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6',
              color: currentView === 'stories' ? 'white' : '#374151',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            📚 Stories
          </button>

          <button
            onClick={handleViewAiTutor}
            style={{
              background: currentView === 'ai-tutor' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f3f4f6',
              color: currentView === 'ai-tutor' ? 'white' : '#374151',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            🤖 AI Tutor
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>📚 Loading Interactive Storytelling Tutor...</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>Connecting to backend database...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication form if no authenticated user
  if (!user) {
    return (
      <div className="App">
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  // Main app for authenticated users
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: (currentView === 'reading' || currentView === 'ai-tutor') ? '1000px' : '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <NavHeader />
        
        {currentView === 'dashboard' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: '#1f2937',
              marginBottom: '10px'
            }}>
              🎉 Welcome to Your Learning Dashboard!
            </h2>
            
            <p style={{
              color: '#6b7280',
              fontSize: '18px',
              marginBottom: '40px'
            }}>
              Logged in as <strong>{user.role}</strong> • Live session active for @{user.username} 🔐
              {refreshTrigger > 0 && (
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {' '}• {refreshTrigger} quiz{refreshTrigger === 1 ? '' : 's'} completed! 🎯
                </span>
              )}
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              marginBottom: '40px'
            }}>
              {/* 3-Scene Stories Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '30px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
              }}
              onClick={() => setCurrentView('stories')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>3-Scene Stories</h3>
                <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
                  Interactive storytelling with comprehension quizzes
                </p>
                <div style={{ 
                  fontSize: '14px', 
                  opacity: 0.8,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  margin: '10px auto',
                  display: 'inline-block'
                }}>
                  📖 Read → 🧠 Quiz → 📊 Track Progress
                </div>
              </div>

              {/* AI Tutor Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '30px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
              }}
              onClick={handleViewAiTutor}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🤖</div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>AI Tutor Chat</h3>
                <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
                  Get personalized help and explanations
                </p>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Intelligent assistance for your learning journey
                </div>
              </div>

              {/* ✅ FIX: Use the updated ProgressCard with refreshTrigger prop */}
              <ProgressCard 
                onClick={handleViewProgress} 
                refreshTrigger={refreshTrigger}
              />

              {/* ✅ FIX: Use the updated AssessmentCard with refreshTrigger prop */}
              <AssessmentCard 
                onClick={handleViewAssessments} 
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Enhanced status banner with real-time data */}
            <div style={{
              background: dashboardStats 
                ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                : 'linear-gradient(135deg, #fef7ff, #f3e8ff)',
              border: `2px solid ${dashboardStats ? '#22c55e' : '#a855f7'}`,
              borderRadius: '16px',
              padding: '25px',
              color: dashboardStats ? '#059669' : '#7c3aed'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
                {dashboardStats ? '🟢 Live Backend Connection Active' : '🔄 Connecting to Backend...'}
                {refreshTrigger > 0 && (
                  <span style={{ color: '#f59e0b', marginLeft: '10px' }}>
                    • {refreshTrigger} Quiz{refreshTrigger === 1 ? '' : 's'} Completed! 🎯
                  </span>
                )}
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {dashboardStats 
                  ? `Real-time progress tracking • Stories: ${dashboardStats.stories_completed} • Average: ${dashboardStats.average_score} • Reading time: ${dashboardStats.total_reading_time}`
                  : 'Setting up your personalized learning experience with real-time progress tracking...'
                }
              </p>
            </div>
          </div>
        )}

        {currentView === 'stories' && (
          <StoriesList 
            onSelectStory={handleSelectStory} 
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'reading' && selectedStory && (
          <StoryReader 
            story={selectedStory}
            onBack={handleBackToStories}
            onComplete={handleStoryComplete}
          />
        )}

        {/* AI Tutor View */}
        {currentView === 'ai-tutor' && (
          <AiTutor 
            user={user}
            onBack={handleBackToDashboard}
            currentStory={selectedStory}
          />
        )}

        {currentView === 'progress' && (
          <ProgressPage onBack={handleBackToDashboard} />
        )}

        {currentView === 'assessments' && (
          <AssessmentsPage onBack={handleBackToDashboard} />
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default App;