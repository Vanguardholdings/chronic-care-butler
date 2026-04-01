"use client";

import { motion } from "framer-motion";
import Card3D from "./Card3D";

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: "stable" | "critical" | "recovering" | "discharged";
  avatar: string;
  room: string;
  doctor: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
  };
}

const patients: Patient[] = [
  {
    id: "P-001",
    name: "Sarah Mitchell",
    age: 34,
    condition: "Post-Surgery Recovery",
    status: "recovering",
    avatar: "SM",
    room: "204-A",
    doctor: "Dr. Chen",
    vitals: { heartRate: 72, bloodPressure: "120/80", temperature: 98.4 },
  },
  {
    id: "P-002",
    name: "James Rodriguez",
    age: 58,
    condition: "Cardiac Monitoring",
    status: "critical",
    avatar: "JR",
    room: "ICU-12",
    doctor: "Dr. Patel",
    vitals: { heartRate: 98, bloodPressure: "145/95", temperature: 99.1 },
  },
  {
    id: "P-003",
    name: "Emily Watson",
    age: 27,
    condition: "Appendectomy",
    status: "stable",
    avatar: "EW",
    room: "312-B",
    doctor: "Dr. Kim",
    vitals: { heartRate: 68, bloodPressure: "115/75", temperature: 98.6 },
  },
  {
    id: "P-004",
    name: "Robert Chen",
    age: 45,
    condition: "Knee Replacement",
    status: "recovering",
    avatar: "RC",
    room: "108-A",
    doctor: "Dr. Singh",
    vitals: { heartRate: 76, bloodPressure: "130/85", temperature: 98.2 },
  },
  {
    id: "P-005",
    name: "Maria Garcia",
    age: 62,
    condition: "Diabetes Management",
    status: "stable",
    avatar: "MG",
    room: "205-C",
    doctor: "Dr. Johnson",
    vitals: { heartRate: 70, bloodPressure: "128/82", temperature: 98.5 },
  },
  {
    id: "P-006",
    name: "David Thompson",
    age: 41,
    condition: "Pneumonia Treatment",
    status: "discharged",
    avatar: "DT",
    room: "N/A",
    doctor: "Dr. Lee",
    vitals: { heartRate: 65, bloodPressure: "118/76", temperature: 98.6 },
  },
];

const statusConfig = {
  stable: {
    color: "bg-healthcare-500",
    text: "text-healthcare-400",
    bg: "bg-healthcare-500/10",
    label: "Stable",
  },
  critical: {
    color: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10",
    label: "Critical",
  },
  recovering: {
    color: "bg-mint-500",
    text: "text-mint-400",
    bg: "bg-mint-500/10",
    label: "Recovering",
  },
  discharged: {
    color: "bg-dark-500",
    text: "text-dark-400",
    bg: "bg-dark-500/10",
    label: "Discharged",
  },
};

const avatarColors = [
  "from-healthcare-500 to-healthcare-700",
  "from-red-500 to-red-700",
  "from-mint-500 to-mint-700",
  "from-purple-500 to-purple-700",
  "from-amber-500 to-amber-700",
  "from-cyan-500 to-cyan-700",
];

function HeartRateIndicator({ rate, status }: { rate: number; status: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{
          repeat: Infinity,
          duration: 60 / rate,
          ease: "easeInOut",
        }}
        className={`w-2 h-2 rounded-full ${
          status === "critical" ? "bg-red-500" : "bg-mint-500"
        }`}
      />
      <span className="text-xs text-dark-400">{rate} bpm</span>
    </div>
  );
}

export default function PatientList() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              <span className="text-white">Active </span>
              <span className="text-gradient">Patients</span>
            </h2>
            <p className="text-dark-400">
              Monitor and manage patient status in real-time
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm text-healthcare-300 hover:text-white transition-colors"
          >
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient, i) => {
            const sc = statusConfig[patient.status];
            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                <Card3D
                  glowColor={
                    patient.status === "critical"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(51, 141, 255, 0.1)"
                  }
                  className="p-5 h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-white`}
                      >
                        {patient.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-dark-400">
                          {patient.id} · Age {patient.age}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.text} ${sc.bg}`}
                    >
                      {sc.label}
                    </span>
                  </div>

                  <div className="mb-4 p-3 rounded-xl bg-dark-900/50">
                    <p className="text-xs text-dark-400 mb-1">Condition</p>
                    <p className="text-sm text-white font-medium">
                      {patient.condition}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-dark-900/30">
                      <HeartRateIndicator
                        rate={patient.vitals.heartRate}
                        status={patient.status}
                      />
                    </div>
                    <div className="text-center p-2 rounded-lg bg-dark-900/30">
                      <p className="text-xs text-dark-400">BP</p>
                      <p className="text-xs text-white font-medium">
                        {patient.vitals.bloodPressure}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-dark-900/30">
                      <p className="text-xs text-dark-400">Temp</p>
                      <p className="text-xs text-white font-medium">
                        {patient.vitals.temperature}°F
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-dark-400">
                    <span>Room: {patient.room}</span>
                    <span>{patient.doctor}</span>
                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}