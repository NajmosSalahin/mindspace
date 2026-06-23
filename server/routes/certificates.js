import { Router } from 'express';
import { generateCertificates, getMyCertificates, downloadCertificate } from '../controllers/certificates.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/generate/:eventId', authenticate, authorize('organizer', 'admin'), generateCertificates);
router.get('/my-certificates', authenticate, getMyCertificates);
router.get('/download/:id', authenticate, downloadCertificate);

export default router;
