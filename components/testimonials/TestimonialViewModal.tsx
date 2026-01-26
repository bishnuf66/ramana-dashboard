"use client";

import { motion } from "framer-motion";
import { X, Star, Quote } from "lucide-react";
import Image from "next/image";
import type { Database } from "@/types/database.types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

interface TestimonialViewModalProps {
  testimonial: Testimonial;
  onClose: () => void;
}

export default function TestimonialViewModal({
  testimonial,
  onClose,
}: TestimonialViewModalProps) {
  const renderStars = (rating: number | null) => {
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= safeRating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Testimonial Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {testimonial.image ? (
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h3>
                {testimonial.role && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • {testimonial.role}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                {renderStars(testimonial.rating)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({testimonial.rating}/5)
                </span>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-gray-300 dark:text-gray-600 absolute -top-2 -left-2" />
                <blockquote className="text-gray-700 dark:text-gray-300 pl-6 italic">
                  "{testimonial.content}"
                </blockquote>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    testimonial.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {testimonial.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Created:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {testimonial.created_at
                    ? new Date(testimonial.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Last Updated:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {testimonial.updated_at
                    ? new Date(testimonial.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
