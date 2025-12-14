import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Pause, Play } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useRoomStore } from '../../stores/roomStore';

/**
 * VideoPlayer Component
 * Handles video playback with react-player
 * 
 * iOS Autoplay Policy:
 * - iOS Safari blocks autoplay of videos with sound unless triggered by user gesture
 * - Non-admin users must tap once to "unlock" playback on their device
 * - After first tap, admin's play/pause/seek events work normally
 * - This is a browser security feature and cannot be bypassed
 */
export const VideoPlayer = ({
  url,
  playing,
  volume = 0.8,
  onPlay,
  onPause,
  onProgress,
  onDuration,
  onReady,
  onError,
  onEnded,
}) => {
  const playerRef = useRef(null);
  const prevUrlRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  /**
   * iOS Autoplay Workaround:
   * Track if non-admin user has interacted with the player.
   * This flag unlocks playback on iOS/mobile browsers.
   * Admin users don't need this as they initiate playback themselves.
   */
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Get current user info and video state from store
  const { currentUser, videoState } = useRoomStore();
  const isAdmin = currentUser?.isAdmin ?? false;

  // Reset states only when URL actually changes to a different value
  useEffect(() => {
    if (!url) {
      setIsReady(false);
      setIsBuffering(false);
      prevUrlRef.current = null;
      return;
    }
    
    // Only reset if URL is actually different from previous
    if (prevUrlRef.current !== url) {
      setIsReady(false);
      setIsBuffering(true);
      prevUrlRef.current = url;
      // Reset user interaction flag when video changes (require new tap)
      setHasUserInteracted(false);
    }
  }, [url]);

  const handleReady = (player) => {
    setIsReady(true);
    setIsBuffering(false);
    // IMPORTANT: Call parent onReady to expose player ref
    if (onReady) {
      onReady(player);
    }
  };

  const handleBuffer = () => {
    setIsBuffering(true);
  };

  const handleBufferEnd = () => {
    setIsBuffering(false);
  };

  /**
   * Handle user interaction (tap/click) - required for iOS autoplay unlock
   * 
   * When non-admin user taps:
   * 1. Set hasUserInteracted flag to true (unlocks iOS playback)
   * 2. If video is supposed to be playing, seek to current room time and start
   * 3. Hide the "Tap to start" overlay
   * 
   * This only needs to happen once per video. After that, admin's play/pause
   * events will control the video normally.
   */
  const handleUserInteract = () => {
    if (!hasUserInteracted && !isAdmin) {
      setHasUserInteracted(true);
      
      // If the room is already playing, sync to current time immediately
      if (playing && playerRef.current && videoState.currentTime) {
        // Seek to the room's current time so user catches up with others
        playerRef.current.seekTo(videoState.currentTime, 'seconds');
        
        // Note: ReactPlayer will start playing automatically because
        // the 'playing' prop is already true and hasUserInteracted is now true
      }
    }
  };

  // Mobile-friendly: Mark ready when play starts (iOS Safari may fire onPlay before onReady)
  const handlePlayerPlay = () => {
    if (!isReady) {
      setIsReady(true);
    }
    setIsBuffering(false);
    
    // Call parent onPlay handler
    if (onPlay) {
      onPlay();
    }
  };

  // Mobile fallback: If we get progress events, player is definitely ready
  const handlePlayerProgress = (state) => {
    if (!isReady && state.playedSeconds > 0) {
      setIsReady(true);
      setIsBuffering(false);
    }
    
    // Call parent onProgress handler
    if (onProgress) {
      onProgress(state);
    }
  };

  if (!url) {
    return (
      <div className="relative w-full aspect-video bg-background rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg">No video selected</p>
          <p className="text-gray-500 text-sm mt-2">
            Paste a video URL to get started
          </p>
        </div>
      </div>
    );
  }

  /**
   * Effective playing state for ReactPlayer:
   * - Admin: Always use the 'playing' prop directly (admin controls playback)
   * - Non-admin: Only play if user has interacted (iOS autoplay unlock)
   * 
   * This prevents autoplay errors on iOS while maintaining sync with admin.
   */
  const effectivePlaying = isAdmin ? playing : (playing && hasUserInteracted);

  /**
   * Overlay display logic:
   * 
   * Show "Tap to start" overlay when:
   * - Non-admin user hasn't interacted yet
   * - This is required for iOS autoplay policy compliance
   * 
   * Show loading overlay when:
   * - Video is not ready yet
   * - Video is buffering
   * 
   * Show paused overlay when:
   * - Video is ready and not buffering
   * - Video is not playing
   * - User has interacted (or is admin)
   */
  const showTapToStartOverlay = url && !isAdmin && !hasUserInteracted;
  const showLoadingOverlay = url && ((!isReady || isBuffering) && (isAdmin || hasUserInteracted));
  const showPausedOverlay = url && isReady && !isBuffering && !effectivePlaying && (isAdmin || hasUserInteracted);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={effectivePlaying}
        volume={volume}
        width="100%"
        height="100%"
        controls={false}
        playsinline
        onReady={() => handleReady(playerRef.current)}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        onPlay={handlePlayerPlay}
        onPause={onPause}
        onProgress={handlePlayerProgress}
        onDuration={onDuration}
        onError={(error) => {
          console.error('Video player error:', error);
          setIsBuffering(false);
          onError?.(error);
        }}
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
            },
          },
          vimeo: {
            playerOptions: {
              byline: false,
              portrait: false,
              playsinline: true,
            },
          },
          file: {
            attributes: {
              playsInline: true,
            },
          },
        }}
      />

      {/**
       * "Tap to start" overlay for iOS autoplay unlock
       * 
       * This overlay is CLICKABLE (button element) and appears on top of the video
       * for non-admin users who haven't tapped yet. This is required for iOS Safari
       * and other mobile browsers that block autoplay.
       * 
       * Once tapped, hasUserInteracted becomes true and this overlay never shows again
       * for this video, allowing normal sync control from admin.
       */}
      {showTapToStartOverlay && (
        <button
          onClick={handleUserInteract}
          onTouchStart={handleUserInteract}
          className="absolute inset-0 bg-black/80 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Tap to start video playback"
        >
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-semibold mb-2">Tap to Start Watching</p>
              <p className="text-gray-300 text-sm">Required for mobile browsers</p>
            </div>
          </div>
        </button>
      )}

      {/* Loading overlay - shown while video is buffering */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none">
          <LoadingSpinner size="xl" text="Loading video..." />
        </div>
      )}

      {/* Paused overlay - visual indicator when video is paused */}
      {showPausedOverlay && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Pause className="w-10 h-10 text-white" fill="white" />
            </div>
            <p className="text-white text-lg font-semibold">Paused</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
