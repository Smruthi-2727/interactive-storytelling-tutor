import React from 'react';

const ChatMessage = ({ message, isUser, username, onSuggestionClick }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = () => {
    if (isUser) {
      return {
        alignSelf: 'flex-end',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        borderRadius: '18px 18px 4px 18px'
      };
    }
    
    if (message.type === 'error') {
      return {
        alignSelf: 'flex-start',
        background: '#fee2e2',
        color: '#dc2626',
        borderRadius: '18px 18px 18px 4px',
        border: '1px solid #fecaca'
      };
    }
    
    if (message.type === 'welcome' || message.type === 'system') {
      return {
        alignSelf: 'center',
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        color: '#059669',
        borderRadius: '18px',
        border: '1px solid #bbf7d0',
        textAlign: 'center',
        fontStyle: 'italic'
      };
    }
    
    return {
      alignSelf: 'flex-start',
      background: 'white',
      color: '#1f2937',
      borderRadius: '18px 18px 18px 4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '100%'
    }}>
      <div style={{
        ...getMessageStyle(),
        padding: '12px 16px',
        maxWidth: '75%',
        wordBreak: 'break-word',
        lineHeight: '1.5'
      }}>
        {/* Message Header for Bot Messages */}
        {!isUser && message.type !== 'welcome' && message.type !== 'system' && (
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            🤖 AI Tutor {message.mode && (
              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                ({message.mode})
              </span>
            )}
          </div>
        )}
        
        {/* Message Text */}
        <div style={{ fontSize: '14px' }}>
          {message.text}
        </div>
      </div>
      
      {/* Quick Suggestions from AI */}
      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '8px',
          maxWidth: '75%'
        }}>
          {message.suggestions.slice(0, 3).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              style={{
                background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#3730a3',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f0f9ff, #dbeafe)';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Timestamp and Status */}
      <div style={{
        fontSize: '11px',
        color: '#9ca3af',
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>{formatTime(message.timestamp)}</span>
        {isUser && message.status && (
          <span>
            {message.status === 'sending' && '⏳'}
            {message.status === 'delivered' && '✅'}
            {message.status === 'failed' && '❌'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
