import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';

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

  // Expose player methods to parent
  useEffect(() => {
    if (playerRef.current && onReady) {
      onReady(playerRef.current);
    }
  }, [playerRef.current]);

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

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        width="100%"
        height="100%"
        controls={false}
        onPlay={onPlay}
        onPause={onPause}
        onProgress={onProgress}
        onDuration={onDuration}
        onError={(error) => {
          console.error('Video player error:', error);
          onError?.(error);
        }}
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              modestbranding: 1,
            },
          },
          vimeo: {
            playerOptions: {
              byline: false,
              portrait: false,
            },
          },
        }}
      />

      {/* Loading overlay */}
      {!playing && url && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
