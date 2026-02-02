import { body } from 'express-validator';

export const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters'),
  body('event_type')
    .isIn(['seminar', 'workshop', 'webinar'])
    .withMessage('Invalid event type'),
  body('event_mode')
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Invalid event mode'),
  body('start_date')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('end_date')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('is_free')
    .isBoolean()
    .withMessage('is_free must be a boolean'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),
  body('has_certificate')
    .isBoolean()
    .withMessage('has_certificate must be a boolean'),
  body('online_link')
    .optional()
    .isURL()
    .withMessage('Invalid online link URL'),
  body('host_ids')
    .optional()
    .isArray()
    .withMessage('host_ids must be an array'),
  body('guests')
    .optional()
    .isArray()
    .withMessage('guests must be an array'),
];

export const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters'),
  body('event_type')
    .optional()
    .isIn(['seminar', 'workshop', 'webinar'])
    .withMessage('Invalid event type'),
  body('event_mode')
    .optional()
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Invalid event mode'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('event_status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid event status'),
  body('registration_status')
    .optional()
    .isIn(['open', 'closed', 'full'])
    .withMessage('Invalid registration status'),
  body('guests')
    .optional()
    .isArray()
    .withMessage('guests must be an array'),
];
