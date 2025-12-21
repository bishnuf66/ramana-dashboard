"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Wedding Planner",
    content:
      "Bloom & Blossom created the most stunning arrangements for my client&apos;s wedding. The attention to detail and quality is unmatched. Highly recommended!",
    image: "/images/delivery-man.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Event Organizer",
    content:
      "I&apos;ve been working with them for over a year now. Every arrangement is a masterpiece. Their team truly understands the art of floral design.",
    image: "/images/delivery-man.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Happy Customer",
    content:
      "The flowers arrived fresh and beautiful, exactly as shown. The packaging was elegant and the arrangement lasted for weeks. Worth every penny!",
    image: "/images/delivery-man.jpg",
    rating: 5,
  },
];

export default function PremiumTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from our satisfied
            customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-12 h-12 text-green-100" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-green-200"
                />
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
