import React from 'react';

const ChatMessage = ({ message, onSuggestionClick }) => {
  const isBot = message.type === 'bot';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isBot ? 'flex-start' : 'flex-end',
      gap: '4px'
    }}>
      <div style={{
        maxWidth: '85%',
        padding: '12px',
        borderRadius: isBot ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
        background: isBot ? '#f3f4f6' : '#3b82f6',
        color: isBot ? '#1f2937' : 'white',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        {message.content}
      </div>

      {/* Suggestions for bot messages */}
      {isBot && message.suggestions && message.suggestions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxWidth: '85%',
          marginTop: '8px'
        }}>
          {message.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#374151',
                textAlign: 'left',
                transition: 'all 0.2s',
                ':hover': {
                  background: '#f9fafb',
                  borderColor: '#3b82f6'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <span style={{
        fontSize: '11px',
        color: '#9ca3af',
        marginTop: '2px'
      }}>
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
  );
};

export default ChatMessage;
