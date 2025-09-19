import axios from 'axios';

// Updated to match your backend port
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============== AUTHENTICATION ENDPOINTS ==============
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

// ============== STORIES ENDPOINTS ==============
export const storiesAPI = {
  // Get all stories
  getAllStories: () => api.get('/api/stories'),
  
  // Get specific story by ID
  getStoryById: (storyId) => api.get(`/api/stories/${storyId}`),
  
  // Get story content for reading
  getStoryContent: (storyTitle) => api.get('/api/stories', { 
    params: { title: storyTitle } 
  })
};

// ============== CHAT/AI ENDPOINTS ==============
export const chatAPI = {
  // Send message to AI tutor (your enhanced 4-story AI)
  sendMessage: (message, userId, context = {}) => 
    api.post('/api/chat', {
      message,
      user_id: userId,
      context: {
        currentStory: context.currentStory || {},
        userProgress: context.userProgress || {},
        ...context
      }
    }),
  
  // Get chat history
  getChatHistory: (userId, storyTitle) => 
    api.get('/api/chat/history', { 
      params: { user_id: userId, story: storyTitle } 
    }),
  
  // Clear chat history
  clearChatHistory: (userId) => 
    api.delete(`/api/chat/history/${userId}`)
};

// ============== USER PROGRESS ENDPOINTS ==============
export const progressAPI = {
  // Get user progress
  getUserProgress: (userId) => api.get(`/api/progress/${userId}`),
  
  // Update progress
  updateProgress: (userId, progressData) => 
    api.post(`/api/progress/${userId}`, progressData),
  
  // Get user sessions
  getUserSessions: (userId) => api.get(`/api/sessions/${userId}`),
  
  // Create new session
  createSession: (sessionData) => api.post('/api/sessions', sessionData),
  
  // Update session
  updateSession: (sessionId, sessionData) => 
    api.put(`/api/sessions/${sessionId}`, sessionData)
};

// ============== ASSESSMENT ENDPOINTS ==============
export const assessmentAPI = {
  // Get assessments for story
  getAssessments: (storyTitle) => 
    api.get('/api/assessments', { params: { story: storyTitle } }),
  
  // Submit assessment
  submitAssessment: (assessmentData) => 
    api.post('/api/assessments', assessmentData),
  
  // Get assessment results
  getAssessmentResults: (userId, assessmentId) => 
    api.get(`/api/assessments/${assessmentId}/results/${userId}`)
};

// ============== DASHBOARD ENDPOINTS ==============
export const dashboardAPI = {
  // Get dashboard data
  getDashboardData: (userId) => api.get(`/api/dashboard/${userId}`),
  
  // Get user analytics
  getUserAnalytics: (userId) => api.get(`/api/analytics/${userId}`)
};

// ============== HEALTH CHECK ==============
export const healthAPI = {
  // Check backend health
  checkHealth: () => api.get('/health'),
  
  // Check AI service status
  checkAIStatus: () => api.get('/api/chat/health')
};

// ============== HELPER FUNCTIONS ==============
export const apiHelpers = {
  // Test backend connection
  testConnection: async () => {
    try {
      const response = await healthAPI.checkHealth();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Test AI service
  testAI: async (testMessage = "Hello!") => {
    try {
      const response = await chatAPI.sendMessage(
        testMessage, 
        'test_user', 
        { 
          currentStory: { 
            title: 'The Lion and the Mouse', 
            theme: 'friendship' 
          } 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get all 4 stories with their details
  getEnhancedStories: async () => {
    const stories = [
      {
        id: 1,
        title: "The Lion and the Mouse",
        theme: "friendship",
        difficulty_level: "beginner",
        estimated_reading_time: 5,
        moral_lesson: "No act of kindness, however small, is ever wasted",
        key_characters: ["Lion", "Mouse", "Hunters"],
        description: "A tale of unlikely friendship and the power of kindness"
      },
      {
        id: 2,
        title: "The Tortoise and the Hare",
        theme: "perseverance", 
        difficulty_level: "beginner",
        estimated_reading_time: 4,
        moral_lesson: "Slow and steady wins the race",
        key_characters: ["Tortoise", "Hare", "Fox"],
        description: "A story about persistence overcoming natural talent"
      },
      {
        id: 3,
        title: "The Boy Who Cried Wolf",
        theme: "honesty",
        difficulty_level: "intermediate", 
        estimated_reading_time: 6,
        moral_lesson: "Nobody believes a liar, even when they are telling the truth",
        key_characters: ["Shepherd Boy", "Villagers", "Wolf", "Sheep"],
        description: "The importance of honesty and trustworthiness"
      },
      {
        id: 4,
        title: "The Ant and the Grasshopper",
        theme: "responsibility",
        difficulty_level: "beginner",
        estimated_reading_time: 5, 
        moral_lesson: "It is best to prepare for the days of necessity",
        key_characters: ["Ant", "Grasshopper"],
        description: "A lesson about hard work and preparation"
      }
    ];
    
    return { success: true, data: { stories, total_count: 4 } };
  }
};

export default api;
