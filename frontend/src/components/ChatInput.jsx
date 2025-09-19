import React, { useState } from 'react';

function ChatInput({ onSendMessage, disabled = false }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "AI is thinking..." : "Ask your tutor anything about the story..."}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 16px',
          border: `2px solid ${disabled ? '#d1d5db' : '#e5e7eb'}`,
          borderRadius: '12px',
          fontSize: '14px',
          outline: 'none',
          background: disabled ? '#f9fafb' : 'white',
          color: disabled ? '#9ca3af' : '#374151',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      <button 
        type="submit"
        disabled={!inputValue.trim() || disabled}
        style={{
          background: (!inputValue.trim() || disabled) ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: (!inputValue.trim() || disabled) ? '#9ca3af' : 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: (!inputValue.trim() || disabled) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          if (inputValue.trim() && !disabled) {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }
        }}
        onMouseOut={(e) => {
          if (inputValue.trim() && !disabled) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        {disabled ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #9ca3af',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </>
        ) : (
          <>
            <span>Send</span>
            <span style={{ fontSize: '12px' }}>📤</span>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}

export default ChatInput;

