"use client";

import { useRouter } from "next/navigation";
import TestimonialForm from "@/components/testimonials/TestimonialForm";

export default function NewTestimonialPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard?section=testimonials");
  };

  const handleCancel = () => {
    router.push("/dashboard?section=testimonials");
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Testimonial
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new customer testimonial
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TestimonialForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
