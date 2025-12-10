import { useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';
import toast from 'react-hot-toast';

/**
 * Custom hook to manage socket connection
 */
export const useSocket = () => {
  const { socket, connected, connecting, connect, disconnect, emit, getSocket } =
    useSocketStore();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount, keep connection alive
      // disconnect();
    };
  }, []);

  // Show connection status
  useEffect(() => {
    if (connected) {
      console.log('Socket connected');
    } else if (!connecting && socket) {
      console.log('Socket disconnected');
      toast.error('Connection lost. Reconnecting...', { id: 'socket-disconnect' });
    }
  }, [connected, connecting]);

  // Show reconnection success
  useEffect(() => {
    if (connected && socket) {
      socket.on('reconnect', () => {
        toast.success('Reconnected!', { id: 'socket-reconnect' });
      });
    }
  }, [connected, socket]);

  return {
    socket,
    socketId: socket?.id,
    connected,
    connecting,
    emit,
    getSocket,
  };
};

export default useSocket;
