import express from 'express';
import videoController from '../controllers/videoController.js';
import { validate, addVideoSchema, updateVideoStateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   POST /api/rooms/:roomCode/video
 * @desc    Add video to room
 * @access  Public
 */
router.post(
  '/:roomCode/video',
  validate(addVideoSchema),
  videoController.addVideo
);

/**
 * @route   PATCH /api/rooms/:roomCode/state
 * @desc    Update video state (playing/paused)
 * @access  Public
 */
router.patch(
  '/:roomCode/state',
  validate(updateVideoStateSchema),
  videoController.updateVideoState
);

export default router;
