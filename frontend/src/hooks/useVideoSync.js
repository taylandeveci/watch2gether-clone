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
  const SYNC_TOLERANCE = 2;

  /**
   * Handle play event (local)
   */
  const handlePlay = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    socketEmit.playVideo(roomCode, currentTime);
    setPlaying(true);
  }, [roomCode, currentUser.isAdmin, playerRef]);

  /**
   * Handle pause event (local)
   */
  const handlePause = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    socketEmit.pauseVideo(roomCode, currentTime);
    setPlaying(false);
  }, [roomCode, currentUser.isAdmin, playerRef]);

  /**
   * Handle seek event (local)
   */
  const handleSeek = useCallback(
    (seconds) => {
      if (!currentUser.isAdmin || isSyncing.current) return;

      // Debounce seek events
      const now = Date.now();
      if (now - lastSeekTime.current < 500) return;
      lastSeekTime.current = now;

      socketEmit.seekVideo(roomCode, seconds);
      setCurrentTime(seconds);
    },
    [roomCode, currentUser.isAdmin]
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

    // Video play event
    const unsubscribePlay = socketOn.onVideoPlay((data) => {
      isSyncing.current = true;
      
      syncToTime(data.currentTime);
      setPlaying(true);
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    // Video pause event
    const unsubscribePause = socketOn.onVideoPause((data) => {
      isSyncing.current = true;
      
      syncToTime(data.currentTime);
      setPlaying(false);
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    // Video seek event
    const unsubscribeSeek = socketOn.onVideoSeek((data) => {
      isSyncing.current = true;
      
      syncToTime(data.currentTime);
      
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
