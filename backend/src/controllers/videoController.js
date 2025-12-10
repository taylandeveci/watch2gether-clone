import roomService from '../services/roomService.js';
import { parseVideoUrl } from '../utils/videoParser.js';

/**
 * Video Controller
 * Handles HTTP requests for video operations
 */

/**
 * Add video to room
 * POST /api/rooms/:roomCode/video
 */
export const addVideo = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    // Validation handled by Joi middleware
    const { videoUrl, videoTitle, addedBy } = req.body;

    // Only validate route params
    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    // Validate video URL format (business logic validation)
    try {
      parseVideoUrl(videoUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const result = await roomService.changeVideo(
      roomCode,
      videoUrl,
      videoTitle,
      addedBy
    );

    res.status(200).json({
      success: true,
      data: result,
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
 * Update video state (playing/paused)
 * PATCH /api/rooms/:roomCode/state
 */
export const updateVideoState = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    // Validation handled by Joi middleware
    const { state, currentTime } = req.body;

    // Only validate route params
    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: 'Room code is required',
      });
    }

    const result = await roomService.updateVideoState(roomCode, state, currentTime);

    res.status(200).json({
      success: true,
      data: result,
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
  addVideo,
  updateVideoState,
};
