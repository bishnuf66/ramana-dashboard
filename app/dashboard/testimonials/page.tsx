"use client";

import TestimonialList from "@/components/testimonials/TestimonialList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TestimonialsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* List */}
      <TestimonialList />
    </div>
  );
}
