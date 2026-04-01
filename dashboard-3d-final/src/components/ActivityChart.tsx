"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Card3D from "./Card3D";

const weeklyData = [
  { day: "Mon", patients: 42, appointments: 38, revenue: 12400 },
  { day: "Tue", patients: 55, appointments: 48, revenue: 15800 },
  { day: "Wed", patients: 38, appointments: 35, revenue: 10200 },
  { day: "Thu", patients: 67, appointments: 58, revenue: 19600 },
  { day: "Fri", patients: 72, appointments: 65, revenue: 21000 },
  { day: "Sat", patients: 31, appointments: 28, revenue: 8400 },
  { day: "Sun", patients: 18, appointments: 15, revenue: 5200 },
];

const maxPatients = Math.max(...weeklyData.map((d) => d.patients));

function BarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex items-end gap-3 h-48">
      {weeklyData.map((data, i) => (
        <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-full flex items-end justify-center gap-1 h-40">
            <motion.div
              initial={{ height: 0 }}
              animate={isInView ? { height: `${(data.patients / maxPatients) * 100}%` } : {}}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="w-3 rounded-t-md bg-gradient-to-t from-healthcare-600 to-healthcare-400 relative group cursor-pointer"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {data.patients} patients
              </div>
            </motion.div>
            <motion.div
              initial={{ height: 0 }}
              animate={isInView ? { height: `${(data.appointments / maxPatients) * 100}%` } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 + 0.1, ease: "easeOut" }}
              className="w-3 rounded-t-md bg-gradient-to-t from-mint-600 to-mint-400 relative group cursor-pointer"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {data.appointments} appts
              </div>
            </motion.div>
          </div>
          <span className="text-xs text-dark-400">{data.day}</span>
        </div>
      ))}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color})`}
      />
    </svg>
  );
}

const departmentData = [
  {
    name: "Cardiology",
    patients: 234,
    trend: [12, 15, 18, 14, 22, 28, 25],
    color: "#ff4466",
    percentage: 28,
  },
  {
    name: "Neurology",
    patients: 189,
    trend: [8, 12, 10, 15, 18, 16, 20],
    color: "#338dff",
    percentage: 22,
  },
  {
    name: "Orthopedics",
    patients: 156,
    trend: [10, 8, 12, 14, 11, 16, 18],
    color: "#14d15c",
    percentage: 18,
  },
  {
    name: "Pediatrics",
    patients: 142,
    trend: [6, 9, 7, 11, 14, 12, 15],
    color: "#a855f7",
    percentage: 17,
  },
];

export default function ActivityChart() {
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
            <span className="text-white">Activity </span>
            <span className="text-gradient">Analytics</span>
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Comprehensive analytics and performance metrics across departments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card3D className="p-6" glowColor="rgba(51, 141, 255, 0.1)">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Weekly Overview
                  </h3>
                  <p className="text-sm text-dark-400">
                    Patient visits & appointments
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-healthcare-400" />
                    <span className="text-xs text-dark-400">Patients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-mint-400" />
                    <span className="text-xs text-dark-400">Appointments</span>
                  </div>
                </div>
              </div>
              <BarChart />
            </Card3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card3D className="p-6 h-full" glowColor="rgba(20, 209, 92, 0.1)">
              <h3 className="text-lg font-semibold text-white mb-1">
                Departments
              </h3>
              <p className="text-sm text-dark-400 mb-6">
                Patient distribution
              </p>
              <div className="space-y-5">
                {departmentData.map((dept, i) => (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="text-sm text-white">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MiniSparkline data={dept.trend} color={dept.color} />
                        <span className="text-sm font-medium text-white min-w-[40px] text-right">
                          {dept.patients}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${dept.percentage * 3}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card3D>
          </motion.div>
        </div>
      </div>
    </section>
  );
}