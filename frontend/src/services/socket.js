import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketURL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection event listeners
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Socket event emitters
 */
export const socketEmit = {
  /**
   * Join room
   */
  joinRoom: (roomCode, userName) => {
    const s = getSocket();
    s.emit('join-room', { roomCode, userName });
  },

  /**
   * Leave room
   */
  leaveRoom: (roomCode) => {
    const s = getSocket();
    s.emit('leave-room', { roomCode });
  },

  /**
   * Play video
   */
  playVideo: (roomCode, currentTime) => {
    const s = getSocket();
    s.emit('play-video', { roomCode, currentTime });
  },

  /**
   * Pause video
   */
  pauseVideo: (roomCode, currentTime) => {
    const s = getSocket();
    s.emit('pause-video', { roomCode, currentTime });
  },

  /**
   * Seek video
   */
  seekVideo: (roomCode, currentTime) => {
    const s = getSocket();
    s.emit('seek-video', { roomCode, currentTime });
  },

  /**
   * Change video
   */
  changeVideo: (roomCode, videoUrl, videoTitle, addedBy) => {
    const s = getSocket();
    s.emit('change-video', { roomCode, videoUrl, videoTitle, addedBy });
  },

  /**
   * Send chat message
   */
  sendMessage: (roomCode, message) => {
    const s = getSocket();
    s.emit('chat-message', { roomCode, message });
  },

  /**
   * Request sync
   */
  requestSync: (roomCode) => {
    const s = getSocket();
    s.emit('sync-request', { roomCode });
  },

  /**
   * Kick user (admin only)
   */
  kickUser: (roomCode, participantId) => {
    const s = getSocket();
    s.emit('kick-user', { roomCode, participantId });
  },
};

/**
 * Socket event listeners
 */
export const socketOn = {
  /**
   * Room update
   */
  onRoomUpdate: (callback) => {
    const s = getSocket();
    s.on('room-update', callback);
    return () => s.off('room-update', callback);
  },

  /**
   * User joined
   */
  onUserJoined: (callback) => {
    const s = getSocket();
    s.on('user-joined', callback);
    return () => s.off('user-joined', callback);
  },

  /**
   * User left
   */
  onUserLeft: (callback) => {
    const s = getSocket();
    s.on('user-left', callback);
    return () => s.off('user-left', callback);
  },

  /**
   * Video play
   */
  onVideoPlay: (callback) => {
    const s = getSocket();
    s.on('video-play', callback);
    return () => s.off('video-play', callback);
  },

  /**
   * Video pause
   */
  onVideoPause: (callback) => {
    const s = getSocket();
    s.on('video-pause', callback);
    return () => s.off('video-pause', callback);
  },

  /**
   * Video seek
   */
  onVideoSeek: (callback) => {
    const s = getSocket();
    s.on('video-seek', callback);
    return () => s.off('video-seek', callback);
  },

  /**
   * Video changed
   */
  onVideoChanged: (callback) => {
    const s = getSocket();
    s.on('video-changed', callback);
    return () => s.off('video-changed', callback);
  },

  /**
   * Chat message
   */
  onChatMessage: (callback) => {
    const s = getSocket();
    s.on('chat-message', callback);
    return () => s.off('chat-message', callback);
  },

  /**
   * Sync state
   */
  onSyncState: (callback) => {
    const s = getSocket();
    s.on('sync-state', callback);
    return () => s.off('sync-state', callback);
  },

  /**
   * Error
   */
  onError: (callback) => {
    const s = getSocket();
    s.on('error', callback);
    return () => s.off('error', callback);
  },

  /**
   * User kicked (when you get kicked from room)
   */
  onUserKicked: (callback) => {
    const s = getSocket();
    s.on('user-kicked', callback);
    return () => s.off('user-kicked', callback);
  },
};

export default { initializeSocket, getSocket, disconnectSocket, socketEmit, socketOn };
