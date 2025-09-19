import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const AiTutor = ({ user, onBack, currentStory = null }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [storyContext, setStoryContext] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize chat and get story context
  useEffect(() => {
    initializeChat();
  }, [user, currentStory]);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get story context if available
      if (currentStory && currentStory.id) {
        try {
          const contextResponse = await fetch(`http://127.0.0.1:8000/api/chat/context/${currentStory.id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          
          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            setStoryContext(contextData);
          }
        } catch (contextError) {
          console.log('Story context not available, continuing without it');
        }
      }

      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello @${user.username}! 👋 I'm your AI Storytelling Tutor. I'm here to help you understand stories better, answer questions about characters, themes, and lessons. ${currentStory ? `Let's explore "${currentStory.title}" together!` : 'What would you like to learn today?'}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'welcome'
      };
      
      setMessages([welcomeMessage]);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionStatus('error');
      
      const errorMessage = {
        id: Date.now(),
        text: "I'm having trouble connecting right now. Please try refreshing the page.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages([errorMessage]);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prepare context for AI tutor
      const context = {
        currentStory: storyContext?.currentStory || currentStory,
        userProgress: storyContext?.userProgress || { level: 'Beginner' },
        chat_mode: storyContext?.chat_mode || 'smart_mock'
      };

      // Send directly to FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Removed Authorization for now to test connection
        },
        body: JSON.stringify({
          message: messageText,
          user_id: user.username,
          context: context
        })
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const botResponse = await response.json();
        console.log('Bot response received:', botResponse); // Debug log
        
        // Update user message status
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
        ));

        // Add bot response with suggestions
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: botResponse.suggestions || [],
          mode: botResponse.mode || 'smart_mock'
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 800);

      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText); // Debug log
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Update user message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'failed' } : msg
      ));
      
      // Add error message with details
      const errorMessage = {
        id: Date.now() + 1,
        text: `Connection Error: ${error.message}. Please check if your FastAPI server is running on port 8000.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('error');
    }
  };

  const clearChat = async () => {
    try {
      // Clear chat history on backend (optional)
      await fetch(`http://127.0.0.1:8000/api/chat/clear/${user.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Reset local messages
      const clearMessage = {
        id: Date.now(),
        text: `Chat cleared! How can I help you today, @${user.username}? ${currentStory ? `Let's continue exploring "${currentStory.title}"!` : ''}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages([clearMessage]);
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Still clear locally even if backend clear fails
      const clearMessage = {
        id: Date.now(),
        text: `Chat cleared locally! How can I help you today, @${user.username}?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages([clearMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🤖 AI Storytelling Tutor
              <span style={{
                background: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                display: 'inline-block'
              }} />
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              {currentStory ? `Exploring: "${currentStory.title}"` : 'General Learning Mode'} • {connectionStatus === 'connected' ? 'Ready to help!' : connectionStatus === 'connecting' ? 'Connecting...' : 'Connection error'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxHeight: 'calc(100vh - 200px)'
      }}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isUser={message.sender === 'user'}
            username={user.username}
            onSuggestionClick={sendMessage}
          />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '10px'
          }}>
            <div style={{
              background: 'white',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '200px'
            }}>
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                }} />
              </div>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={connectionStatus === 'error'} 
        currentStory={currentStory}
      />

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AiTutor;

