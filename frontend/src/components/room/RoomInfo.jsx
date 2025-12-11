import React, { useState } from 'react';
import {
  Info,
  Copy,
  Share2,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatRoomCode, copyToClipboard } from '../../utils/validators';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * RoomInfo Component
 * Displays room information and sharing options
 */
export const RoomInfo = ({ roomInfo, onClose, onShare }) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomInfo.roomCode}`;

  const handleCopyCode = async () => {
    const success = await copyToClipboard(roomInfo.roomCode);
    if (success) {
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      toast.success('Room link copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomInfo.name} on Watch2gether`,
          text: `Watch videos together in real-time! Room code: ${roomInfo.roomCode}`,
          url: roomUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      onShare?.();
    }
  };

  return (
    <div className="bg-surface rounded-xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-white">{roomInfo.name}</h3>
      </div>

      {/* Content */}
      <div className="p-4">

      {/* Room code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Room Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-3">
            <p className="text-2xl font-mono font-bold text-primary text-center tracking-wider">
              {formatRoomCode(roomInfo.roomCode)}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className={`
              p-3 rounded-xl transition-all duration-300
              ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }
            `}
          >
            {copied ? (
              <Check className="w-6 h-6" />
            ) : (
              <Copy className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Room link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Room Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-3">
            <p className="text-sm text-gray-300 truncate">{roomUrl}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="p-3 rounded-xl bg-surface hover:bg-background text-gray-300 hover:text-white border-2 border-border hover:border-primary transition-all duration-300"
          >
            <Copy className="w-5 h-5" />
          </button>
          <a
            href={roomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-surface hover:bg-background text-gray-300 hover:text-white border-2 border-border hover:border-primary transition-all duration-300"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Creator info */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Created By
        </label>
        <p className="text-white font-medium">{roomInfo.createdBy}</p>
      </div>

      {/* Share button */}
      <Button onClick={handleShare} variant="primary" className="w-full">
        <Share2 className="w-5 h-5 mr-2" />
        Share Room
      </Button>

      {/* Info tip */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300">
              Share the room code or link with friends to watch together!
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RoomInfo;
