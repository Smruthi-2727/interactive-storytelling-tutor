import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatBot = ({ story, userId = 'student_123', onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when story changes
    if (story) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hello! 👋 I'm your AI tutor for "${story.title}". I'm here to help you explore the characters, themes, and life lessons in this wonderful story. What would you like to discuss?`,
        suggestions: [
          `Tell me about the characters in ${story.title}`,
          `What's the main lesson in this story?`,
          `How can I apply this story to real life?`
        ],
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [story]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !story) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to your enhanced 4-story AI backend
      const response = await chatAPI.sendMessage(
        messageText,
        userId,
        {
          currentStory: {
            title: story.title,
            theme: story.theme || 'general learning'
          },
          userProgress: {
            level: 'Beginner' // You can make this dynamic
          }
        }
      );

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        suggestions: response.data.suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. Please make sure the backend is running on port 8000. Let's try again! 🤖",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = async () => {
    try {
      await chatAPI.clearChatHistory(userId);
      setMessages([]);
      
      // Add fresh welcome message
      if (story) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Fresh start! 🎉 Let's explore "${story.title}" together. What would you like to learn about?`,
          suggestions: [
            `What's the moral of ${story.title}?`,
            `Tell me about the characters`,
            `How does this story apply to real life?`
          ],
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (!story) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#f3f4f6',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #d1d5db'
      }}>
        <p>Please select a story to start chatting! 📚</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isMinimized ? '280px' : '400px',
      height: isMinimized ? '60px' : '600px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: isMinimized ? 'none' : '1px solid #e5e7eb',
        background: '#3b82f6',
        color: 'white',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              AI Tutor
            </h3>
            {!isMinimized && (
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                Exploring: {story.title}
              </p>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isMinimized ? '🔼' : '🔽'}
          </button>
          
          {!isMinimized && (
            <button
              onClick={handleClearChat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Clear Chat"
            >
              🗑️
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      {!isMinimized && (
        <>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  AI Tutor is thinking...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;

