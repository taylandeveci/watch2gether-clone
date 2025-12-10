import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Room name is required')
    .max(100, 'Room name must be less than 100 characters'),
  createdBy: z
    .string()
    .min(1, 'Your name is required')
    .max(50, 'Name must be less than 50 characters'),
});

export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .min(8, 'Room code must be 8 characters')
    .max(8, 'Room code must be 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Room code must contain only uppercase letters and numbers'),
  userName: z
    .string()
    .min(1, 'Your name is required')
    .max(50, 'Name must be less than 50 characters'),
});

export const videoUrlSchema = z.object({
  videoUrl: z
    .string()
    .url('Please enter a valid URL')
    .min(1, 'Video URL is required'),
});

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message must be less than 500 characters'),
});

/**
 * Validate room code format
 */
export const validateRoomCode = (code) => {
  if (!code) return false;
  return /^[A-Z0-9]{8}$/.test(code);
};

/**
 * Format room code for display
 */
export const formatRoomCode = (code) => {
  if (!code) return '';
  return code.toUpperCase().replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Get user avatar color based on username
 */
export const getUserColor = (username) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];
  
  // Ensure username is never null/undefined
  const safeUsername = username || 'Anonymous';
  
  let hash = 0;
  for (let i = 0; i < safeUsername.length; i++) {
    hash = safeUsername.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format timestamp to readable time
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Different day
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format video duration
 */
export const formatVideoDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};
