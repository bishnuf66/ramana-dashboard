"use client";

import { motion, useAnimation, easeOut } from "framer-motion";
import { useEffect, useRef } from "react";
import ExploreProducts from "../non-authenticated/ExploreProducts";
import HomeBanner from "../non-authenticated/HomeBanner";
import Deals from "../non-authenticated/Deals";
import TestimonialCards from "../non-authenticated/Testimonials";

// Custom hook to detect when an element is in viewport
function useInView() {
  const ref = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const currentRef = ref.current;
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [controls]);

  return { ref, controls };
}

// Component for each animated section
function AnimatedSection({ children }: any) {
  const { ref, controls } = useInView();

  const variants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="mb-12"
    >
      {children}
    </motion.div>
  );
}

function Homepage() {
  return (
    <div>
      {/* The HomeBanner is visible immediately without animation */}
      <HomeBanner />

      {/* Other sections animate as you scroll down */}
      <AnimatedSection>
        <ExploreProducts />
      </AnimatedSection>

      <AnimatedSection>
        <ExploreProducts />
      </AnimatedSection>

      <AnimatedSection>
        <Deals />
      </AnimatedSection>

      <AnimatedSection>
        <ExploreProducts />
      </AnimatedSection>

      <AnimatedSection>
        <TestimonialCards />
      </AnimatedSection>
    </div>
  );
}

export default Homepage;
