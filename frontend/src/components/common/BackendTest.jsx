import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BackendTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test health endpoint
        const healthResponse = await api.get('/health');
        console.log('Health check:', healthResponse.data);
        
        // Test stories endpoint (this will fail without auth, but that's expected)
        try {
          const storiesResponse = await api.get('/stories');
          setStories(storiesResponse.data);
          setStatus('✅ Backend Connected! Stories loaded.');
        } catch (authError) {
          setStatus('✅ Backend Connected! (Auth required for stories)');
        }
      } catch (error) {
        setStatus('❌ Backend Connection Failed');
        console.error('Connection error:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Interactive Storytelling Tutor
      </h1>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Backend Connection Status:</h2>
        <p className="text-lg mb-4">{status}</p>
        
        {stories.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Available Stories:</h3>
            <ul className="space-y-2">
              {stories.map(story => (
                <li key={story.id} className="bg-gray-50 p-3 rounded-lg">
                  <strong>{story.title}</strong> - {story.category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendTest;
