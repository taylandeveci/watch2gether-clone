import Joi from 'joi';

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @returns {function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Create a standardized validation error
      const validationError = new Error('Validation failed');
      validationError.statusCode = 400;
      validationError.isValidation = true;
      validationError.details = error.details.map((detail) => detail.message);
      
      return next(validationError);
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Validation schemas
 */

export const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Room name is required',
    'string.min': 'Room name must be at least 1 character',
    'string.max': 'Room name must be less than 100 characters',
    'any.required': 'Room name is required',
  }),
  createdBy: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Creator name is required',
    'string.min': 'Creator name must be at least 1 character',
    'string.max': 'Creator name must be less than 50 characters',
    'any.required': 'Creator name is required',
  }),
});

export const addVideoSchema = Joi.object({
  videoUrl: Joi.string().uri().required().messages({
    'string.empty': 'Video URL is required',
    'string.uri': 'Video URL must be a valid URL',
    'any.required': 'Video URL is required',
  }),
  videoTitle: Joi.string().max(200).optional().allow(''),
  addedBy: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Username is required',
    'any.required': 'Username is required',
  }),
});

export const updateVideoStateSchema = Joi.object({
  state: Joi.string().valid('playing', 'paused').required().messages({
    'any.only': 'State must be either "playing" or "paused"',
    'any.required': 'State is required',
  }),
  currentTime: Joi.number().min(0).required().messages({
    'number.base': 'Current time must be a number',
    'number.min': 'Current time must be a positive number',
    'any.required': 'Current time is required',
  }),
});

export const deleteRoomSchema = Joi.object({
  socketId: Joi.string().required().messages({
    'string.empty': 'Socket ID is required',
    'any.required': 'Socket ID is required',
  }),
});

export default {
  validate,
  createRoomSchema,
  addVideoSchema,
  updateVideoStateSchema,
  deleteRoomSchema,
};
