import cron from 'node-cron';
import Medication from '../models/Medication';
import Patient from '../models/Patient';
import WeChatBinding from '../models/WeChatBinding';
import { wechatService } from '../services/wechat';

/**
 * Medication Reminder Cron Job
 * Sends WeChat notifications to patients/families for medication adherence
 */

// Schedule: Run every hour to check for medications due
export const initReminderCron = (): void => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running medication reminder cron job...');
    await sendMedicationReminders();
    await sendAppointmentReminders();
  });

  // Run daily at 9 AM for daily summary
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily summary cron job...');
    await sendDailySummaries();
  });

  console.log('✅ Reminder cron jobs initialized');
};

/**
 * Send medication reminders for doses due in the next hour
 */
async function sendMedicationReminders(): Promise<void> {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Find all active medications
    const medications = await Medication.find({
      isActive: true,
    }).populate('patientId', 'name');

    for (const medication of medications) {
      const patient = medication.patientId as any;
      if (!patient) continue;

      // Check if it's time for this medication
      const shouldRemind = checkMedicationTime(medication.frequency, now);
      
      if (!shouldRemind) continue;

      // Find WeChat binding for patient
      const binding = await WeChatBinding.findOne({
        patientId: patient._id,
        isActive: true,
      });

      if (!binding) continue;

      // Send reminder
      try {
        await wechatService.sendMedicationReminder(
          binding.openId,
          patient.name,
          medication.name,
          medication.dosage,
          now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        );
        console.log(`✅ Sent medication reminder to ${patient.name} for ${medication.name}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${patient.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Medication reminder cron error:', error);
  }
}

/**
 * Check if it's time for medication based on frequency
 */
function checkMedicationTime(frequency: string, now: Date): boolean {
  const hour = now.getHours();
  
  switch (frequency.toLowerCase()) {
    case 'once_daily':
    case '每日一次':
      // Remind at 8 AM
      return hour === 8;
    
    case 'twice_daily':
    case '每日两次':
      // Remind at 8 AM and 8 PM
      return hour === 8 || hour === 20;
    
    case 'three_times_daily':
    case '每日三次':
      // Remind at 8 AM, 2 PM, 8 PM
      return hour === 8 || hour === 14 || hour === 20;
    
    case 'four_times_daily':
    case '每日四次':
      // Remind at 8 AM, 12 PM, 4 PM, 8 PM
      return hour === 8 || hour === 12 || hour === 16 || hour === 20;
    
    case 'weekly':
    case '每周':
      // Remind on Mondays at 9 AM
      return now.getDay() === 1 && hour === 9;
    
    case 'before_meals':
    case '饭前':
      // Remind before meals (7 AM, 12 PM, 6 PM)
      return hour === 7 || hour === 12 || hour === 18;
    
    default:
      return false;
  }
}

/**
 * Send appointment reminders for appointments in the next 24 hours
 */
async function sendAppointmentReminders(): Promise<void> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const Appointment = (await import('../models/Appointment')).default;
    
    // Find appointments in next 24 hours
    const appointments = await Appointment.find({
      dateTime: { $gte: now, $lte: tomorrow },
      status: { $in: ['scheduled', 'confirmed'] },
      reminderSent: { $ne: true },
    }).populate('patientId', 'name');

    for (const appointment of appointments) {
      const patient = appointment.patientId as any;
      if (!patient) continue;

      // Find WeChat binding
      const binding = await WeChatBinding.findOne({
        patientId: patient._id,
        isActive: true,
      });

      if (!binding) continue;

      // Send reminder
      try {
        await wechatService.sendAppointmentReminder(
          binding.openId,
          patient.name,
          appointment.type,
          appointment.doctor,
          new Date(appointment.dateTime).toLocaleString('zh-CN'),
          appointment.location || '待确认'
        );

        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();

        console.log(`✅ Sent appointment reminder to ${patient.name}`);
      } catch (error) {
        console.error(`Failed to send appointment reminder to ${patient.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Appointment reminder cron error:', error);
  }
}

/**
 * Send daily summary to patients/families
 */
async function sendDailySummaries(): Promise<void> {
  try {
    const bindings = await WeChatBinding.find({ isActive: true }).populate('patientId');

    for (const binding of bindings) {
      const patient = binding.patientId as any;
      if (!patient) continue;

      // Get today's medication adherence
      const medications = await Medication.find({
        patientId: patient._id,
        isActive: true,
      });

      let adherenceSummary = '';
      for (const med of medications) {
        const todayAdherence = med.adherence.filter(
          (a) => new Date(a.date).toDateString() === new Date().toDateString()
        );
        const taken = todayAdherence.filter((a) => a.taken).length;
        const total = todayAdherence.length || 1;
        adherenceSummary += `${med.name}: ${taken}/${total}次\n`;
      }

      if (!adherenceSummary) {
        adherenceSummary = '今日无服药记录\n';
      }

      // Send summary
      try {
        const message = `【每日健康摘要】\n\n患者：${patient.name}\n日期：${new Date().toLocaleDateString('zh-CN')}\n\n今日服药情况：\n${adherenceSummary}\n如有疑问请联系医护人员。`;
        
        await wechatService.sendTemplateMessage(
          binding.openId,
          process.env.WECHAT_SUMMARY_TEMPLATE_ID || '',
          `${process.env.FRONTEND_URL}/patient/dashboard`,
          {
            patient: { value: patient.name, color: '#173177' },
            date: { value: new Date().toLocaleDateString('zh-CN'), color: '#173177' },
            summary: { value: adherenceSummary, color: '#666666' },
            remark: { value: '祝您健康！', color: '#666666' },
          }
        );

        console.log(`✅ Sent daily summary to ${patient.name}`);
      } catch (error) {
        console.error(`Failed to send summary to ${patient.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Daily summary cron error:', error);
  }
}

export default {
  initReminderCron,
};
