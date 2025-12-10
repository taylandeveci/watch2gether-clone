import { create } from 'zustand';
import { initializeSocket, disconnectSocket, getSocket } from '../services/socket';

/**
 * Socket Store
 * Manages socket connection state
 */
export const useSocketStore = create((set, get) => ({
  // Socket instance
  socket: null,
  
  // Connection state
  connected: false,
  connecting: false,
  
  // Socket ID
  socketId: null,

  /**
   * Initialize socket connection
   */
  connect: () => {
    const { socket: existingSocket } = get();
    
    // If already connected, return
    if (existingSocket?.connected) {
      return existingSocket;
    }

    set({ connecting: true });

    const socket = initializeSocket();

    // Update connection state
    socket.on('connect', () => {
      set({
        socket,
        connected: true,
        connecting: false,
        socketId: socket.id,
      });
    });

    socket.on('disconnect', () => {
      set({
        connected: false,
        connecting: false,
        socketId: null,
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      set({
        connected: true,
        connecting: false,
        socketId: socket.id,
      });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
      set({ connecting: true });
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      set({
        connected: false,
        connecting: false,
      });
    });

    set({ socket });

    return socket;
  },

  /**
   * Disconnect socket
   */
  disconnect: () => {
    disconnectSocket();
    set({
      socket: null,
      connected: false,
      connecting: false,
      socketId: null,
    });
  },

  /**
   * Get socket instance
   */
  getSocket: () => {
    const { socket } = get();
    return socket || getSocket();
  },

  /**
   * Emit socket event
   */
  emit: (event, data) => {
    const socket = get().getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  },
}));

export default useSocketStore;
