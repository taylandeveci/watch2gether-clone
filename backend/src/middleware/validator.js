import Joi from 'joi';

/**
 * Regex for allowed characters in names (Latin + Turkish letters, digits, spaces, -, _, .)
 */
const NAME_REGEX = /^[A-Za-z0-9çğıöşüÇĞİÖŞÜ _.\-]+$/;

/**
 * Custom validator to ensure name contains at least one letter or digit
 */
const hasLetterOrDigit = (value, helpers) => {
  if (!/[A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(value.trim())) {
    return helpers.error('string.noContent');
  }
  return value;
};

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
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(NAME_REGEX)
    .custom(hasLetterOrDigit)
    .required()
    .messages({
      'string.empty': 'Room name is required',
      'string.min': 'Room name must be at least 2 characters',
      'string.max': 'Room name must be less than 50 characters',
      'string.pattern.base': 'Room name can only contain letters, numbers, spaces, -, _ and .',
      'string.noContent': 'Room name must contain at least one letter or number',
      'any.required': 'Room name is required',
    }),
  createdBy: Joi.string()
    .min(2)
    .max(50)
    .pattern(NAME_REGEX)
    .custom(hasLetterOrDigit)
    .required()
    .messages({
      'string.empty': 'Your name is required',
      'string.min': 'Your name must be at least 2 characters',
      'string.max': 'Your name must be less than 50 characters',
      'string.pattern.base': 'Your name can only contain letters, numbers, spaces, -, _ and .',
      'string.noContent': 'Your name must contain at least one letter or number',
      'any.required': 'Your name is required',
    }),
});

export const addVideoSchema = Joi.object({
  videoUrl: Joi.string().uri().required().messages({
    'string.empty': 'Video URL is required',
    'string.uri': 'Video URL must be a valid URL',
    'any.required': 'Video URL is required',
  }),
  videoTitle: Joi.string().max(200).optional().allow(''),
  addedBy: Joi.string()
    .min(2)
    .max(50)
    .pattern(NAME_REGEX)
    .custom(hasLetterOrDigit)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 2 characters',
      'string.max': 'Username must be less than 50 characters',
      'string.pattern.base': 'Username can only contain letters, numbers, spaces, -, _ and .',
      'string.noContent': 'Username must contain at least one letter or number',
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
