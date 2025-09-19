import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/auth/AuthForm';
import StoriesList from './components/story/StoriesList';
import StoryReader from './components/story/StoryReader';
import AssessmentSystem from './components/assessment/AssessmentSystem';
import ProgressPage from './pages/ProgressPage';
import AssessmentsPage from './pages/AssessmentsPage';
import AiTutor from './components/tutor/AiTutor'; // Add AI Tutor import

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication using new token system [web:84][web:86]
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('current_user');
    
    if (token && userData && token.startsWith('token_')) {
      try {
        const user = JSON.parse(userData);
        // Validate token format and user data structure
        if (user.username && user.role && user.token === token) {
          setUser(user);
        } else {
          // Invalid token or user data, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
        }
      } catch (err) {
        // Invalid user data format, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
    } else if (token) {
      // Old or invalid token format, clear it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear all authentication data [web:87][web:89]
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    setUser(null);
    setCurrentView('dashboard');
    setSelectedStory(null);
    setCurrentSession(null);
  };

  const handleSelectStory = (story) => {
    setSelectedStory(story);
    setCurrentView('reading');
  };

  const handleBackToStories = () => {
    setCurrentView('stories');
    setSelectedStory(null);
    setCurrentSession(null);
  };

  const handleStoryComplete = (session) => {
    setCurrentSession(session);
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = () => {
    setCurrentView('dashboard');
    setSelectedStory(null);
    setCurrentSession(null);
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };

  const handleViewAssessments = () => {
    setCurrentView('assessments');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Add AI Tutor navigation handler
  const handleViewAiTutor = () => {
    setCurrentView('ai-tutor');
  };

  const NavHeader = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: (currentView === 'reading' || currentView === 'assessment' || currentView === 'ai-tutor') ? 'none' : '2px solid #e5e7eb',
      marginBottom: (currentView === 'reading' || currentView === 'assessment' || currentView === 'ai-tutor') ? '0' : '30px'
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
        </h1>
      </div>
      
      {(currentView !== 'reading' && currentView !== 'assessment' && currentView !== 'ai-tutor') && (
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
            <span style={{
              color: '#6b7280',
              fontSize: '12px'
            }}>
              {user?.role} account
            </span>
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
            <h2 style={{ color: '#1f2937', margin: 0 }}>📚 Loading Storytelling Tutor...</h2>
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
        maxWidth: (currentView === 'reading' || currentView === 'assessment' || currentView === 'ai-tutor') ? '1000px' : '1200px',
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
              Logged in as <strong>{user.role}</strong> • Session Active for @{user.username} 🔐
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              marginBottom: '40px'
            }}>
              {/* Stories Card */}
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
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>Interactive Stories</h3>
                <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
                  Professionally crafted educational stories
                </p>
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
              </div>

              {/* Progress Card */}
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
              onClick={handleViewProgress}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>Learning Progress</h3>
                <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
                  Track achievements and improvement
                </p>
              </div>

              {/* Assessments Card */}
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: 'white',
                padding: '30px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
              }}
              onClick={handleViewAssessments}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏆</div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 15px 0' }}>AI Assessments</h3>
                <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
                  Intelligent feedback and scoring
                </p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '2px solid #22c55e',
              borderRadius: '16px',
              padding: '25px',
              color: '#059669'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
                ✨ Complete Educational Learning Platform
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Full Learning Experience: Stories → Interactive Reading → AI Tutor Chat → Assessment → Progress Tracking!
              </p>
            </div>
          </div>
        )}

        {currentView === 'stories' && (
          <StoriesList onSelectStory={handleSelectStory} />
        )}

        {currentView === 'reading' && selectedStory && (
          <StoryReader 
            story={selectedStory}
            onBack={handleBackToStories}
            onComplete={handleStoryComplete}
          />
        )}

        {currentView === 'assessment' && selectedStory && currentSession && (
          <AssessmentSystem
            story={selectedStory}
            session={currentSession}
            onComplete={handleAssessmentComplete}
            onBack={handleBackToStories}
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
      `}</style>
    </div>
  );
}

export default App;





