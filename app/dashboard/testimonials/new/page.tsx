"use client";

import { useRouter } from "next/navigation";
import CreateTestimonialForm from "@/components/testimonials/CreateTestimonialForm";
import { Suspense } from "react";

function CreateTestimonialContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/testimonials");
  };

  const handleCancel = () => {
    router.push("/dashboard/testimonials");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Testimonial
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add a new customer testimonial
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <CreateTestimonialForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default function NewTestimonialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <CreateTestimonialContent />
    </Suspense>
  );
}
