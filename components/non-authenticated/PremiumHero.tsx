'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PremiumHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden gradient-premium">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-gray-700">Premium Handcrafted Arrangements</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="text-gray-900">Blooms That</span>
              <br />
              <span className="text-gradient">Speak Your Heart</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              Discover our exquisite collection of handcrafted flowers and accessories. 
              Each arrangement is carefully curated to bring beauty and elegance to your special moments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="#products" className="btn-premium inline-flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 rounded-full font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-green-500 transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              <div>
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rose-600">1000+</div>
                <div className="text-sm text-gray-600">Arrangements</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/images/home-banner.jpg"
                  alt="Premium Flower Arrangement"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 glass"
              >
                <div className="text-2xl font-bold text-green-600">50%</div>
                <div className="text-sm text-gray-600">First Order</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

