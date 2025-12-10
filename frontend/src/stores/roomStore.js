import { create } from 'zustand';

/**
 * Room Store
 * Manages room state and participants
 */
export const useRoomStore = create((set, get) => ({
  // Room information
  roomInfo: null,
  
  // Video state
  videoState: {
    url: null,
    playing: false,
    currentTime: 0,
    duration: 0,
  },
  
  // Participants
  participants: [],
  
  // Chat messages
  messages: [],
  
  // Current user info
  currentUser: {
    userName: null,
    isAdmin: false,
  },
  
  // Loading states
  isLoading: false,
  error: null,

  /**
   * Set room information
   */
  setRoomInfo: (roomInfo) => {
    set({ roomInfo });
  },

  /**
   * Update video state
   */
  updateVideoState: (updates) => {
    set((state) => ({
      videoState: { ...state.videoState, ...updates },
    }));
  },

  /**
   * Set video URL
   */
  setVideoUrl: (url) => {
    set((state) => ({
      videoState: { ...state.videoState, url, currentTime: 0 },
    }));
  },

  /**
   * Set playing state
   */
  setPlaying: (playing) => {
    set((state) => ({
      videoState: { ...state.videoState, playing },
    }));
  },

  /**
   * Set current time
   */
  setCurrentTime: (currentTime) => {
    set((state) => ({
      videoState: { ...state.videoState, currentTime },
    }));
  },

  /**
   * Set duration
   */
  setDuration: (duration) => {
    set((state) => ({
      videoState: { ...state.videoState, duration },
    }));
  },

  /**
   * Set participants
   */
  setParticipants: (participants) => {
    set({ participants });
  },

  /**
   * Add participant
   */
  addParticipant: (participant) => {
    set((state) => {
      const exists = state.participants.find((p) => p.id === participant.id);
      if (exists) return state;
      return { participants: [...state.participants, participant] };
    });
  },

  /**
   * Remove participant
   */
  removeParticipant: (participantId) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    }));
  },

  /**
   * Add chat message
   */
  addMessage: (message) => {
    set((state) => ({
      messages: [...(state.messages || []), message],
    }));
  },

  /**
   * Clear messages
   */
  clearMessages: () => {
    set({ messages: [] });
  },

  /**
   * Set current user
   */
  setCurrentUser: (userName, isAdmin) => {
    set({ currentUser: { userName, isAdmin } });
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  /**
   * Set error
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset room state
   */
  reset: () => {
    set({
      roomInfo: null,
      videoState: {
        url: null,
        playing: false,
        currentTime: 0,
        duration: 0,
      },
      participants: [],
      messages: [],
      currentUser: {
        userName: null,
        isAdmin: false,
      },
      isLoading: false,
      error: null,
    });
  },
}));

export default useRoomStore;
