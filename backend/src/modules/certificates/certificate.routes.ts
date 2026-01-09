import { Router } from 'express';
import { certificateController } from './certificate.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/verify/:certificateId', certificateController.verifyCertificate);
router.get('/download/:certificateId', certificateController.downloadCertificate);
router.get('/:certificateId', certificateController.getCertificateById);

// User routes
router.post('/generate', authenticate, certificateController.generateCertificate);
router.get('/', authenticate, certificateController.getUserCertificates);

export default router;
