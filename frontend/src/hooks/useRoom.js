import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../stores/roomStore';
import { roomAPI } from '../services/api';
import { socketEmit, socketOn } from '../services/socket';
import toast from 'react-hot-toast';

/**
 * Custom hook to manage room operations
 */
export const useRoom = (roomCode) => {
  const navigate = useNavigate();
  const {
    roomInfo,
    participants,
    currentUser,
    setRoomInfo,
    setParticipants,
    setCurrentUser,
    setLoading,
    setError,
    clearError,
    reset,
  } = useRoomStore();

  /**
   * Fetch room details
   */
  const fetchRoom = useCallback(async () => {
    if (!roomCode) return;

    try {
      setLoading(true);
      clearError();

      const response = await roomAPI.getRoomByCode(roomCode);
      
      if (response.success) {
        setRoomInfo(response.data);
        setParticipants(response.data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      setError(error.message || 'Failed to fetch room');
      toast.error('Room not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  /**
   * Join room
   */
  const joinRoom = useCallback(
    async (userName) => {
      if (!roomCode || !userName) return;

      try {
        setLoading(true);
        clearError();

        // Emit join room event
        socketEmit.joinRoom(roomCode, userName);

        toast.success(`Welcome to the room, ${userName}!`);
      } catch (error) {
        console.error('Error joining room:', error);
        setError(error.message || 'Failed to join room');
        toast.error('Failed to join room');
      } finally {
        setLoading(false);
      }
    },
    [roomCode]
  );

  /**
   * Leave room
   */
  const leaveRoom = useCallback(() => {
    if (!roomCode) return;

    socketEmit.leaveRoom(roomCode);
    reset();
    navigate('/');
  }, [roomCode, navigate, reset]);

  /**
   * Kick user (admin only)
   */
  const kickUser = useCallback(
    (participantId) => {
      if (!roomCode || !participantId) return;

      try {
        socketEmit.kickUser(roomCode, participantId);
        toast('Kick request sent', { icon: '👞' });
      } catch (error) {
        console.error('Error kicking user:', error);
        toast.error('Failed to kick user');
      }
    },
    [roomCode]
  );

  /**
   * Listen to socket events
   */
  useEffect(() => {
    if (!roomCode) return;

    // Room update event
    const unsubscribeRoomUpdate = socketOn.onRoomUpdate((data) => {
      setRoomInfo(data.room);
      setParticipants(data.participants);
      setCurrentUser(currentUser.userName, data.isAdmin);
    });

    // User joined event
    const unsubscribeUserJoined = socketOn.onUserJoined((data) => {
      setParticipants(data.participants);
      toast.success(`${data.userName} joined the room`);
    });

    // User left event
    const unsubscribeUserLeft = socketOn.onUserLeft((data) => {
      setParticipants(data.participants);
      if (data.kicked) {
        toast(`${data.userName} was removed from the room`, { icon: '👞' });
      } else {
        toast(`${data.userName} left the room`);
      }
    });

    // User kicked event (for the kicked user)
    const unsubscribeUserKicked = socketOn.onUserKicked((data) => {
      toast.error(data.message || 'You have been removed from the room');
      reset();
      navigate('/');
    });

    // Error event
    const unsubscribeError = socketOn.onError((data) => {
      setError(data.message);
      toast.error(data.message);
    });

    // Cleanup
    return () => {
      unsubscribeRoomUpdate();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeUserKicked();
      unsubscribeError();
    };
  }, [roomCode, currentUser.userName, navigate, reset]);

  return {
    roomInfo,
    participants,
    currentUser,
    fetchRoom,
    joinRoom,
    leaveRoom,
    kickUser,
  };
};

export default useRoom;
