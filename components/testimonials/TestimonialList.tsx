"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  MessageSquare,
} from "lucide-react";
import DeleteModal from "@/components/ui/DeleteModal";
import TestimonialViewModal from "./TestimonialViewModal";
import Pagination from "@/components/ui/Pagination";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { deleteImage } from "@/lib/supabase/storage";
import { toast } from "react-toastify";
import type { Database } from "@/types/database.types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const TestimonialList = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [testimonialToView, setTestimonialToView] =
    useState<Testimonial | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [selectedStatus]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(
      (testimonial) =>
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (testimonial.role?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false),
    );
  }, [testimonials, searchTerm]);

  const paginatedTestimonials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTestimonials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTestimonials, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

  const handleDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      // Step 1: Delete image from storage if it exists
      if (testimonialToDelete.image) {
        try {
          await deleteImage(testimonialToDelete.image);
        } catch (imageError) {
          console.warn("Failed to delete testimonial image:", imageError);
          // Don't throw - continue with database deletion
        }
      }

      // Step 2: Delete testimonial from database
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialToDelete.id);

      if (error) throw error;

      // Step 3: Update local state
      setTestimonials(
        testimonials.filter((t) => t.id !== testimonialToDelete.id),
      );
      setShowDeleteModal(false);
      setTestimonialToDelete(null);
      toast.success("Testimonial deleted successfully");
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleStatusToggle = async (testimonial: Testimonial) => {
    try {
      const newStatus = testimonial.status === "active" ? "inactive" : "active";

      // Temporary bypass of type checking until database types are regenerated
      const { error } = await supabase
        .from("testimonials")
        // @ts-ignore - Temporary fix for type mismatch
        .update({ status: newStatus })
        .eq("id", testimonial.id);

      if (error) throw error;

      setTestimonials(
        testimonials.map((t) =>
          t.id === testimonial.id ? { ...t, status: newStatus } : t,
        ),
      );
      toast.success(
        `Testimonial ${newStatus === "active" ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      console.error("Error updating testimonial status:", error);
      toast.error("Failed to update testimonial status");
    }
  };

  const renderStars = (rating: number | null) => {
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Link
          href="/testimonials/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedTestimonials.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No testimonials found
                  </td>
                </tr>
              ) : (
                paginatedTestimonials.map((testimonial) => (
                  <tr
                    key={testimonial.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {testimonial.image ? (
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {testimonial.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {testimonial.name}
                          </div>
                          {testimonial.role && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {testimonial.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(testimonial.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          testimonial.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {testimonial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.created_at
                        ? new Date(testimonial.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setTestimonialToView(testimonial);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/testimonials/${testimonial.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          onClick={() =>
                            console.log("Edit testimonial ID:", testimonial.id)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(testimonial)}
                          className={`${
                            testimonial.status === "active"
                              ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          }`}
                        >
                          {testimonial.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setTestimonialToDelete(testimonial);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredTestimonials.length}
        />
      )}

      {/* Modals */}
      {showViewModal && testimonialToView && (
        <TestimonialViewModal
          testimonial={testimonialToView}
          onClose={() => {
            setShowViewModal(false);
            setTestimonialToView(null);
          }}
        />
      )}

      {showDeleteModal && testimonialToDelete && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTestimonialToDelete(null);
          }}
          onConfirm={handleDelete}
          title="Delete Testimonial"
          description={`Are you sure you want to delete the testimonial from ${testimonialToDelete.name}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default TestimonialList;
