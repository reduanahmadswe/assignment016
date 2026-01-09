import { Router } from 'express';
import { opportunityController } from './opportunity.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { createOpportunityValidation, applyOpportunityValidation } from './opportunity.validation.js';

const router = Router();

// Admin Routes (must be before :slug)
router.get('/admin/list', authenticate, requireAdmin, opportunityController.getAdminAll);
router.get('/applications', authenticate, requireAdmin, opportunityController.getApplications);
router.post('/', authenticate, requireAdmin, validate(createOpportunityValidation), opportunityController.create);
router.put('/:id', authenticate, requireAdmin, opportunityController.update);
router.delete('/:id', authenticate, requireAdmin, opportunityController.delete);

// Public Routes
router.get('/', opportunityController.getAll);
router.get('/:slug', opportunityController.getOne);
router.post('/:slug/apply', validate(applyOpportunityValidation), opportunityController.apply);

export default router;
