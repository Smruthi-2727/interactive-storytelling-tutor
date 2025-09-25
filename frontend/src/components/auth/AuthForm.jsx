



import React, { useState, useEffect } from 'react';

const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('current_user', JSON.stringify({
            username: formData.username,
            token: data.access_token,
            authenticated: true
          }));
          onLogin({
            username: formData.username,
            token: data.access_token,
            authenticated: true,
          });
        } else {
          setIsLogin(true);
          setError('Account created! Please login.');
          setFormData({ username: '', email: '', full_name: '', password: '' });
        }
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Left Panel */}
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
        <div style={{
          fontSize: '5rem',
          marginBottom: '30px',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}>
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
          Interactive Storytelling Tutor
        </h1>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '400',
          margin: '0 0 30px 0',
          color: '#e2e8f0',
          lineHeight: '1.4'
        }}>
          An immersive learning platform
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
            "Transforming education with personalized storytelling and engaging quizzes."
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
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
          {/* Current Time */}
          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b' }}>
            {currentTime.toLocaleString()}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px'
              }}
              required
            />

            {!isLogin && <>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                required
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                required
              />
            </>}

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
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

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <strong>⚠️</strong> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease'
              }}
            >
              {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setFormData({ username: '', email: '', full_name: '', password: '' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: '600' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setFormData({ username: '', email: '', full_name: '', password: '' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: '600' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating background circles animation style */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthForm;
