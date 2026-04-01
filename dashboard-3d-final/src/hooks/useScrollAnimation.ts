"use client";

import { useEffect, useRef } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animateOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", animateOnce = true } = options;
  const ref = useRef<T>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (animateOnce && hasAnimated.current) return;
            element.classList.add("animate-in");
            element.classList.remove("animate-out");
            hasAnimated.current = true;
          } else if (!animateOnce) {
            element.classList.remove("animate-in");
            element.classList.add("animate-out");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, animateOnce]);

  return ref;
}

export function useGSAPScrollAnimation() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cleanup: (() => void) | null = null;

    const init = async () => {
      try {
        const gsapModule = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsapModule.gsap.registerPlugin(ScrollTrigger);

        const elements = document.querySelectorAll("[data-scroll]");
        elements.forEach((el) => {
          const direction = el.getAttribute("data-scroll") || "up";
          const delay = parseFloat(el.getAttribute("data-scroll-delay") || "0");

          const from: Record<string, number> = { opacity: 0 };
          if (direction === "up") from.y = 60;
          if (direction === "down") from.y = -60;
          if (direction === "left") from.x = 60;
          if (direction === "right") from.x = -60;

          gsapModule.gsap.fromTo(el, from, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.8,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });

        cleanup = () => {
          ScrollTrigger.getAll().forEach((t) => t.kill());
        };
      } catch (e) {
        console.warn("GSAP initialization failed:", e);
      }
    };

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);
}