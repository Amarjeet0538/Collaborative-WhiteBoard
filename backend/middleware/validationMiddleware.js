import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const whiteboardIdValidation = [
  param('id').isMongoId().withMessage('Invalid whiteboard ID'),
  validate,
];

export const shareCodeValidation = [
  param('code').isLength({ min: 6, max: 6 }).withMessage('Invalid share code'),
  validate,
];
