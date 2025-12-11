import { getIO } from '../config/socket.js';
import roomService from './roomService.js';

/**
 * Socket Service
 * Handles all Socket.IO event logic
 */

class SocketService {
  /**
   * Initialize socket event handlers
   * @param {object} io - Socket.IO server instance
   */
  initialize(io) {
    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle join room
      socket.on('join-room', async (data) => {
        try {
          const { roomCode, userName } = data;

          if (!roomCode || !userName) {
            socket.emit('error', { message: 'Room code and username are required' });
            return;
          }

          // Get room info
          const room = await roomService.getRoomByCode(roomCode);

          // Check if this is the first participant (admin)
          const isAdmin = room.participants.length === 0;

          // Add participant
          await roomService.addParticipant(roomCode, userName, socket.id, isAdmin);

          // Join socket room
          socket.join(roomCode);

          // Get updated participants list
          const participants = await roomService.getParticipants(roomCode);

          // Send room state to the user who joined
          socket.emit('room-update', {
            room: {
              id: room.id,
              roomCode: room.roomCode,
              name: room.name,
              createdBy: room.createdBy,
              currentVideoUrl: room.currentVideoUrl,
              videoState: room.videoState,
              currentTime: room.currentTime,
            },
            participants: participants.map((p) => ({
              id: p.id,
              userName: p.userName,
              isAdmin: p.isAdmin,
              joinedAt: p.joinedAt,
            })),
            isAdmin,
          });

          // Notify other users in the room
          socket.to(roomCode).emit('user-joined', {
            userName,
            participants: participants.map((p) => ({
              id: p.id,
              userName: p.userName,
              isAdmin: p.isAdmin,
              joinedAt: p.joinedAt,
            })),
          });

          console.log(`✅ ${userName} joined room ${roomCode}`);
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: error.message || 'Failed to join room' });
        }
      });

      // Handle leave room
      socket.on('leave-room', async (data) => {
        try {
          const { roomCode } = data;
          await this.handleUserDisconnect(socket.id, roomCode);
        } catch (error) {
          console.error('Error leaving room:', error);
        }
      });

      // Handle play video
      socket.on('play-video', async (data) => {
        try {
          const { roomCode, currentTime } = data;

          // Update database
          await roomService.updateVideoState(roomCode, 'playing', currentTime);

          // Broadcast to all users in the room except sender
          socket.to(roomCode).emit('video-play', {
            currentTime,
            timestamp: Date.now(),
          });

          console.log(`▶️ Play video in room ${roomCode} at ${currentTime}s`);
        } catch (error) {
          console.error('Error playing video:', error);
          socket.emit('error', { message: 'Failed to play video' });
        }
      });

      // Handle pause video
      socket.on('pause-video', async (data) => {
        try {
          const { roomCode, currentTime } = data;

          // Update database
          await roomService.updateVideoState(roomCode, 'paused', currentTime);

          // Broadcast to all users in the room except sender
          socket.to(roomCode).emit('video-pause', {
            currentTime,
            timestamp: Date.now(),
          });

          console.log(`⏸️ Pause video in room ${roomCode} at ${currentTime}s`);
        } catch (error) {
          console.error('Error pausing video:', error);
          socket.emit('error', { message: 'Failed to pause video' });
        }
      });

      // Handle seek video
      socket.on('seek-video', async (data) => {
        try {
          const { roomCode, currentTime } = data;

          // Update database
          const room = await roomService.getRoomByCode(roomCode);
          await roomService.updateVideoState(roomCode, room.videoState, currentTime);

          // Broadcast to all users in the room except sender
          socket.to(roomCode).emit('video-seek', {
            currentTime,
            timestamp: Date.now(),
          });

          console.log(`⏩ Seek video in room ${roomCode} to ${currentTime}s`);
        } catch (error) {
          console.error('Error seeking video:', error);
          socket.emit('error', { message: 'Failed to seek video' });
        }
      });

      // Handle change video
      socket.on('change-video', async (data) => {
        try {
          const { roomCode, videoUrl, videoTitle, addedBy } = data;

          // Update database
          const result = await roomService.changeVideo(
            roomCode,
            videoUrl,
            videoTitle,
            addedBy
          );

          // Broadcast to all users in the room including sender
          io.to(roomCode).emit('video-changed', {
            videoUrl: result.currentVideoUrl,
            videoTitle,
            addedBy,
            videoInfo: result.videoInfo,
            timestamp: Date.now(),
          });

          console.log(`🎬 Video changed in room ${roomCode} by ${addedBy}`);
        } catch (error) {
          console.error('Error changing video:', error);
          socket.emit('error', { message: error.message || 'Failed to change video' });
        }
      });

      // Handle chat message
      socket.on('chat-message', async (data) => {
        try {
          const { roomCode, message } = data;

          if (!message || message.trim().length === 0) {
            return;
          }

          // Validate message length
          if (message.length > 500) {
            socket.emit('error', { message: 'Message too long (max 500 characters)' });
            return;
          }

          // Look up participant by socket.id to get actual userName
          const participant = await roomService.getParticipantBySocketId(socket.id);
          const userName = participant?.userName || 'Anonymous';

          // Broadcast to all users in the room including sender
          io.to(roomCode).emit('chat-message', {
            userName,
            message: message.trim(),
            timestamp: Date.now(),
          });

          console.log(`💬 Chat message in room ${roomCode} from ${userName}`);
        } catch (error) {
          console.error('Error sending chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle sync request
      socket.on('sync-request', async (data) => {
        try {
          const { roomCode } = data;

          // Get current room state
          const room = await roomService.getRoomByCode(roomCode);

          // Send current state to requester
          socket.emit('sync-state', {
            currentVideoUrl: room.currentVideoUrl,
            videoState: room.videoState,
            currentTime: room.currentTime,
            timestamp: Date.now(),
          });

          console.log(`🔄 Sync request for room ${roomCode}`);
        } catch (error) {
          console.error('Error handling sync request:', error);
          socket.emit('error', { message: 'Failed to sync' });
        }
      });

      // Handle kick user (admin only)
      socket.on('kick-user', async (data) => {
        try {
          const { roomCode, participantId } = data;

          if (!roomCode || !participantId) {
            socket.emit('error', { message: 'Room code and participant ID are required' });
            return;
          }

          // Get room info
          const room = await roomService.getRoomByCode(roomCode);

          // Find the requester (admin check)
          const requester = room.participants.find((p) => p.socketId === socket.id);

          if (!requester) {
            socket.emit('error', { message: 'You are not in this room' });
            return;
          }

          // Verify requester is admin
          if (!requester.isAdmin) {
            socket.emit('error', { message: 'Only the room admin can kick users' });
            return;
          }

          // Remove the participant by ID
          const result = await roomService.removeParticipantById(participantId);

          // Get the kicked user's socket
          const kickedSocket = io.sockets.sockets.get(result.socketId);

          // Notify the kicked user
          if (kickedSocket) {
            kickedSocket.emit('user-kicked', {
              message: 'You have been removed from the room by the admin',
              roomCode,
            });
            // Disconnect the kicked user from the room
            kickedSocket.leave(roomCode);
          }

          // Notify everyone in the room (including admin)
          io.to(roomCode).emit('user-left', {
            userName: result.userName,
            kicked: true,
            participants: result.remainingParticipants.map((p) => ({
              id: p.id,
              userName: p.userName,
              isAdmin: p.isAdmin,
              joinedAt: p.joinedAt,
            })),
          });

          console.log(`👞 ${result.userName} was kicked from room ${roomCode} by ${requester.userName}`);
        } catch (error) {
          console.error('Error kicking user:', error);
          socket.emit('error', { message: error.message || 'Failed to kick user' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        await this.handleUserDisconnect(socket.id);
      });
    });

    console.log('✅ Socket event handlers initialized');
  }

  /**
   * Handle user disconnect
   * @param {string} socketId - Socket ID
   * @param {string} roomCode - Room code (optional)
   */
  async handleUserDisconnect(socketId, roomCode = null) {
    try {
      const result = await roomService.removeParticipant(socketId);

      if (!result) {
        return;
      }

      const io = getIO();

      // Get room code from result if not provided
      if (!roomCode) {
        const room = await roomService.getRoomByCode(result.roomId);
        if (room) {
          roomCode = room.roomCode;
        }
      }

      if (roomCode) {
        // Notify other users
        io.to(roomCode).emit('user-left', {
          userName: result.userName,
          participants: result.remainingParticipants.map((p) => ({
            id: p.id,
            userName: p.userName,
            isAdmin: p.isAdmin,
            joinedAt: p.joinedAt,
          })),
        });

        console.log(`👋 ${result.userName} left room ${roomCode}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * Broadcast to room
   * @param {string} roomCode - Room code
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  broadcastToRoom(roomCode, event, data) {
    try {
      const io = getIO();
      io.to(roomCode).emit(event, data);
    } catch (error) {
      console.error('Error broadcasting to room:', error);
    }
  }
}

export default new SocketService();
