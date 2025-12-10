import express from 'express';
import roomController from '../controllers/roomController.js';
import { validate, createRoomSchema, deleteRoomSchema } from '../middleware/validator.js';
import { createRoomLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/rooms/create
 * @desc    Create a new room
 * @access  Public
 */
router.post(
  '/create',
  createRoomLimiter,
  validate(createRoomSchema),
  roomController.createRoom
);

/**
 * @route   GET /api/rooms/:roomCode
 * @desc    Get room details by room code
 * @access  Public
 */
router.get('/:roomCode', roomController.getRoomByCode);

/**
 * @route   DELETE /api/rooms/:roomCode
 * @desc    Delete room (admin only)
 * @access  Public
 */
router.delete(
  '/:roomCode',
  validate(deleteRoomSchema),
  roomController.deleteRoom
);

/**
 * @route   GET /api/rooms/:roomCode/history
 * @desc    Get video history for a room
 * @access  Public
 */
router.get('/:roomCode/history', roomController.getVideoHistory);

export default router;
