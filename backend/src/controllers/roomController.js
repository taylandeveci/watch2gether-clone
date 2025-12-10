import roomService from '../services/roomService.js';

/**
 * Room Controller
 * Handles HTTP requests for room operations
 */

/**
 * Create a new room
 * POST /api/rooms/create
 */
export const createRoom = async (req, res, next) => {
  try {
    // Validation handled by Joi middleware
    const { name, createdBy } = req.body;

    const room = await roomService.createRoom(name, createdBy);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room by room code
 * GET /api/rooms/:roomCode
 */
export const getRoomByCode = async (req, res, next) => {
  try {
    const { roomCode } = req.params;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    const room = await roomService.getRoomByCode(roomCode);

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    next(error);
  }
};

/**
 * Delete room (admin only)
 * DELETE /api/rooms/:roomCode
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    // Validation handled by Joi middleware
    const { socketId } = req.body;

    // Only validate route params
    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    await roomService.deleteRoom(roomCode, socketId);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    if (error.message === 'Only room admin can delete the room') {
      return res.status(403).json({
        success: false,
        message: 'Only room admin can delete the room',
      });
    }
    next(error);
  }
};

/**
 * Get video history for a room
 * GET /api/rooms/:roomCode/history
 */
export const getVideoHistory = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    const history = await roomService.getVideoHistory(roomCode, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    if (error.message === 'Room not found') {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    next(error);
  }
};

export default {
  createRoom,
  getRoomByCode,
  deleteRoom,
  getVideoHistory,
};
