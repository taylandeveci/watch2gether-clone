import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useRoomStore } from '../../stores/roomStore';
import { socketEmit, socketOn } from '../../services/socket';
import { getUserColor, formatTime } from '../../utils/validators';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

/**
 * ChatBox Component
 * Real-time chat interface
 */
export const ChatBox = ({ roomCode }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { messages: messagesFromStore, currentUser, addMessage } = useRoomStore();
  
  // Ensure messages is always an array to prevent null.length crashes
  const messages = messagesFromStore || [];

  // Listen to chat messages
  useEffect(() => {
    const unsubscribe = socketOn.onChatMessage((data) => {
      addMessage({
        userName: data.userName,
        message: data.message,
        timestamp: data.timestamp,
      });
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if ((message || '').length > 500) {
      toast.error('Message is too long (max 500 characters)');
      return;
    }

    socketEmit.sendMessage(roomCode, message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border-2 border-border overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-white">Chat</h3>
        <span className="ml-auto text-sm text-gray-400">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400">No messages yet</p>
            <p className="text-gray-500 text-sm">Be the first to say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = (msg?.userName || '') === (currentUser?.userName || '');
            const avatarColor = getUserColor(msg?.userName);

            return (
              <div
                key={index}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    text-white font-semibold text-sm ${avatarColor}
                  `}
                >
                  {(msg?.userName || 'A').charAt(0).toUpperCase()}
                </div>

                {/* Message content */}
                <div
                  className={`flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`flex items-baseline gap-2 mb-1 ${
                      isOwnMessage ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span className="font-semibold text-sm text-white">
                      {msg?.userName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg?.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`
                      inline-block px-4 py-2 rounded-2xl max-w-[80%]
                      ${
                        isOwnMessage
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-background border border-border text-gray-200 rounded-tl-sm'
                      }
                    `}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {msg?.message || ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            className="px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {(message || '').length}/500 characters
        </p>
      </form>
    </div>
  );
};

export default ChatBox;
