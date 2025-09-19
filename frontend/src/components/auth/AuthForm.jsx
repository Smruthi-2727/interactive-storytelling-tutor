import React, { useState } from 'react';

const AuthForm = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Simple user storage for demo purposes
  const getStoredUsers = () => {
    const users = localStorage.getItem('storytelling_users');
    return users ? JSON.parse(users) : {
      'admin': { password: 'admin123', role: 'admin' },
      'teacher': { password: 'teacher123', role: 'teacher' },
      'student': { password: 'student123', role: 'student' }
    };
  };

  const saveUser = (username, userData) => {
    const users = getStoredUsers();
    users[username] = userData;
    localStorage.setItem('storytelling_users', JSON.stringify(users));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation [web:7][web:8]
    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Simulate API delay [web:7]
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getStoredUsers();

      if (isSignUp) {
        // Check if username already exists
        if (users[formData.username.toLowerCase()]) {
          setError('Username already exists. Please choose another one.');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Create new user
        const newUser = {
          password: formData.password,
          role: 'student',
          createdAt: new Date().toISOString()
        };

        saveUser(formData.username.toLowerCase(), newUser);

        const userData = {
          id: Date.now(),
          username: formData.username.toLowerCase(),
          role: 'student',
          token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };

        localStorage.setItem('auth_token', userData.token);
        localStorage.setItem('current_user', JSON.stringify(userData));
        onLogin(userData);

      } else {
        // Sign In Logic
        const user = users[formData.username.toLowerCase()];
        
        if (!user) {
          setError('Username not found');
          setLoading(false);
          return;
        }

        if (user.password !== formData.password) {
          setError('Incorrect password');
          setLoading(false);
          return;
        }

        // Successful login
        const userData = {
          id: Date.now(),
          username: formData.username.toLowerCase(),
          role: user.role,
          token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem('auth_token', userData.token);
        localStorage.setItem('current_user', JSON.stringify(userData));
        onLogin(userData);
      }
    } catch (err) {
      setError(isSignUp ? 'Failed to create account. Please try again.' : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '120px',
        height: '120px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '80px',
        height: '80px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            📚
          </div>
          <h1 style={{
            color: '#2d3748',
            fontSize: '1.8rem',
            margin: '0 0 10px 0',
            fontWeight: '700'
          }}>
            Storytelling Tutor
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '14px',
            margin: 0
          }}>
            {isSignUp ? 'Create your account to start learning' : 'Welcome back! Please sign in'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #fc8181',
            color: '#c53030',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              color: '#2d3748',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#2d3748',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                  color: '#718096'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label style={{
                display: 'block',
                color: '#2d3748',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 10px 0' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={toggleMode}
            style={{
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Demo Users */}
        {!isSignUp && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ 
              color: '#2d3748', 
              fontSize: '12px', 
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              Demo Accounts:
            </h4>
            <div style={{ fontSize: '11px', color: '#4a5568', lineHeight: '1.4' }}>
              <div><strong>admin</strong> / admin123</div>
              <div><strong>teacher</strong> / teacher123</div>
              <div><strong>student</strong> / student123</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default AuthForm;



