import axios from 'axios';

// ✅ CORRECT: Match your working backend
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ✅ FIX: Get token from correct storage key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
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
      // ✅ FIX: Remove both token keys
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============== AUTHENTICATION ENDPOINTS (CORRECTED) ==============
export const authAPI = {
  // ✅ CORRECTED: Use your working endpoints
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// ============== STORIES ENDPOINTS (CORRECTED) ==============
export const storiesAPI = {
  // ✅ CORRECTED: Match your working API
  getAllStories: () => api.get('/api/stories'),
  getStoryById: (storyId) => api.get(`/api/stories/${storyId}`),
  getStoryScenes: (storyId) => api.get(`/api/stories/${storyId}/scenes`),
};

// ============== SESSION ENDPOINTS (NEW - MATCH YOUR API) ==============
export const sessionAPI = {
  // ✅ NEW: Your working session endpoints
  createSession: (sessionData) => api.post('/api/sessions', sessionData),
  submitQuiz: (sessionId, quizData) => 
    api.post(`/api/sessions/${sessionId}/submit_quiz`, quizData),
  completeScene: (sessionId, sceneData) => 
    api.post(`/api/sessions/${sessionId}/complete_scene`, sceneData),
};

// ============== USER PROGRESS ENDPOINTS (CORRECTED) ==============
export const progressAPI = {
  // ✅ CORRECTED: Your working progress endpoints
  getUserProgress: () => api.get('/api/user/progress'),
  getUserSessions: () => api.get('/api/user/sessions'),
  getUserAssessments: () => api.get('/api/user/assessments'),
  getDashboard: () => api.get('/api/dashboard'),
};

// ============== CHAT ENDPOINTS (CORRECTED) ==============
export const chatAPI = {
  // ✅ CORRECTED: Your working chat endpoint
  sendMessage: (message, userId, context = {}) =>
    api.post('/api/chat', {
      message,
      user_id: userId,
      context
    }),
};

// ============== HEALTH CHECK (CORRECTED) ==============
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

export default api;
