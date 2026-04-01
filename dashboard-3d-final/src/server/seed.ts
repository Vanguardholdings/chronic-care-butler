import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './config/database';
import User from './models/User';
import Patient from './models/Patient';
import Medication from './models/Medication';
import Appointment from './models/Appointment';
import Alert from './models/Alert';

const seed = async (): Promise<void> => {
  try {
    await connectDatabase();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Medication.deleteMany({}),
      Appointment.deleteMany({}),
      Alert.deleteMany({}),
    ]);

    // ─── Users ──────────────────────────────────────────────
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        email: 'admin@chroniccare.com',
        passwordHash: 'admin123',
        role: 'admin',
        name: 'Dr. Sarah Admin',
      },
      {
        email: 'doctor@chroniccare.com',
        passwordHash: 'doctor123',
        role: 'doctor',
        name: 'Dr. Michael Chen',
      },
      {
        email: 'nurse@chroniccare.com',
        passwordHash: 'nurse123',
        role: 'nurse',
        name: 'Nancy Nightingale',
      },
      {
        email: 'staff@chroniccare.com',
        passwordHash: 'staff123',
        role: 'staff',
        name: 'James Staff',
      },
    ]);
    console.log(`   ✅ Created ${users.length} users`);

    // ─── Patients ───────────────────────────────────────────
    console.log('🏥 Creating patients...');
    const patientsData = [
      {
        name: 'Eleanor Thompson',
        age: 72,
        gender: 'female',
        condition: 'Type 2 Diabetes, Hypertension',
        status: 'stable',
        room: 'A-101',
        doctor: 'Dr. Michael Chen',
        vitals: {
          heartRate: 78,
          bloodPressureSystolic: 138,
          bloodPressureDiastolic: 85,
          temperature: 98.4,
          oxygenSaturation: 97,
          respiratoryRate: 16,
          timestamp: new Date(),
        },
        emergencyContact: {
          name: 'Robert Thompson',
          phone: '555-0101',
          relationship: 'Son',
        },
        notes: 'Patient managing well with current medication regimen.',
      },
      {
        name: 'James Mitchell',
        age: 65,
        gender: 'male',
        condition: 'COPD, Chronic Heart Failure',
        status: 'critical',
        room: 'ICU-3',
        doctor: 'Dr. Sarah Williams',
        vitals: {
          heartRate: 102,
          bloodPressureSystolic: 155,
          bloodPressureDiastolic: 95,
          temperature: 99.1,
          oxygenSaturation: 89,
          respiratoryRate: 24,
          timestamp: new Date(),
        },
        emergencyContact: {
          name: 'Linda Mitchell',
          phone: '555-0102',
          relationship: 'Wife',
        },
        notes: 'Oxygen levels concerning. Monitoring closely.',
      },
      {
        name: 'Maria Garcia',
        age: 58,
        gender: 'female',
        condition: 'Rheumatoid Arthritis, Osteoporosis',
        status: 'recovering',
        room: 'B-205',
        doctor: 'Dr. Michael Chen',
        vitals: {
          heartRate: 72,
          bloodPressureSystolic: 122,
          bloodPressureDiastolic: 78,
          temperature: 98.6,
          oxygenSaturation: 98,
          respiratoryRate: 14,
          timestamp: new Date(),
        },
        notes: 'Responding well to new treatment plan.',
      },
      {
        name: 'Robert Johnson',
        age: 80,
        gender: 'male',
        condition: 'Alzheimer\'s Disease, Type 2 Diabetes',
        status: 'stable',
        room: 'C-110',
        doctor: 'Dr. Amanda Foster',
        vitals: {
          heartRate: 68,
          bloodPressureSystolic: 130,
          bloodPressureDiastolic: 82,
          temperature: 98.2,
          oxygenSaturation: 96,
          respiratoryRate: 15,
          timestamp: new Date(),
        },
        emergencyContact: {
          name: 'Susan Johnson',
          phone: '555-0104',
          relationship: 'Daughter',
        },
      },
      {
        name: 'Patricia Williams',
        age: 45,
        gender: 'female',
        condition: 'Multiple Sclerosis',
        status: 'stable',
        room: 'B-302',
        doctor: 'Dr. Sarah Williams',
        vitals: {
          heartRate: 74,
          bloodPressureSystolic: 118,
          bloodPressureDiastolic: 75,
          temperature: 98.5,
          oxygenSaturation: 99,
          respiratoryRate: 14,
          timestamp: new Date(),
        },
        notes: 'Stable on current DMT therapy. Next MRI in 3 months.',
      },
      {
        name: 'William Brown',
        age: 68,
        gender: 'male',
        condition: 'Chronic Kidney Disease Stage 3, Hypertension',
        status: 'admitted',
        room: 'A-204',
        doctor: 'Dr. Amanda Foster',
        vitals: {
          heartRate: 82,
          bloodPressureSystolic: 145,
          bloodPressureDiastolic: 92,
          temperature: 98.8,
          oxygenSaturation: 95,
          respiratoryRate: 18,
          timestamp: new Date(),
        },
        emergencyContact: {
          name: 'Helen Brown',
          phone: '555-0106',
          relationship: 'Wife',
        },
        notes: 'Admitted for dialysis assessment. Labs pending.',
      },
      {
        name: 'Dorothy Davis',
        age: 76,
        gender: 'female',
        condition: 'Parkinson\'s Disease, Depression',
        status: 'stable',
        room: 'C-205',
        doctor: 'Dr. Michael Chen',
        vitals: {
          heartRate: 70,
          bloodPressureSystolic: 125,
          bloodPressureDiastolic: 80,
          temperature: 98.3,
          oxygenSaturation: 97,
          respiratoryRate: 15,
          timestamp: new Date(),
        },
      },
      {
        name: 'Charles Wilson',
        age: 55,
        gender: 'male',
        condition: 'Congestive Heart Failure, Atrial Fibrillation',
        status: 'critical',
        room: 'ICU-7',
        doctor: 'Dr. Sarah Williams',
        vitals: {
          heartRate: 115,
          bloodPressureSystolic: 160,
          bloodPressureDiastolic: 100,
          temperature: 99.5,
          oxygenSaturation: 91,
          respiratoryRate: 22,
          timestamp: new Date(),
        },
        emergencyContact: {
          name: 'Karen Wilson',
          phone: '555-0108',
          relationship: 'Wife',
        },
        notes: 'Irregular heartbeat detected. Cardiology consult requested.',
      },
    ];

    const patients = await Patient.create(patientsData);
    console.log(`   ✅ Created ${patients.length} patients`);

    // ─── Medications ────────────────────────────────────────
    console.log('💊 Creating medications...');
    const medicationsData = [
      // Eleanor Thompson
      { patientId: patients[0]._id, name: 'Metformin', dosage: '500mg', frequency: 'twice_daily', startDate: new Date('2024-01-15'), prescribedBy: 'Dr. Michael Chen', isActive: true, sideEffects: ['Nausea', 'Diarrhea'] },
      { patientId: patients[0]._id, name: 'Lisinopril', dosage: '10mg', frequency: 'once_daily', startDate: new Date('2024-01-15'), prescribedBy: 'Dr. Michael Chen', isActive: true },
      { patientId: patients[0]._id, name: 'Atorvastatin', dosage: '20mg', frequency: 'once_daily', startDate: new Date('2024-02-01'), prescribedBy: 'Dr. Michael Chen', isActive: true },
      // James Mitchell
      { patientId: patients[1]._id, name: 'Furosemide', dosage: '40mg', frequency: 'twice_daily', startDate: new Date('2024-03-01'), prescribedBy: 'Dr. Sarah Williams', isActive: true },
      { patientId: patients[1]._id, name: 'Tiotropium', dosage: '18mcg', frequency: 'once_daily', startDate: new Date('2024-03-01'), prescribedBy: 'Dr. Sarah Williams', isActive: true },
      { patientId: patients[1]._id, name: 'Carvedilol', dosage: '25mg', frequency: 'twice_daily', startDate: new Date('2024-03-05'), prescribedBy: 'Dr. Sarah Williams', isActive: true },
      // Maria Garcia
      { patientId: patients[2]._id, name: 'Methotrexate', dosage: '15mg', frequency: 'weekly', startDate: new Date('2024-02-10'), prescribedBy: 'Dr. Michael Chen', isActive: true, sideEffects: ['Nausea', 'Fatigue', 'Mouth sores'] },
      { patientId: patients[2]._id, name: 'Alendronate', dosage: '70mg', frequency: 'weekly', startDate: new Date('2024-02-10'), prescribedBy: 'Dr. Michael Chen', isActive: true },
      { patientId: patients[2]._id, name: 'Folic Acid', dosage: '1mg', frequency: 'once_daily', startDate: new Date('2024-02-10'), prescribedBy: 'Dr. Michael Chen', isActive: true },
      // Robert Johnson
      { patientId: patients[3]._id, name: 'Donepezil', dosage: '10mg', frequency: 'once_daily', startDate: new Date('2024-01-01'), prescribedBy: 'Dr. Amanda Foster', isActive: true },
      { patientId: patients[3]._id, name: 'Memantine', dosage: '10mg', frequency: 'twice_daily', startDate: new Date('2024-01-01'), prescribedBy: 'Dr. Amanda Foster', isActive: true },
      { patientId: patients[3]._id, name: 'Insulin Glargine', dosage: '20 units', frequency: 'once_daily', startDate: new Date('2024-01-15'), prescribedBy: 'Dr. Amanda Foster', isActive: true },
      // Patricia Williams
      { patientId: patients[4]._id, name: 'Ocrelizumab', dosage: '600mg', frequency: 'weekly', startDate: new Date('2024-03-01'), prescribedBy: 'Dr. Sarah Williams', isActive: true, sideEffects: ['Infusion reactions', 'Upper respiratory infection'] },
      // William Brown
      { patientId: patients[5]._id, name: 'Losartan', dosage: '100mg', frequency: 'once_daily', startDate: new Date('2024-04-01'), prescribedBy: 'Dr. Amanda Foster', isActive: true },
      { patientId: patients[5]._id, name: 'Sodium Bicarbonate', dosage: '650mg', frequency: 'three_times_daily', startDate: new Date('2024-04-01'), prescribedBy: 'Dr. Amanda Foster', isActive: true },
      // Charles Wilson
      { patientId: patients[7]._id, name: 'Warfarin', dosage: '5mg', frequency: 'once_daily', startDate: new Date('2024-04-10'), prescribedBy: 'Dr. Sarah Williams', isActive: true, sideEffects: ['Bleeding risk', 'Bruising'] },
      { patientId: patients[7]._id, name: 'Digoxin', dosage: '0.25mg', frequency: 'once_daily', startDate: new Date('2024-04-10'), prescribedBy: 'Dr. Sarah Williams', isActive: true },
      { patientId: patients[7]._id, name: 'Lisinopril', dosage: '20mg', frequency: 'once_daily', startDate: new Date('2024-04-10'), prescribedBy: 'Dr. Sarah Williams', isActive: true },
    ];

    // Add adherence records
    const addAdherence = (med: any) => {
      const adherence = [];
      const days = 14;
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        adherence.push({
          date,
          taken: Math.random() > 0.15, // 85% adherence rate
        });
      }
      return { ...med, adherence };
    };

    const medications = await Medication.create(medicationsData.map(addAdherence));
    console.log(`   ✅ Created ${medications.length} medications`);

    // Link medications to patients
    for (const med of medications) {
      await Patient.findByIdAndUpdate(med.patientId, {
        $push: { medications: med._id },
      });
    }

    // ─── Appointments ───────────────────────────────────────
    console.log('📅 Creating appointments...');
    const now = new Date();

    const appointmentsData = [
      // Eleanor Thompson
      { patientId: patients[0]._id, type: 'checkup', dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Michael Chen', location: 'Room A-101', duration: 30, notes: 'Routine diabetes checkup' },
      { patientId: patients[0]._id, type: 'lab_work', dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Michael Chen', location: 'Lab 2', duration: 15, notes: 'HbA1c and lipid panel' },
      { patientId: patients[0]._id, type: 'follow_up', dateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), status: 'completed', doctor: 'Dr. Michael Chen', location: 'Room A-101', duration: 30, notes: 'Blood pressure stable' },
      // James Mitchell
      { patientId: patients[1]._id, type: 'consultation', dateTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Sarah Williams', location: 'ICU-3', duration: 45, notes: 'Pulmonary function assessment' },
      { patientId: patients[1]._id, type: 'procedure', dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Sarah Williams', location: 'Procedure Room 1', duration: 60, notes: 'Bronchoscopy' },
      // Maria Garcia
      { patientId: patients[2]._id, type: 'therapy', dateTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Michael Chen', location: 'PT Room', duration: 60, notes: 'Physical therapy session' },
      { patientId: patients[2]._id, type: 'follow_up', dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Michael Chen', location: 'Room B-205', duration: 30 },
      // Robert Johnson
      { patientId: patients[3]._id, type: 'checkup', dateTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Amanda Foster', location: 'Room C-110', duration: 45, notes: 'Cognitive assessment' },
      // William Brown
      { patientId: patients[5]._id, type: 'procedure', dateTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'scheduled', doctor: 'Dr. Amanda Foster', location: 'Dialysis Unit', duration: 240, notes: 'Dialysis session' },
      // Charles Wilson
      { patientId: patients[7]._id, type: 'emergency', dateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), status: 'in_progress', doctor: 'Dr. Sarah Williams', location: 'ICU-7', duration: 120, notes: 'Cardiac monitoring and stabilization' },
    ];

    const appointments = await Appointment.create(appointmentsData);
    console.log(`   ✅ Created ${appointments.length} appointments`);

    // Link appointments to patients
    for (const appt of appointments) {
      await Patient.findByIdAndUpdate(appt.patientId, {
        $push: { appointments: appt._id },
      });
    }

    // ─── Alerts ─────────────────────────────────────────────
    console.log('🚨 Creating alerts...');
    const alertsData = [
      { patientId: patients[1]._id, type: 'vital_sign', priority: 'critical', message: 'Oxygen saturation dropped below 90% — Patient James Mitchell, ICU-3', acknowledged: false },
      { patientId: patients[7]._id, type: 'vital_sign', priority: 'critical', message: 'Heart rate elevated to 115 bpm with irregular rhythm — Patient Charles Wilson, ICU-7', acknowledged: false },
      { patientId: patients[7]._id, type: 'emergency', priority: 'critical', message: 'Atrial fibrillation episode detected — Immediate cardiology review required', acknowledged: false },
      { patientId: patients[1]._id, type: 'vital_sign', priority: 'high', message: 'Blood pressure 155/95 — above threshold for patient James Mitchell', acknowledged: false },
      { patientId: patients[5]._id, type: 'vital_sign', priority: 'high', message: 'Blood pressure 145/92 — elevated for CKD patient William Brown', acknowledged: false },
      { patientId: patients[0]._id, type: 'medication', priority: 'medium', message: 'Medication adherence below 80% this week for Eleanor Thompson — Metformin', acknowledged: false },
      { patientId: patients[3]._id, type: 'medication', priority: 'medium', message: 'Insulin administration due in 30 minutes — Robert Johnson, Room C-110', acknowledged: false },
      { patientId: patients[2]._id, type: 'appointment', priority: 'low', message: 'Physical therapy session tomorrow at 10:00 AM for Maria Garcia', acknowledged: false },
      { patientId: patients[0]._id, type: 'lab_result', priority: 'medium', message: 'HbA1c results available — Eleanor Thompson: 7.2% (target <7.0%)', acknowledged: true, acknowledgedBy: users[1]._id, acknowledgedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      { type: 'system', priority: 'low', message: 'Scheduled system maintenance tonight at 2:00 AM — 30 minute downtime expected', acknowledged: false },
      { patientId: patients[5]._id, type: 'appointment', priority: 'high', message: 'Dialysis session scheduled in 24 hours for William Brown — Pre-procedure labs required', acknowledged: false },
      { patientId: patients[6]._id, type: 'medication', priority: 'medium', message: 'Levodopa dose timing deviation detected — Dorothy Davis, Room C-205', acknowledged: false },
    ];

    const alerts = await Alert.create(alertsData);
    console.log(`   ✅ Created ${alerts.length} alerts`);

    // ─── Summary ────────────────────────────────────────────
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║          🌱 Database Seeded Successfully!    ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   Users:        ${String(users.length).padEnd(28)}║`);
    console.log(`║   Patients:     ${String(patients.length).padEnd(28)}║`);
    console.log(`║   Medications:  ${String(medications.length).padEnd(28)}║`);
    console.log(`║   Appointments: ${String(appointments.length).padEnd(28)}║`);
    console.log(`║   Alerts:       ${String(alerts.length).padEnd(28)}║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║   Login Credentials:                         ║');
    console.log('║   Admin:  admin@chroniccare.com / admin123   ║');
    console.log('║   Doctor: doctor@chroniccare.com / doctor123 ║');
    console.log('║   Nurse:  nurse@chroniccare.com / nurse123   ║');
    console.log('║   Staff:  staff@chroniccare.com / staff123   ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

seed();