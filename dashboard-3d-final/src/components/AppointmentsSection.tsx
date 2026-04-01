"use client";

import { motion } from "framer-motion";
import Card3D from "./Card3D";

interface Appointment {
  id: string;
  patient: string;
  avatar: string;
  type: string;
  time: string;
  duration: string;
  doctor: string;
  status: "confirmed" | "pending" | "in-progress" | "completed";
}

const appointments: Appointment[] = [
  {
    id: "A-001",
    patient: "Anna Lee",
    avatar: "AL",
    type: "General Checkup",
    time: "09:00 AM",
    duration: "30 min",
    doctor: "Dr. Chen",
    status: "completed",
  },
  {
    id: "A-002",
    patient: "Mark Wilson",
    avatar: "MW",
    type: "Cardiac Consultation",
    time: "10:30 AM",
    duration: "45 min",
    doctor: "Dr. Patel",
    status: "in-progress",
  },
  {
    id: "A-003",
    patient: "Lisa Brown",
    avatar: "LB",
    type: "MRI Scan",
    time: "11:45 AM",
    duration: "60 min",
    doctor: "Dr. Kim",
    status: "confirmed",
  },
  {
    id: "A-004",
    patient: "Tom Harris",
    avatar: "TH",
    type: "Follow-up Visit",
    time: "02:00 PM",
    duration: "20 min",
    doctor: "Dr. Singh",
    status: "confirmed",
  },
  {
    id: "A-005",
    patient: "Rachel Kim",
    avatar: "RK",
    type: "Blood Work",
    time: "03:15 PM",
    duration: "15 min",
    doctor: "Dr. Johnson",
    status: "pending",
  },
];

const statusStyles = {
  confirmed: { text: "text-healthcare-400", bg: "bg-healthcare-500/10", dot: "bg-healthcare-500" },
  pending: { text: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  "in-progress": { text: "text-mint-400", bg: "bg-mint-500/10", dot: "bg-mint-500" },
  completed: { text: "text-dark-400", bg: "bg-dark-500/10", dot: "bg-dark-500" },
};

const avatarGradients = [
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
];

export default function AppointmentsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Today&apos;s </span>
            <span className="text-gradient">Schedule</span>
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Upcoming appointments and schedule management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card3D className="p-6" glowColor="rgba(51, 141, 255, 0.1)">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Appointments
                </h3>
                <span className="text-sm text-dark-400">
                  {appointments.length} scheduled
                </span>
              </div>

              <div className="space-y-3">
                {appointments.map((apt, i) => {
                  const style = statusStyles[apt.status];
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/30 hover:bg-dark-900/50 transition-colors group cursor-pointer"
                    >
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium text-white">
                          {apt.time}
                        </p>
                        <p className="text-xs text-dark-400">{apt.duration}</p>
                      </div>

                      <div className="w-px h-10 bg-dark-700" />

                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                      >
                        {apt.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {apt.patient}
                        </p>
                        <p className="text-xs text-dark-400 truncate">
                          {apt.type} · {apt.doctor}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <motion.div
                          animate={
                            apt.status === "in-progress"
                              ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
                              : {}
                          }
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={`w-2 h-2 rounded-full ${style.dot}`}
                        />
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg} hidden sm:inline`}
                        >
                          {apt.status.replace("-", " ")}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card3D>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card3D className="p-6" glowColor="rgba(20, 209, 92, 0.15)">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "➕", label: "New Patient", color: "from-healthcare-600 to-healthcare-500" },
                    { icon: "📅", label: "Schedule", color: "from-mint-600 to-mint-500" },
                    { icon: "📋", label: "Reports", color: "from-purple-600 to-purple-500" },
                    { icon: "💊", label: "Prescribe", color: "from-amber-600 to-amber-500" },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white text-center transition-shadow hover:shadow-glow`}
                    >
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <div className="text-xs font-medium">{action.label}</div>
                    </motion.button>
                  ))}
                </div>
              </Card3D>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card3D className="p-6" glowColor="rgba(168, 85, 247, 0.15)">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: "🔴",
                      text: "Critical patient alert - Room ICU-12",
                      time: "2 min ago",
                    },
                    {
                      icon: "💉",
                      text: "Lab results ready for P-003",
                      time: "15 min ago",
                    },
                    {
                      icon: "📊",
                      text: "Monthly report generated",
                      time: "1 hr ago",
                    },
                  ].map((notif, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-dark-900/30 hover:bg-dark-900/50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm mt-0.5">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white leading-relaxed">
                          {notif.text}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card3D>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}