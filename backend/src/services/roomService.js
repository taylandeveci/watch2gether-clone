import { Op } from 'sequelize';
import Room from '../models/Room.js';
import Participant from '../models/Participant.js';
import VideoHistory from '../models/VideoHistory.js';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator.js';
import { parseVideoUrl } from '../utils/videoParser.js';

/**
 * Room Service
 * Handles all business logic for room operations
 */

class RoomService {
  /**
   * Create a new room
   * @param {string} name - Room name
   * @param {string} createdBy - Username of creator
   * @returns {Promise<object>} Created room
   */
  async createRoom(name, createdBy) {
    try {
      // Generate unique room code
      const roomCode = await generateUniqueRoomCode(async (code) => {
        const existingRoom = await Room.findByCode(code);
        return !!existingRoom;
      });

      // Create room
      const room = await Room.create({
        roomCode,
        name,
        createdBy,
        isActive: true,
      });

      return {
        id: room.id,
        roomCode: room.roomCode,
        name: room.name,
        createdBy: room.createdBy,
        currentVideoUrl: room.currentVideoUrl,
        videoState: room.videoState,
        currentTime: room.currentTime,
        createdAt: room.createdAt,
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  /**
   * Get room by room code
   * @param {string} roomCode - Room code
   * @returns {Promise<object>} Room with participants
   */
  async getRoomByCode(roomCode) {
    try {
      const room = await Room.findOne({
        where: { roomCode, isActive: true },
        include: [
          {
            model: Participant,
            as: 'participants',
            attributes: ['id', 'userName', 'socketId', 'isAdmin', 'joinedAt'],
          },
        ],
      });

      if (!room) {
        throw new Error('Room not found');
      }

      // Update last activity
      await room.updateActivity();

      return {
        id: room.id,
        roomCode: room.roomCode,
        name: room.name,
        createdBy: room.createdBy,
        currentVideoUrl: room.currentVideoUrl,
        videoState: room.videoState,
        currentTime: room.currentTime,
        participants: room.participants || [],
        createdAt: room.createdAt,
        lastActivity: room.lastActivity,
      };
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  }

  /**
   * Delete room (admin only)
   * @param {string} roomCode - Room code
   * @param {string} socketId - Socket ID of requester
   * @returns {Promise<boolean>} Success status
   */
  async deleteRoom(roomCode, socketId) {
    try {
      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if user is admin
      const participant = await Participant.findOne({
        where: { roomId: room.id, socketId, isAdmin: true },
      });

      if (!participant) {
        throw new Error('Only room admin can delete the room');
      }

      // Soft delete
      room.isActive = false;
      await room.save();

      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Add participant to room
   * @param {string} roomCode - Room code
   * @param {string} userName - Username
   * @param {string} socketId - Socket ID
   * @param {boolean} isAdmin - Is admin flag
   * @returns {Promise<object>} Created participant
   */
  async addParticipant(roomCode, userName, socketId, isAdmin = false) {
    try {
      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if participant already exists with this socket
      const existingParticipant = await Participant.findOne({
        where: { socketId },
      });

      if (existingParticipant) {
        return existingParticipant;
      }

      // Create participant
      const participant = await Participant.create({
        roomId: room.id,
        userName,
        socketId,
        isAdmin,
      });

      // Update room activity
      await room.updateActivity();

      return participant;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  /**
   * Remove participant from room
   * @param {string} socketId - Socket ID
   * @returns {Promise<object>} Removed participant and room info
   */
  async removeParticipant(socketId) {
    try {
      const participant = await Participant.findBySocketId(socketId);
      
      if (!participant) {
        return null;
      }

      const roomId = participant.roomId;
      const userName = participant.userName;
      const isAdmin = participant.isAdmin;

      await participant.destroy();

      // Get remaining participants
      const remainingParticipants = await Participant.getByRoomId(roomId);

      // If admin left and there are remaining participants, assign new admin
      if (isAdmin && remainingParticipants.length > 0) {
        const newAdmin = remainingParticipants[0];
        newAdmin.isAdmin = true;
        await newAdmin.save();
      }

      // If no participants left, deactivate room
      if (remainingParticipants.length === 0) {
        const room = await Room.findByPk(roomId);
        if (room) {
          room.isActive = false;
          await room.save();
        }
      }

      return {
        roomId,
        userName,
        isAdmin,
        remainingParticipants,
      };
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Remove participant by participant ID (for kick functionality)
   * @param {string} participantId - Participant UUID
   * @returns {Promise<object>} Removed participant and room info
   */
  async removeParticipantById(participantId) {
    try {
      const participant = await Participant.findByPk(participantId, {
        include: [{ model: Room, as: 'room' }],
      });
      
      if (!participant) {
        throw new Error('Participant not found');
      }

      const roomId = participant.roomId;
      const userName = participant.userName;
      const socketId = participant.socketId;
      const isAdmin = participant.isAdmin;

      // Admin cannot be kicked
      if (isAdmin) {
        throw new Error('Cannot kick the room admin');
      }

      await participant.destroy();

      // Get remaining participants
      const remainingParticipants = await Participant.getByRoomId(roomId);

      // If no participants left, deactivate room
      if (remainingParticipants.length === 0) {
        const room = await Room.findByPk(roomId);
        if (room) {
          room.isActive = false;
          await room.save();
        }
      }

      return {
        roomId,
        userName,
        socketId,
        isAdmin,
        remainingParticipants,
      };
    } catch (error) {
      console.error('Error removing participant by ID:', error);
      throw error;
    }
  }

  /**
   * Get participants in a room
   * @param {string} roomCode - Room code
   * @returns {Promise<array>} List of participants
   */
  async getParticipants(roomCode) {
    try {
      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      const participants = await Participant.getByRoomId(room.id);
      return participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  /**
   * Get participant by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Promise<object|null>} Participant or null
   */
  async getParticipantBySocketId(socketId) {
    try {
      const participant = await Participant.findBySocketId(socketId);
      return participant;
    } catch (error) {
      console.error('Error fetching participant by socket ID:', error);
      return null;
    }
  }

  /**
   * Update video state
   * @param {string} roomCode - Room code
   * @param {string} state - 'playing' or 'paused'
   * @param {number} currentTime - Current video time
   * @returns {Promise<object>} Updated room
   */
  async updateVideoState(roomCode, state, currentTime) {
    try {
      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      await room.updateVideoState(state, currentTime);

      return {
        roomCode: room.roomCode,
        videoState: room.videoState,
        currentTime: room.currentTime,
      };
    } catch (error) {
      console.error('Error updating video state:', error);
      throw error;
    }
  }

  /**
   * Change video URL
   * @param {string} roomCode - Room code
   * @param {string} videoUrl - New video URL
   * @param {string} videoTitle - Video title (optional)
   * @param {string} addedBy - Username who added the video
   * @returns {Promise<object>} Updated room
   */
  async changeVideo(roomCode, videoUrl, videoTitle, addedBy) {
    try {
      // Validate video URL
      const parsedVideo = parseVideoUrl(videoUrl);

      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      // Update room video
      await room.changeVideo(parsedVideo.url);

      // Add to video history
      await VideoHistory.create({
        roomId: room.id,
        videoUrl: parsedVideo.url,
        videoTitle: videoTitle || parsedVideo.url,
        addedBy: addedBy || 'Unknown',
      });

      return {
        roomCode: room.roomCode,
        currentVideoUrl: room.currentVideoUrl,
        videoState: room.videoState,
        currentTime: room.currentTime,
        videoInfo: parsedVideo,
      };
    } catch (error) {
      console.error('Error changing video:', error);
      throw error;
    }
  }

  /**
   * Get video history for a room
   * @param {string} roomCode - Room code
   * @param {number} limit - Max number of results
   * @returns {Promise<array>} Video history
   */
  async getVideoHistory(roomCode, limit = 50) {
    try {
      const room = await Room.findByCode(roomCode);
      if (!room) {
        throw new Error('Room not found');
      }

      const history = await VideoHistory.getByRoomId(room.id, limit);
      return history;
    } catch (error) {
      console.error('Error fetching video history:', error);
      throw error;
    }
  }

  /**
   * Clean up inactive rooms (older than 24 hours)
   * @returns {Promise<number>} Number of rooms cleaned up
   */
  async cleanupInactiveRooms() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await Room.update(
        { isActive: false },
        {
          where: {
            lastActivity: { [Op.lt]: twentyFourHoursAgo },
            isActive: true,
          },
        }
      );

      console.log(`✅ Cleaned up ${result[0]} inactive rooms`);
      return result[0];
    } catch (error) {
      console.error('Error cleaning up inactive rooms:', error);
      return 0;
    }
  }
}

export default new RoomService();
