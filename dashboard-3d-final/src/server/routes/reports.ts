import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import Patient from '../models/Patient';
import Medication from '../models/Medication';
import Appointment from '../models/Appointment';
import Alert from '../models/Alert';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(authenticate);

/**
 * GET /api/reports/dashboard-stats
 * Get dashboard statistics
 */
router.get('/dashboard-stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Build filter based on role
    const patientFilter: Record<string, any> = {};
    if (req.user?.role === 'nurse') {
      patientFilter.assignedNurses = { $in: [req.user.id] };
    } else if (req.user?.role === 'staff') {
      patientFilter.assignedStaff = { $in: [req.user.id] };
    }

    const [
      totalPatients,
      criticalPatients,
      newPatients,
      medications,
      appointmentsToday,
      upcomingAppointments,
      alerts,
      unreadAlerts,
    ] = await Promise.all([
      Patient.countDocuments(patientFilter),
      Patient.countDocuments({ ...patientFilter, status: 'critical' }),
      Patient.countDocuments({ ...patientFilter, createdAt: { $gte: thirtyDaysAgo } }),
      Medication.countDocuments({ isActive: true }),
      Appointment.countDocuments({
        dateTime: { $gte: today, $lt: tomorrow },
        status: { $in: ['scheduled', 'confirmed'] },
      }),
      Appointment.countDocuments({
        dateTime: { $gte: now, $lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: { $in: ['scheduled', 'confirmed'] },
      }),
      Alert.countDocuments(),
      Alert.countDocuments({ acknowledged: false }),
    ]);

    // Calculate medication adherence
    const adherenceData = await Medication.aggregate([
      { $match: { adherence: { $exists: true, $ne: [] } } },
      { $unwind: '$adherence' },
      { $group: { _id: null, total: { $sum: 1 }, taken: { $sum: { $cond: ['$adherence.taken', 1, 0] } } } },
    ]);

    const adherenceRate = adherenceData.length > 0
      ? Math.round((adherenceData[0].taken / adherenceData[0].total) * 100)
      : 0;

    const response: ApiResponse = {
      success: true,
      data: {
        patients: {
          total: totalPatients,
          critical: criticalPatients,
          new: newPatients,
        },
        medications: {
          active: medications,
          adherenceRate,
        },
        appointments: {
          today: appointmentsToday,
          upcoming: upcomingAppointments,
        },
        alerts: {
          total: alerts,
          unread: unreadAlerts,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/patient-summary
 * Get patient summary report
 */
router.get('/patient-summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientFilter: Record<string, any> = {};
    if (req.user?.role === 'nurse') {
      patientFilter.assignedNurses = { $in: [req.user.id] };
    } else if (req.user?.role === 'staff') {
      patientFilter.assignedStaff = { $in: [req.user.id] };
    }

    const patients = await Patient.find(patientFilter)
      .populate('medications', 'name isActive')
      .populate('appointments', 'dateTime status')
      .lean();

    const summary = patients.map((p) => ({
      id: p._id,
      name: p.name,
      age: p.age,
      status: p.status,
      condition: p.condition,
      room: p.room,
      doctor: p.doctor,
      medicationCount: (p.medications || []).length,
      activeMedications: (p.medications || []).filter((m: any) => m.isActive).length,
      appointmentCount: (p.appointments || []).length,
      upcomingAppointments: (p.appointments || []).filter((a: any) => 
        new Date(a.dateTime) > new Date() && a.status !== 'cancelled'
      ).length,
    }));

    const response: ApiResponse = {
      success: true,
      data: summary,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/medication-adherence
 * Get medication adherence report
 */
router.get('/medication-adherence', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medications = await Medication.find({ isActive: true })
      .populate('patientId', 'name')
      .lean();

    const adherenceReport = medications.map((med: any) => {
      const totalDoses = med.adherence?.length || 0;
      const takenDoses = med.adherence?.filter((a: any) => a.taken).length || 0;
      const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

      return {
        id: med._id,
        name: med.name,
        patientName: med.patientId?.name || 'Unknown',
        dosage: med.dosage,
        frequency: med.frequency,
        adherenceRate,
        totalDoses,
        takenDoses,
        status: adherenceRate >= 80 ? 'good' : adherenceRate >= 60 ? 'fair' : 'poor',
      };
    });

    // Sort by adherence rate (ascending - worst first)
    adherenceReport.sort((a, b) => a.adherenceRate - b.adherenceRate);

    const response: ApiResponse = {
      success: true,
      data: adherenceReport,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/appointment-analytics
 * Get appointment analytics
 */
router.get('/appointment-analytics', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
      dateTime: { $gte: thirtyDaysAgo },
    }).lean();

    // Group by status
    const statusCounts = appointments.reduce((acc: any, apt: any) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Group by type
    const typeCounts = appointments.reduce((acc: any, apt: any) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {});

    // Daily appointment counts for last 30 days
    const dailyCounts: Record<string, number> = {};
    appointments.forEach((apt: any) => {
      const date = new Date(apt.dateTime).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const response: ApiResponse = {
      success: true,
      data: {
        total: appointments.length,
        byStatus: statusCounts,
        byType: typeCounts,
        dailyTrends: dailyCounts,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
