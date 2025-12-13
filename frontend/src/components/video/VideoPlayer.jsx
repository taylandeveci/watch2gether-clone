import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Pause, Play } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useRoomStore } from '../../stores/roomStore';

/**
 * VideoPlayer Component
 * Handles video playback with react-player
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
  
  // Mobile autoplay fix: Track if user has interacted (for non-admin clients)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Get current user info to check if admin
  const { currentUser } = useRoomStore();
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

  // Handle user interaction (tap/click) - required for mobile autoplay
  const handleUserInteract = () => {
    if (!hasUserInteracted) {
      console.log('[VideoPlayer] User interaction detected, enabling playback');
      setHasUserInteracted(true);

      // If admin is already playing, force internal player to start
      // This helps mobile browsers that require a direct play() call in a gesture
      if (playing) {
        try {
          const internal = playerRef.current?.getInternalPlayer?.();
          if (internal) {
            console.log('[VideoPlayer] Calling internal play() methods');
            if (typeof internal.play === 'function') {
              internal.play();
            }
            if (typeof internal.playVideo === 'function') {
              internal.playVideo();
            }
          }
        } catch (e) {
          console.warn('[VideoPlayer] Failed to call internal play()', e);
        }
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
    if (!isReady && state.playedSeconds >= 0) {
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

  // Effective playing state: Admin can always play, non-admin needs user interaction first
  const effectivePlaying = isAdmin ? playing : (playing && hasUserInteracted);

  // Three distinct overlay states for clearer logic
  const isVideoLoaded = !!url;

  // True loading: player not ready or buffering (for everyone)
  const showTrueLoading = isVideoLoaded && (!isReady || isBuffering);

  // Tap to start: non-admin, ready, not buffering, admin is playing, but user hasn't tapped yet
  const showTapToStart = 
    isVideoLoaded &&
    !isAdmin &&
    !hasUserInteracted &&
    isReady &&
    !isBuffering &&
    playing;

  // Paused: video ready, not buffering, not playing, and user is allowed to play
  const showPausedOverlay = 
    isVideoLoaded &&
    isReady &&
    !isBuffering &&
    !effectivePlaying &&
    (isAdmin || hasUserInteracted);

  // Debug logging for mobile troubleshooting
  useEffect(() => {
    if (!isAdmin && isVideoLoaded) {
      console.log('[VideoPlayer] Overlay states:', {
        isReady,
        isBuffering,
        playing,
        hasUserInteracted,
        effectivePlaying,
        showTrueLoading,
        showTapToStart,
        showPausedOverlay
      });
    }
  }, [isAdmin, isVideoLoaded, isReady, isBuffering, playing, hasUserInteracted, effectivePlaying, showTrueLoading, showTapToStart, showPausedOverlay]);

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

      {/* True loading overlay - not ready or buffering */}
      {showTrueLoading && !showTapToStart && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none">
          <LoadingSpinner size="xl" text="Loading video..." />
        </div>
      )}

      {/* Tap to start overlay - non-admin needs to tap once */}
      {showTapToStart && (
        <button
          type="button"
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white cursor-pointer"
          onClick={handleUserInteract}
          onTouchStart={handleUserInteract}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
            <Play className="w-10 h-10 text-white" fill="white" />
          </div>
          <div className="mb-3 rounded-full bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
            Tap to start playback
          </div>
          <p className="text-xs text-slate-300 max-w-[220px] text-center">
            Tap once to allow video playback on your device. After that, the video will stay synced with the admin.
          </p>
        </button>
      )}

      {/* Paused overlay */}
      {showPausedOverlay && !showTrueLoading && !showTapToStart && (
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
