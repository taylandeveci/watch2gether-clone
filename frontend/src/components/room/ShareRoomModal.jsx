import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Share2, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatRoomCode, copyToClipboard } from '../../utils/validators';
import toast from 'react-hot-toast';

/**
 * ShareRoomModal Component
 * Modal for sharing room information
 */
export const ShareRoomModal = ({ isOpen, onClose, roomInfo }) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomInfo?.roomCode}`;

  const handleCopyCode = async () => {
    const success = await copyToClipboard(roomInfo.roomCode);
    if (success) {
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      setCopiedLink(true);
      toast.success('Room link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
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
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      toast.error('Share not supported on this browser');
    }
  };

  if (!roomInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Room" size="md">
      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG
              value={roomUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-sm text-gray-400 text-center">
            Scan to join this room
          </p>
        </div>

        {/* Room code */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Room Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-3">
              <p className="text-xl font-mono font-bold text-primary text-center tracking-wider">
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
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Room link */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Room Link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-3">
              <p className="text-sm text-gray-300 truncate">{roomUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`
                p-3 rounded-xl transition-all duration-300
                ${
                  copiedLink
                    ? 'bg-green-500 text-white'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }
              `}
            >
              {copiedLink ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Share button */}
        {navigator.share && (
          <Button onClick={handleShare} variant="primary" className="w-full">
            <Share2 className="w-5 h-5 mr-2" />
            Share via...
          </Button>
        )}

        {/* Instructions */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-gray-300 text-center">
            Share the code, link, or scan the QR code to invite friends!
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ShareRoomModal;
