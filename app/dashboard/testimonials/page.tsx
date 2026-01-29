"use client";

import TestimonialList from "@/components/testimonials/TestimonialList";

export default function TestimonialsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Testimonial Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer testimonials
        </p>
      </div>
      <TestimonialList />
    </div>
  );
}
