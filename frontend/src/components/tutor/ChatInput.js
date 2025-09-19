import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, disabled, currentStory }) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea [web:67]
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Dynamic prompts based on current story
  const getQuickPrompts = () => {
    if (currentStory) {
      const storyPrompts = {
        "The Lion and the Mouse": [
          "What does this story teach about kindness?",
          "How can size not matter in friendships?",
          "Explain the mouse's courage",
          "What's the moral of this story?"
        ],
        "The Tortoise and the Hare": [
          "Why did the tortoise win the race?",
          "What's wrong with being overconfident?",
          "How does persistence pay off?",
          "What can we learn from this race?"
        ],
        "The Boy Who Cried Wolf": [
          "Why is honesty important?",
          "What are consequences of lying?",
          "How can trust be rebuilt?",
          "What happened when the real wolf came?"
        ],
        "The Ant and the Grasshopper": [
          "What does this teach about preparation?",
          "How do you balance work and play?",
          "Why did the ant work all summer?",
          "What happened to the grasshopper?"
        ]
      };
      
      return storyPrompts[currentStory.title] || [
        `Explain the main theme of ${currentStory.title}`,
        `What can we learn from the characters?`,
        `Help me understand the moral lesson`,
        `Ask me questions about the story`
      ];
    }
    
    return [
      "Help me understand story themes",
      "Explain character motivations", 
      "What are the moral lessons?",
      "Ask me comprehension questions"
    ];
  };

  const quickPrompts = getQuickPrompts();

  const handleQuickPrompt = (prompt) => {
    if (!disabled) {
      onSendMessage(prompt);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '20px 30px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* Quick Prompts */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={disabled}
            style={{
              background: disabled ? '#f3f4f6' : 'linear-gradient(135deg, #f0f9ff, #dbeafe)',
              border: '1px solid #bfdbfe',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: disabled ? '#9ca3af' : '#3730a3',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!disabled) {
                e.target.style.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
              }
            }}
            onMouseOut={(e) => {
              if (!disabled) {
                e.target.style.background = 'linear-gradient(135deg, #f0f9ff, #dbeafe)';
              }
            }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={disabled ? "AI Tutor is connecting..." : `Ask me anything about ${currentStory ? currentStory.title : 'stories, characters, themes, or lessons'}...`}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: '48px',
              maxHeight: '120px',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              background: disabled ? '#f9fafb' : 'white',
              color: disabled ? '#9ca3af' : '#1f2937',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.borderColor = '#667eea';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
          
          {/* Character Counter */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '8px',
            fontSize: '11px',
            color: message.length > 500 ? '#ef4444' : '#9ca3af'
          }}>
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled || message.length > 500}
          style={{
            background: (!message.trim() || disabled || message.length > 500) 
              ? '#e5e7eb' 
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: (!message.trim() || disabled || message.length > 500) ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (!message.trim() || disabled || message.length > 500) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          {disabled ? '🔒' : '🚀'} Send
        </button>
      </form>
      
      {disabled && (
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '12px',
          color: '#ef4444'
        }}>
          ⚠️ Connecting to AI Tutor... Please wait.
        </div>
      )}
    </div>
  );
};

export default ChatInput;
