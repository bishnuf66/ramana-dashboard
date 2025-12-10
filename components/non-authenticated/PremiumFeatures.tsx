'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, Heart, Sparkles, Award, Leaf } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Fast and reliable delivery to your doorstep',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Premium quality flowers, guaranteed fresh',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Heart,
    title: 'Handcrafted with Love',
    description: 'Every arrangement is carefully crafted',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in floral design',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Sustainable and environmentally conscious',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Sparkles,
    title: 'Custom Arrangements',
    description: 'Personalized designs for special occasions',
    color: 'from-purple-500 to-pink-600',
  },
];

export default function PremiumFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-gradient">Bloom & Blossom</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to bringing you the finest floral experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

