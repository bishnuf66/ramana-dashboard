"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import TestimonialForm from "@/components/testimonials/TestimonialForm";
import type { Database } from "@/types/database.types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

interface EditTestimonialPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap the params Promise
  const { id } = use(params);

  useEffect(() => {
    const fetchTestimonial = async () => {
      // Check if ID exists and is valid
      if (!id || id === "undefined") {
        console.error("Invalid testimonial ID:", id);
        toast.error("Invalid testimonial ID");
        router.push("/testimonials");
        return;
      }

      try {
        console.log("Fetching testimonial with ID:", id);
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Fetched testimonial:", data);
        setTestimonial(data);
      } catch (error) {
        console.error("Error fetching testimonial:", error);
        toast.error("Failed to fetch testimonial");
        router.push("/testimonials");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [id, router]);

  const handleSuccess = () => {
    router.push("/testimonials");
  };

  const handleCancel = () => {
    router.push("/testimonials");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Testimonial Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The testimonial you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Testimonial
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update testimonial information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TestimonialForm
            testimonial={testimonial}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
