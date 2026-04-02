import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import medicationRoutes from './medications';
import appointmentRoutes from './appointments';
import alertRoutes from './alerts';
import wechatRoutes from './wechat';
import reportRoutes from './reports';

const router = Router();

// Auth routes (no prefix needed, already under /api/auth)
router.use('/auth', authRoutes);

// WeChat routes - MUST come before catch-all routes that use auth middleware
router.use('/wechat', wechatRoutes);

// Patient routes
router.use('/patients', patientRoutes);

// Medication routes (handles both /patients/:id/medications and /medications/:id)
router.use('/', medicationRoutes);

// Appointment routes (handles both /patients/:id/appointments and /appointments/:id)
router.use('/', appointmentRoutes);

// Alert routes (handles /alerts and /patients/:id/alerts)
router.use('/alerts', alertRoutes);

// Patient-scoped alert route needs special handling
router.use('/', alertRoutes);

// Report routes
router.use('/reports', reportRoutes);

export default router;