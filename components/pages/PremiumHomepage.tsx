"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PremiumHero from "../non-authenticated/PremiumHero";
import ExploreProducts from "../non-authenticated/ExploreProducts";
import PremiumTestimonials from "../non-authenticated/PremiumTestimonials";
import PremiumFeatures from "../non-authenticated/PremiumFeatures";
import PremiumCTA from "../non-authenticated/PremiumCTA";
import ContactSection from "../non-authenticated/ContactSection";

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8, delay }}
      className="mb-12"
    >
      {children}
    </motion.div>
  );
}

export default function PremiumHomepage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <PremiumHero />

      {/* Features Section */}
      <AnimatedSection delay={0.2}>
        <PremiumFeatures />
      </AnimatedSection>

      {/* Products Section */}
      <section
        id="products"
        className="py-20 bg-gradient-to-b from-white to-green-50/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-gradient">Premium Collection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked arrangements crafted with love and attention to detail
            </p>
          </motion.div>
          <ExploreProducts />
        </div>
      </section>

      {/* Testimonials */}
      <AnimatedSection delay={0.3}>
        <PremiumTestimonials />
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection delay={0.4}>
        <ContactSection />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.5}>
        <PremiumCTA />
      </AnimatedSection>
    </div>
  );
}
