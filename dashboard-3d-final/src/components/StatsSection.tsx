"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Card3D from "./Card3D";

interface StatData {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  change: string;
  changePositive: boolean;
  icon: string;
  color: string;
  glowColor: string;
}

const stats: StatData[] = [
  {
    label: "Total Patients",
    value: 12847,
    suffix: "",
    prefix: "",
    change: "+12.5%",
    changePositive: true,
    icon: "👥",
    color: "from-healthcare-500/20 to-healthcare-600/10",
    glowColor: "rgba(51, 141, 255, 0.2)",
  },
  {
    label: "Appointments Today",
    value: 284,
    suffix: "",
    prefix: "",
    change: "+8.2%",
    changePositive: true,
    icon: "📅",
    color: "from-mint-500/20 to-mint-600/10",
    glowColor: "rgba(20, 209, 92, 0.2)",
  },
  {
    label: "Recovery Rate",
    value: 94.7,
    suffix: "%",
    prefix: "",
    change: "+2.1%",
    changePositive: true,
    icon: "💊",
    color: "from-purple-500/20 to-purple-600/10",
    glowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    label: "Revenue",
    value: 847,
    suffix: "K",
    prefix: "$",
    change: "-3.4%",
    changePositive: false,
    icon: "💰",
    color: "from-amber-500/20 to-amber-600/10",
    glowColor: "rgba(245, 158, 11, 0.2)",
  },
];

function AnimatedNumber({
  value,
  suffix,
  prefix = "",
  duration = 2000,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasDecimal = value % 1 !== 0;

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentValue = eased * value;
      setCurrent(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {hasDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
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
            <span className="text-white">Dashboard </span>
            <span className="text-gradient">Overview</span>
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Real-time metrics and insights from your healthcare management system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card3D glowColor={stat.glowColor} className="p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl`}
                  >
                    {stat.icon}
                  </div>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      stat.changePositive
                        ? "text-mint-400 bg-mint-500/10"
                        : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </div>
                <div className="text-sm text-dark-400">{stat.label}</div>

                <div className="mt-4 h-1 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(stat.value / 150, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      stat.changePositive
                        ? "bg-gradient-to-r from-healthcare-500 to-mint-500"
                        : "bg-gradient-to-r from-red-500 to-orange-500"
                    }`}
                  />
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}