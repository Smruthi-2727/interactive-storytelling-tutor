import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;
/* Remove these lines temporarily */
/* @tailwind base;
@tailwind components;
@tailwind utilities; */

body {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  min-height: 100vh;
  margin: 0;
}

.story-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.story-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.choice-button {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-button:hover {
  background: #2563eb;
  transform: scale(1.05);
}
