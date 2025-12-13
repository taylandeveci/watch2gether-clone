import { useEffect, useRef, useCallback } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { socketEmit, socketOn } from '../services/socket';
import toast from 'react-hot-toast';

/**
 * Custom hook for video synchronization
 * Handles play, pause, seek events and keeps all users in sync
 */
export const useVideoSync = (roomCode, playerRef) => {
  const {
    videoState,
    currentUser,
    updateVideoState,
    setPlaying,
    setCurrentTime,
    setVideoUrl,
  } = useRoomStore();

  // Track if we're syncing to prevent loops
  const isSyncing = useRef(false);
  const lastSeekTime = useRef(0);

  // Sync tolerance in seconds
  const SYNC_TOLERANCE = 1.5;

  /**
   * Handle play event (local - admin only)
   */
  const handlePlay = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    // Update local state immediately
    setPlaying(true);
    setCurrentTime(currentTime);
    
    // Emit to server
    socketEmit.playVideo(roomCode, currentTime);
  }, [roomCode, currentUser.isAdmin, playerRef, setPlaying, setCurrentTime]);

  /**
   * Handle pause event (local - admin only)
   */
  const handlePause = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    // Update local state immediately
    setPlaying(false);
    setCurrentTime(currentTime);
    
    // Emit to server
    socketEmit.pauseVideo(roomCode, currentTime);
  }, [roomCode, currentUser.isAdmin, playerRef, setPlaying, setCurrentTime]);

  /**
   * Handle seek event (local - admin only)
   */
  const handleSeek = useCallback(
    (seconds) => {
      if (!currentUser.isAdmin || isSyncing.current) return;

      // Debounce seek events
      const now = Date.now();
      if (now - lastSeekTime.current < 500) return;
      lastSeekTime.current = now;

      // IMPORTANT: Seek admin's player immediately
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, 'seconds');
      }
      
      // Update local state
      setCurrentTime(seconds);
      
      // Emit to server for other clients
      socketEmit.seekVideo(roomCode, seconds);
    },
    [roomCode, currentUser.isAdmin, playerRef, setCurrentTime]
  );

  /**
   * Handle video change
   */
  const handleVideoChange = useCallback(
    (videoUrl, videoTitle) => {
      if (!currentUser.isAdmin) {
        toast.error('Only admin can change the video');
        return;
      }

      socketEmit.changeVideo(roomCode, videoUrl, videoTitle, currentUser.userName);
      toast.success('Video changed');
    },
    [roomCode, currentUser]
  );

  /**
   * Sync video to specific time
   */
  const syncToTime = useCallback((targetTime) => {
    if (!playerRef.current) return;

    const currentTime = playerRef.current.getCurrentTime();
    const diff = Math.abs(currentTime - targetTime);

    // Only sync if difference is greater than tolerance
    if (diff > SYNC_TOLERANCE) {
      isSyncing.current = true;
      playerRef.current.seekTo(targetTime);
      setCurrentTime(targetTime);
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    }
  }, [playerRef]);

  /**
   * Listen to socket events
   */
  useEffect(() => {
    if (!roomCode) return;

    // Video play event - ALL clients (including admin) apply this
    const unsubscribePlay = socketOn.onVideoPlay((data) => {
      isSyncing.current = true;
      
      // Update state for ALL clients
      setPlaying(true);
      setCurrentTime(data.currentTime);
      
      // Sync player position if needed
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const diff = Math.abs(currentTime - data.currentTime);
        
        if (diff > SYNC_TOLERANCE) {
          playerRef.current.seekTo(data.currentTime, 'seconds');
        }
      }
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    // Video pause event - ALL clients apply this
    const unsubscribePause = socketOn.onVideoPause((data) => {
      isSyncing.current = true;
      
      // Update state for ALL clients
      setPlaying(false);
      setCurrentTime(data.currentTime);
      
      // Sync player position if needed
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const diff = Math.abs(currentTime - data.currentTime);
        
        if (diff > SYNC_TOLERANCE) {
          playerRef.current.seekTo(data.currentTime, 'seconds');
        }
      }
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    // Video seek event - ALL clients apply this
    const unsubscribeSeek = socketOn.onVideoSeek((data) => {
      isSyncing.current = true;
      
      // Update state for ALL clients
      setCurrentTime(data.currentTime);
      
      // Seek all clients' players
      if (playerRef.current) {
        playerRef.current.seekTo(data.currentTime, 'seconds');
      }
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    // Video changed event
    const unsubscribeVideoChanged = socketOn.onVideoChanged((data) => {
      setVideoUrl(data.videoUrl);
      setPlaying(false);
      setCurrentTime(0);
      toast.success(`${data.addedBy} changed the video`);
    });

    // Sync state event
    const unsubscribeSyncState = socketOn.onSyncState((data) => {
      if (data.currentVideoUrl) {
        setVideoUrl(data.currentVideoUrl);
        syncToTime(data.currentTime);
        setPlaying(data.videoState === 'playing');
      }
    });

    // Request initial sync
    socketEmit.requestSync(roomCode);

    // Cleanup
    return () => {
      unsubscribePlay();
      unsubscribePause();
      unsubscribeSeek();
      unsubscribeVideoChanged();
      unsubscribeSyncState();
    };
  }, [roomCode]);

  return {
    videoState,
    isAdmin: currentUser.isAdmin,
    handlePlay,
    handlePause,
    handleSeek,
    handleVideoChange,
  };
};

export default useVideoSync;
