import { Router } from 'express';

import {
  confirmConsent,
  createConsentSession,
  getConsent,
  joinConsentSession,
  listConsents,
  revokeConsent,
} from '../controllers/consentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listConsents);
router.get('/:id', getConsent);
router.post('/create', createConsentSession);
router.post('/join', joinConsentSession);
router.post('/confirm', confirmConsent);
router.post('/revoke', revokeConsent);

export default router;
