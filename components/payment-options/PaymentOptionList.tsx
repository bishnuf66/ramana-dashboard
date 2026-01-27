"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, CreditCard, Smartphone, Building, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import type { PaymentOption } from "@/types/payment.types";
import PaymentOptionForm from "./PaymentOptionForm";

export default function PaymentOptionList() {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<PaymentOption | null>(null);

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("payment_options")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentOptions(data || []);
    } catch (error: any) {
      console.error("Error fetching payment options:", error);
      toast.error("Failed to fetch payment options");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (option: PaymentOption) => {
    setEditingOption(option);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment option?")) return;

    try {
      const option = paymentOptions.find(o => o.id === id);
      
      // Delete QR image if exists
      if (option?.qr_image_url) {
        try {
          const { deleteImage } = await import("@/lib/supabase/storage");
          await deleteImage(option.qr_image_url);
        } catch (imageError) {
          console.warn("Failed to delete payment QR image:", imageError);
          // Don't throw - continue with deletion
        }
      }

      const { error } = await (supabase as any)
        .from("payment_options")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Payment option deleted successfully");
      fetchPaymentOptions();
    } catch (error: any) {
      console.error("Error deleting payment option:", error);
      toast.error("Failed to delete payment option");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await (supabase as any)
        .from("payment_options")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Payment option ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchPaymentOptions();
    } catch (error: any) {
      console.error("Error updating payment option status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOption(null);
    fetchPaymentOptions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOption(null);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'esewa':
        return <Smartphone className="w-5 h-5" />;
      case 'khalti':
        return <CreditCard className="w-5 h-5" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'esewa':
        return 'eSewa';
      case 'khalti':
        return 'Khalti';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <PaymentOptionForm
          paymentOption={editingOption || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Options
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage payment methods for checkout
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payment Option
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : paymentOptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payment options yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first payment option to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment Option
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      option.payment_type === 'esewa' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : option.payment_type === 'khalti'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }`}>
                      {getPaymentIcon(option.payment_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getPaymentLabel(option.payment_type)}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(option.status)}`}>
                        {option.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {option.payment_type === 'bank_transfer' ? 'Account Number' : 'Phone Number'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.payment_number}
                    </p>
                  </div>

                  {option.qr_image_url && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">QR Code</p>
                      <div className="relative w-full h-32 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={option.qr_image_url}
                          alt={`${getPaymentLabel(option.payment_type)} QR Code`}
                          fill
                          className="object-contain bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(option)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleToggleStatus(option.id, option.status)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20 rounded transition-colors"
                  >
                    {option.status === 'active' ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Show
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(option.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
