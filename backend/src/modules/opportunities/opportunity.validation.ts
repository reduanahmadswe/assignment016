import { body } from 'express-validator';

export const createOpportunityValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('duration').optional().trim(),
    body('deadline').optional().isISO8601().withMessage('Invalid date format for deadline'),
    body('banner').optional().isURL().withMessage('Banner must be a valid URL'),
];

export const applyOpportunityValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').optional().trim(),
    body('cvLink').isURL().withMessage('Valid CV Link is required'),
    body('imageLink').optional().isURL().withMessage('Valid Image Link is required'),
];
