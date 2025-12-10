import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw } from 'lucide-react';
import { formatVideoDuration } from '../../utils/validators';

/**
 * VideoControls Component
 * Custom video controls
 */
export const VideoControls = ({
  playing,
  currentTime = 0,
  duration = 0,
  volume = 0.8,
  isAdmin,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  disabled = false,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [tempTime, setTempTime] = useState(currentTime);
  const [showVolume, setShowVolume] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempTime(value);
  };

  const handleSeekEnd = (e) => {
    const value = parseFloat(e.target.value);
    setIsSeeking(false);
    onSeek(value);
  };

  const togglePlayPause = () => {
    if (playing) {
      onPause();
    } else {
      onPlay();
    }
  };

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 0.8);
  };

  const displayTime = isSeeking ? tempTime : currentTime;

  return (
    <div className="bg-surface/95 backdrop-blur-md rounded-xl p-4 border-2 border-border">
      {/* Seek bar */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-mono min-w-[45px]">
            {formatVideoDuration(displayTime)}
          </span>

          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={displayTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              disabled={!isAdmin || disabled}
              className={`
                w-full h-2 rounded-full appearance-none cursor-pointer
                bg-border
                disabled:cursor-not-allowed disabled:opacity-50
              `}
              style={{
                background: `linear-gradient(to right, #6366f1 ${progress}%, #334155 ${progress}%)`,
              }}
            />
          </div>

          <span className="text-sm text-gray-400 font-mono min-w-[45px]">
            {formatVideoDuration(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            disabled={!isAdmin || disabled}
            className={`
              p-3 rounded-xl transition-all duration-300
              ${
                isAdmin && !disabled
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
            title={!isAdmin ? 'Only admin can control playback' : ''}
          >
            {playing ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Volume control */}
          <div
            className="relative"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl bg-surface hover:bg-background text-gray-300 hover:text-white transition-all duration-300"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Volume slider */}
            {showVolume && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border-2 border-border rounded-xl p-3 shadow-xl">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-24 rotate-0 h-2 rounded-full appearance-none cursor-pointer bg-border"
                  style={{
                    background: `linear-gradient(to right, #6366f1 ${
                      volume * 100
                    }%, #334155 ${volume * 100}%)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <RefreshCw className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500">
                Synced with admin
              </span>
            </div>
          )}

          <button
            onClick={onFullscreen}
            className="p-3 rounded-xl bg-surface hover:bg-background text-gray-300 hover:text-white transition-all duration-300"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
