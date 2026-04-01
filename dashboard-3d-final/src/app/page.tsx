"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsSection from "@/components/StatsSection";
import PatientList from "@/components/PatientList";
import ActivityChart from "@/components/ActivityChart";
import AppointmentsSection from "@/components/AppointmentsSection";
import Footer from "@/components/Footer";

const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsapModule: typeof import("gsap") | null = null;
    let ScrollTriggerModule: any = null;

    const initGSAP = async () => {
      gsapModule = await import("gsap");
      const scrollTriggerImport = await import("gsap/ScrollTrigger");
      ScrollTriggerModule = scrollTriggerImport.ScrollTrigger;
      gsapModule.gsap.registerPlugin(ScrollTriggerModule);

      const sections = document.querySelectorAll(".scroll-section");
      sections.forEach((section) => {
        gsapModule!.gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      const parallaxElements = document.querySelectorAll(".parallax-layer");
      parallaxElements.forEach((el, i) => {
        const speed = (i + 1) * 0.15;
        gsapModule!.gsap.to(el, {
          yPercent: -30 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    };

    initGSAP();

    return () => {
      if (ScrollTriggerModule) {
        ScrollTriggerModule.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-healthcare-600/10 rounded-full blur-[120px] parallax-layer" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-mint-600/8 rounded-full blur-[100px] parallax-layer" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-healthcare-400/5 rounded-full blur-[80px] parallax-layer" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Hero3D />
          </div>
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="inline-block mb-4 px-4 py-2 text-sm font-medium rounded-full glass text-healthcare-300 border border-healthcare-500/30">
                ✦ Next-Gen Healthcare Platform
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="text-white">Your Health,</span>
                <br />
                <span className="text-gradient">Reimagined in 3D</span>
              </h1>
              <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
                Experience healthcare management through an immersive 3D
                interface. Real-time patient monitoring, analytics, and
                intelligent insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(51, 141, 255, 0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-gradient-to-r from-healthcare-600 to-healthcare-500 rounded-2xl font-semibold text-white shadow-glow transition-all"
                >
                  Launch Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 glass rounded-2xl font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/60 rounded-full" />
            </div>
          </motion.div>
        </section>

        <div className="scroll-section">
          <StatsSection />
        </div>

        <div className="scroll-section">
          <PatientList />
        </div>

        <div className="scroll-section">
          <ActivityChart />
        </div>

        <div className="scroll-section">
          <AppointmentsSection />
        </div>

        <Footer />
      </div>
    </div>
  );
}