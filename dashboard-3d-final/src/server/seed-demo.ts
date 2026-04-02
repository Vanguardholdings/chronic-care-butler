/**
 * Demo Data Seeder
 * Creates realistic patient data for investor demo
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Patient from './models/Patient';
import User from './models/User';
import Medication from './models/Medication';
import Appointment from './models/Appointment';

const DEMO_DATA = {
  patients: [
    {
      name: '张三',
      nameEn: 'Zhang San',
      age: 68,
      gender: 'male',
      condition: '2型糖尿病、高血压',
      conditionEn: 'Type 2 Diabetes, Hypertension',
      status: 'stable',
      room: '301A',
      doctor: '李医生',
      vitals: {
        heartRate: 72,
        bloodPressureSystolic: 135,
        bloodPressureDiastolic: 85,
        temperature: 98.6,
        oxygenSaturation: 97,
        respiratoryRate: 16,
        timestamp: new Date(),
      },
    },
    {
      name: '李四',
      nameEn: 'Li Si',
      age: 72,
      gender: 'female',
      condition: '冠心病、慢性心衰',
      conditionEn: 'Coronary Heart Disease, Chronic Heart Failure',
      status: 'critical',
      room: 'ICU-2',
      doctor: '王医生',
      vitals: {
        heartRate: 88,
        bloodPressureSystolic: 160,
        bloodPressureDiastolic: 95,
        temperature: 99.2,
        oxygenSaturation: 92,
        respiratoryRate: 22,
        timestamp: new Date(),
      },
    },
    {
      name: '王五',
      nameEn: 'Wang Wu',
      age: 65,
      gender: 'male',
      condition: '慢性阻塞性肺病',
      conditionEn: 'COPD',
      status: 'recovering',
      room: '305B',
      doctor: '李医生',
      vitals: {
        heartRate: 78,
        bloodPressureSystolic: 128,
        bloodPressureDiastolic: 82,
        temperature: 98.4,
        oxygenSaturation: 94,
        respiratoryRate: 18,
        timestamp: new Date(),
      },
    },
    {
      name: '赵六',
      nameEn: 'Zhao Liu',
      age: 58,
      gender: 'female',
      condition: '慢性肾病3期',
      conditionEn: 'Stage 3 Chronic Kidney Disease',
      status: 'stable',
      room: '402A',
      doctor: '陈医生',
      vitals: {
        heartRate: 75,
        bloodPressureSystolic: 140,
        bloodPressureDiastolic: 88,
        temperature: 98.6,
        oxygenSaturation: 96,
        respiratoryRate: 16,
        timestamp: new Date(),
      },
    },
    {
      name: '钱七',
      nameEn: 'Qian Qi',
      age: 70,
      gender: 'male',
      condition: '帕金森病、高血压',
      conditionEn: "Parkinson's Disease, Hypertension",
      status: 'stable',
      room: '403B',
      doctor: '刘医生',
      vitals: {
        heartRate: 70,
        bloodPressureSystolic: 145,
        bloodPressureDiastolic: 90,
        temperature: 98.4,
        oxygenSaturation: 95,
        respiratoryRate: 15,
        timestamp: new Date(),
      },
    },
    {
      name: '孙八',
      nameEn: 'Sun Ba',
      age: 75,
      gender: 'female',
      condition: '阿尔茨海默病',
      conditionEn: "Alzheimer's Disease",
      status: 'recovering',
      room: '501A',
      doctor: '陈医生',
      vitals: {
        heartRate: 68,
        bloodPressureSystolic: 130,
        bloodPressureDiastolic: 78,
        temperature: 98.2,
        oxygenSaturation: 97,
        respiratoryRate: 14,
        timestamp: new Date(),
      },
    },
  ],
  medications: [
    { name: '二甲双胍', nameEn: 'Metformin', dosage: '500mg', frequency: '每日两次', patientIndex: 0 },
    { name: '氨氯地平', nameEn: 'Amlodipine', dosage: '5mg', frequency: '每日一次', patientIndex: 0 },
    { name: '阿司匹林', nameEn: 'Aspirin', dosage: '100mg', frequency: '每日一次', patientIndex: 1 },
    { name: '美托洛尔', nameEn: 'Metoprolol', dosage: '50mg', frequency: '每日两次', patientIndex: 1 },
    { name: '沙美特罗', nameEn: 'Salmeterol', dosage: '50mcg', frequency: '每日两次吸入', patientIndex: 2 },
    { name: '布地奈德', nameEn: 'Budesonide', dosage: '200mcg', frequency: '每日两次吸入', patientIndex: 2 },
    { name: '厄贝沙坦', nameEn: 'Irbesartan', dosage: '150mg', frequency: '每日一次', patientIndex: 3 },
    { name: '左旋多巴', nameEn: 'Levodopa', dosage: '250mg', frequency: '每日三次', patientIndex: 4 },
    { name: '多奈哌齐', nameEn: 'Donepezil', dosage: '10mg', frequency: '每日一次睡前', patientIndex: 5 },
  ],
};

async function seedDemoData() {
  console.log('🌱 Seeding demo data...\n');

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB\n');

  try {
    // Get nurse and staff users
    const nurse = await User.findOne({ role: 'nurse' });
    const staff = await User.findOne({ role: 'staff' });

    if (!nurse || !staff) {
      console.log('⚠️  Nurse or staff not found. Run default seed first.');
      process.exit(1);
    }

    console.log(`👤 Assigning to Nurse: ${nurse.name}`);
    console.log(`👤 Assigning to Staff: ${staff.name}\n`);

    // Create patients
    const createdPatients = [];
    for (const patientData of DEMO_DATA.patients) {
      const patient = new Patient({
        ...patientData,
        assignedNurses: [nurse._id],
        assignedStaff: [staff._id],
        medications: [],
        appointments: [],
      });
      await patient.save();
      createdPatients.push(patient);
      console.log(`✅ Created patient: ${patient.name} (${patient.room})`);
    }

    // Create medications
    for (const medData of DEMO_DATA.medications) {
      const patient = createdPatients[medData.patientIndex];
      const medication = new Medication({
        name: medData.name,
        dosage: medData.dosage,
        frequency: medData.frequency,
        patientId: patient._id,
        prescribedBy: patient.doctor,
        startDate: new Date(),
        isActive: true,
        adherence: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
          taken: Math.random() > 0.2,
        })),
      });
      await medication.save();
      
      patient.medications.push(medication._id);
      await patient.save();
      
      console.log(`💊 Added medication: ${medData.name} for ${patient.name}`);
    }

    // Create appointments
    const today = new Date();
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + (i % 3));
      appointmentDate.setHours(9 + i * 2, 0, 0);

      const appointment = new Appointment({
        patientId: patient._id,
        type: ['followup', 'checkup', 'initial'][i % 3],
        dateTime: appointmentDate,
        status: i === 1 ? 'confirmed' : 'scheduled',
        doctor: patient.doctor,
        notes: '定期复诊 - 监测病情进展',
      });
      await appointment.save();

      patient.appointments.push(appointment._id);
      await patient.save();
      
      console.log(`📅 Created appointment: ${patient.name} on ${appointmentDate.toLocaleDateString()}`);
    }

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Patients: ${createdPatients.length}`);
    console.log(`   Medications: ${DEMO_DATA.medications.length}`);
    console.log(`   Appointments: ${createdPatients.length}`);
    console.log(`   Assigned to: ${nurse.name} (Nurse), ${staff.name} (Staff)`);

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedDemoData();
