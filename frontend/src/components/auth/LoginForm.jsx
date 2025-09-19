import React, { useState, useEffect } from 'react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDemoCards, setShowDemoCards] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Demo accounts that work with your backend
  const demoAccounts = [
    {
      username: 'demo_student',
      password: 'demo123',
      role: 'Student',
      icon: '🧑‍🎓',
      color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      description: 'Learning Mode'
    },
    {
      username: 'teacher',
      password: 'teach123', 
      role: 'Teacher',
      icon: '👩‍🏫',
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      description: 'Educator Access'
    },
    {
      username: 'admin',
      password: 'admin123',
      role: 'Admin',
      icon: '👑',
      color: 'linear-gradient(135deg, #ef4444, #dc2626)',
      description: 'Full Control'
    },
    {
      username: 'guest',
      password: 'guest123',
      role: 'Guest',
      icon: '👤',
      color: 'linear-gradient(135deg, #6b7280, #4b5563)',
      description: 'Limited Access'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // **KEY FIX: Use your actual backend login endpoint**
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the REAL token from backend
        localStorage.setItem('token', data.access_token);
        
        // Call parent with real backend data
        onLogin({
          token: data.access_token,
          username: username,
          user_id: data.user_id,
          role: demoAccounts.find(acc => acc.username === username)?.role || 'User'
        });
      } else {
        setError(data.detail || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
    
    // Auto-submit with real backend call
    setTimeout(async () => {
      setLoading(true);
      
      try {
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: account.username,
            password: account.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          onLogin({
            token: data.access_token,
            username: account.username,
            user_id: data.user_id,
            role: account.role
          });
        } else {
          setError(data.detail || 'Demo login failed');
        }
      } catch (error) {
        setError('Connection error during demo login');
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      {/* Main Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
      }}>
        
        {/* Left Panel - Branding */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '30px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>
            🎓
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            margin: '0 0 20px 0',
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            EduTech Pro
          </h1>
          
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            margin: '0 0 30px 0',
            color: '#e2e8f0',
            lineHeight: '1.4'
          }}>
            Interactive Learning Platform
          </h2>
          
          <div style={{
            padding: '25px 35px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '400px'
            }}>
              "Transforming education through interactive storytelling and personalized learning experiences."
            </p>
          </div>

          <div style={{
            marginTop: '40px',
            color: '#94a3b8',
            fontSize: '0.9rem'
          }}>
            <div>🌟 AI-Powered Learning</div>
            <div>📊 Real-time Analytics</div>
            <div>🔒 Secure Authentication</div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(10px)'
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '50px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '450px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Welcome Back
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '1rem',
                margin: 0
              }}>
                Sign in to your learning account
              </p>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                marginTop: '5px'
              }}>
                {currentTime.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    style={{
                      width: '100%',
                      padding: '16px 20px 16px 50px',
                      border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = '#ffffff';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
                      e.target.style.background = '#fafafa';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '18px'
                  }}>
                    👤
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 50px',
                      border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = '#ffffff';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
                      e.target.style.background = '#fafafa';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '18px'
                  }}>
                    🔐
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '18px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#6b7280'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  color: '#dc2626',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '25px',
                  fontSize: '14px',
                  textAlign: 'center',
                  border: '1px solid #f87171',
                  boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '5px' }}>⚠️</div>
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '30px',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(0)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '10px'
                    }}></div>
                    Signing In...
                  </div>
                ) : (
                  '🚀 Sign In to Platform'
                )}
              </button>
            </form>

            {/* Demo Accounts Section */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '25px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h4 style={{ 
                  margin: 0, 
                  color: '#374151', 
                  fontSize: '16px',
                  fontWeight: '600' 
                }}>
                  Demo Accounts
                </h4>
                <button
                  onClick={() => setShowDemoCards(!showDemoCards)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  {showDemoCards ? '▼ Hide' : '▶ Show'}
                </button>
              </div>
              
              {showDemoCards && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px'
                }}>
                  {demoAccounts.map((account) => (
                    <button
                      key={account.username}
                      onClick={() => handleDemoLogin(account)}
                      disabled={loading}
                      style={{
                        background: loading ? '#f3f4f6' : account.color,
                        color: loading ? '#6b7280' : 'white',
                        border: 'none',
                        padding: '16px 12px',
                        borderRadius: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: loading ? 'none' : '0 3px 10px rgba(0,0,0,0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(-3px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                        {account.icon}
                      </div>
                      <div style={{ marginBottom: '2px', fontWeight: '700' }}>
                        {account.username}
                      </div>
                      <div style={{ 
                        fontSize: '9px', 
                        opacity: 0.9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {account.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '30px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              <div>🔒 Secure Backend Authentication</div>
              <div style={{ marginTop: '5px' }}>
                © 2024 EduTech Pro Platform
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginForm;




