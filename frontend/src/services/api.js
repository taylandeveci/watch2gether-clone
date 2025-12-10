import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    
    console.error('API Error:', message);
    
    // Don't show toast for 404 errors
    if (error.response?.status !== 404) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Room API endpoints
 */
export const roomAPI = {
  /**
   * Create a new room
   */
  createRoom: async (name, createdBy) => {
    return await api.post('/api/rooms/create', { name, createdBy });
  },

  /**
   * Get room by code
   */
  getRoomByCode: async (roomCode) => {
    return await api.get(`/api/rooms/${roomCode}`);
  },

  /**
   * Delete room
   */
  deleteRoom: async (roomCode, socketId) => {
    return await api.delete(`/api/rooms/${roomCode}`, {
      data: { socketId },
    });
  },

  /**
   * Get video history
   */
  getVideoHistory: async (roomCode) => {
    return await api.get(`/api/rooms/${roomCode}/history`);
  },

  /**
   * Add video to room
   */
  addVideo: async (roomCode, videoUrl, videoTitle, addedBy) => {
    return await api.post(`/api/rooms/${roomCode}/video`, {
      videoUrl,
      videoTitle,
      addedBy,
    });
  },

  /**
   * Update video state
   */
  updateVideoState: async (roomCode, state, currentTime) => {
    return await api.patch(`/api/rooms/${roomCode}/state`, {
      state,
      currentTime,
    });
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return await api.get('/api/health');
};

export default api;
