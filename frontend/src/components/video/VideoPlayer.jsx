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
      setHasUserInteracted(true);
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

  // Effective playing state: Admin can always play, non-admin needs user interaction first
  const effectivePlaying = isAdmin ? playing : (playing && hasUserInteracted);

  // Overlay logic with mobile autoplay consideration
  const showLoadingOverlay = url && (
    !isReady || 
    isBuffering || 
    (!isAdmin && !hasUserInteracted)
  );
  
  const showPausedOverlay = url && 
    isReady && 
    !isBuffering && 
    !effectivePlaying && 
    (isAdmin || hasUserInteracted);

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
      onClick={handleUserInteract}
      onTouchStart={handleUserInteract}
    >
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

      {/* Loading overlay */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          {!isAdmin && !hasUserInteracted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Play className="w-10 h-10 text-white" fill="white" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-semibold mb-1">Tap to Start</p>
                <p className="text-gray-300 text-sm">Tap anywhere to enable playback</p>
              </div>
            </div>
          ) : (
            <LoadingSpinner size="xl" text="Loading video..." />
          )}
        </div>
      )}

      {/* Paused overlay */}
      {showPausedOverlay && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
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
