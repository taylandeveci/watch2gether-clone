import { useEffect, useRef, useCallback } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { socketEmit, socketOn } from '../services/socket';
import toast from 'react-hot-toast';

/**
 * Custom hook for video synchronization
 * Handles play, pause, seek events and keeps all users in sync
 * 
 * iOS → iOS Sync Critical Notes:
 * - Both admin and viewer need hasUserInteracted=true (handled in VideoPlayer)
 * - Socket events must update ALL clients including sender
 * - isSyncing flag prevents infinite loops but shouldn't block iOS events
 * - playerRef operations must be safe (check existence before calling)
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
   * 
   * iOS → iOS: Admin's play action emits to server, 
   * server broadcasts to ALL clients (including back to admin via socket)
   */
  const handlePlay = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    console.log(`▶️  Admin play at ${currentTime}s - emitting to server`);
    
    // Update local state immediately for responsive UI
    setPlaying(true);
    setCurrentTime(currentTime);
    
    // Emit to server (will broadcast to ALL clients)
    socketEmit.playVideo(roomCode, currentTime);
  }, [roomCode, currentUser.isAdmin, playerRef, setPlaying, setCurrentTime]);

  /**
   * Handle pause event (local - admin only)
   * 
   * iOS → iOS: Admin's pause action emits to server,
   * server broadcasts to ALL clients
   */
  const handlePause = useCallback(() => {
    if (!currentUser.isAdmin || isSyncing.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    console.log(`⏸️  Admin pause at ${currentTime}s - emitting to server`);
    
    // Update local state immediately for responsive UI
    setPlaying(false);
    setCurrentTime(currentTime);
    
    // Emit to server (will broadcast to ALL clients)
    socketEmit.pauseVideo(roomCode, currentTime);
  }, [roomCode, currentUser.isAdmin, playerRef, setPlaying, setCurrentTime]);

  /**
   * Handle seek event (local - admin only)
   * 
   * iOS → iOS: Admin's seek action emits to server,
   * server broadcasts to ALL clients
   */
  const handleSeek = useCallback(
    (seconds) => {
      if (!currentUser.isAdmin || isSyncing.current) return;

      // Debounce seek events to prevent spam
      const now = Date.now();
      if (now - lastSeekTime.current < 500) return;
      lastSeekTime.current = now;

      console.log(`⏩ Admin seek to ${seconds}s - emitting to server`);

      // IMPORTANT: Seek admin's player immediately for responsive UI
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, 'seconds');
      }
      
      // Update local state
      setCurrentTime(seconds);
      
      // Emit to server for ALL other clients
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
   * 
   * iOS Fix: Checks player existence before calling methods
   */
  const syncToTime = useCallback((targetTime) => {
    if (!playerRef.current) {
      console.warn('⚠️  Cannot sync: playerRef not ready');
      return;
    }

    const currentTime = playerRef.current.getCurrentTime();
    const diff = Math.abs(currentTime - targetTime);

    // Only sync if difference is greater than tolerance
    if (diff > SYNC_TOLERANCE) {
      console.log(`🔄 Syncing from ${currentTime}s to ${targetTime}s (diff: ${diff.toFixed(1)}s)`);
      isSyncing.current = true;
      playerRef.current.seekTo(targetTime, 'seconds');
      setCurrentTime(targetTime);
      
      // Release sync lock after 1 second
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    }
  }, [playerRef, setCurrentTime]);

  /**
   * Listen to socket events
   * 
   * iOS → iOS Sync Critical:
   * - These listeners fire for ALL clients (admin included)
   * - Must safely check playerRef before calling methods
   * - isSyncing flag prevents local actions during remote sync
   * - After user taps (hasUserInteracted=true), these events work normally
   */
  useEffect(() => {
    if (!roomCode) return;

    /**
     * Video play event - ALL clients receive and apply this
     * 
     * iOS → iOS: When admin (iOS) plays:
     * 1. Admin emits play-video to server
     * 2. Server broadcasts video-play to ALL clients
     * 3. ALL clients (including admin) update state and sync position
     * 4. ReactPlayer uses 'playing' prop to start playback
     */
    const unsubscribePlay = socketOn.onVideoPlay((data) => {
      console.log(`📥 Received video-play event at ${data.currentTime}s`);
      
      isSyncing.current = true;
      
      // Update state for ALL clients (this triggers ReactPlayer)
      setPlaying(true);
      setCurrentTime(data.currentTime);
      
      // iOS Fix: Safely sync player position if player is ready
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const diff = Math.abs(currentTime - data.currentTime);
          
          // Sync if drift is significant
          if (diff > SYNC_TOLERANCE) {
            console.log(`  ↳ Syncing player from ${currentTime}s to ${data.currentTime}s`);
            playerRef.current.seekTo(data.currentTime, 'seconds');
          }
        } catch (error) {
          console.error('Error syncing play position:', error);
        }
      } else {
        console.warn('  ↳ PlayerRef not ready, will sync when ready');
      }
      
      // Release sync lock
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    /**
     * Video pause event - ALL clients receive and apply this
     * 
     * iOS → iOS: When admin (iOS) pauses:
     * 1. Admin emits pause-video to server
     * 2. Server broadcasts video-pause to ALL clients
     * 3. ALL clients update state and sync position
     * 4. ReactPlayer uses 'playing=false' prop to pause
     */
    const unsubscribePause = socketOn.onVideoPause((data) => {
      console.log(`📥 Received video-pause event at ${data.currentTime}s`);
      
      isSyncing.current = true;
      
      // Update state for ALL clients (this triggers ReactPlayer)
      setPlaying(false);
      setCurrentTime(data.currentTime);
      
      // iOS Fix: Safely sync player position if player is ready
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const diff = Math.abs(currentTime - data.currentTime);
          
          // Sync if drift is significant
          if (diff > SYNC_TOLERANCE) {
            console.log(`  ↳ Syncing player from ${currentTime}s to ${data.currentTime}s`);
            playerRef.current.seekTo(data.currentTime, 'seconds');
          }
        } catch (error) {
          console.error('Error syncing pause position:', error);
        }
      } else {
        console.warn('  ↳ PlayerRef not ready, will sync when ready');
      }
      
      // Release sync lock
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    /**
     * Video seek event - ALL clients receive and apply this
     * 
     * iOS → iOS: When admin (iOS) seeks:
     * 1. Admin emits seek-video to server
     * 2. Server broadcasts video-seek to ALL clients
     * 3. ALL clients seek to new position
     */
    const unsubscribeSeek = socketOn.onVideoSeek((data) => {
      console.log(`📥 Received video-seek event to ${data.currentTime}s`);
      
      isSyncing.current = true;
      
      // Update state for ALL clients
      setCurrentTime(data.currentTime);
      
      // iOS Fix: Safely seek player if ready
      if (playerRef.current) {
        try {
          playerRef.current.seekTo(data.currentTime, 'seconds');
        } catch (error) {
          console.error('Error seeking video:', error);
        }
      } else {
        console.warn('  ↳ PlayerRef not ready for seek');
      }
      
      // Release sync lock
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    /**
     * Video changed event - NEW video selected by admin
     * 
     * iOS → iOS: When new video added:
     * 1. Admin selects new video
     * 2. Server broadcasts video-changed to ALL clients
     * 3. ALL clients reset to new video at position 0
     * 4. hasUserInteracted stays TRUE (user already tapped once)
     */
    const unsubscribeVideoChanged = socketOn.onVideoChanged((data) => {
      console.log('📥 Received video-changed event:', data);
      
      isSyncing.current = true;
      
      setVideoUrl(data.videoUrl);
      setPlaying(false);
      setCurrentTime(0);
      toast.success(`${data.addedBy} changed the video`);
      
      // iOS Fix: Reset player if ready
      if (playerRef.current) {
        try {
          playerRef.current.seekTo(0, 'seconds');
        } catch (error) {
          console.error('Error resetting video:', error);
        }
      }
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
    });

    /**
     * State sync event - Full state synchronization
     * 
     * iOS → iOS: When new user joins or requests sync:
     * 1. Server sends complete room state
     * 2. Client applies all state at once
     * 3. Player syncs to current position
     * 4. On iOS, user must still tap to start (hasUserInteracted)
     */
    const unsubscribeSyncState = socketOn.onSyncState((data) => {
      console.log('📥 Received sync-state event:', data);
      
      isSyncing.current = true;
      
      if (data.currentVideoUrl) {
        setVideoUrl(data.currentVideoUrl);
        
        // Sync to current time with iOS safety
        syncToTime(data.currentTime);
        
        // Set playing state
        setPlaying(data.videoState === 'playing');
      }
      
      setTimeout(() => {
        isSyncing.current = false;
      }, 1000);
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
