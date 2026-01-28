"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { ArrowLeft, Save, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database.types";
import { useVerifyPayment } from "@/hooks/useUserPayments";

type Payment = Database["public"]["Tables"]["user_payments"]["Row"];
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];

export default function EditPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const verifyPaymentMutation = useVerifyPayment();

  const [formData, setFormData] = useState({
    order_id: "",
    payment_option_id: "",
    paid_amount: "",
    remaining_amount: "",
    payment_type: "full",
    is_verified: false,
    transaction_id: "",
    payment_method: "",
    payment_screenshot: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchPayment();
      fetchPaymentOptions();
    }
  }, [params.id]);

  const fetchPayment = async () => {
    try {
      const { data, error } = await supabase
        .from("user_payments")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      setPayment(data);
      setFormData({
        order_id: data.order_id || "",
        payment_option_id: data.payment_option_id || "",
        paid_amount: data.paid_amount?.toString() || "",
        remaining_amount: data.remaining_amount?.toString() || "",
        payment_type: data.payment_type || "full",
        is_verified: data.is_verified || false,
        transaction_id: "",
        payment_method: "",
        payment_screenshot: data.payment_screenshot || "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch payment");
      router.push("/payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_options")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      setPaymentOptions(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch payment options");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("user_payments")
        .update({
          order_id: formData.order_id,
          payment_option_id: formData.payment_option_id,
          paid_amount: parseFloat(formData.paid_amount) || 0,
          remaining_amount: parseFloat(formData.remaining_amount) || 0,
          payment_type: formData.payment_type,
          is_verified: formData.is_verified,
          payment_screenshot: formData.payment_screenshot,
        })
        .eq("id", payment.id);

      if (error) throw error;

      toast.success("Payment updated successfully!");
      router.push("/payments");
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPayment = () => {
    if (!payment) return;

    verifyPaymentMutation.mutate({
      id: payment.id,
      verified: true,
    });
  };

  const handleUnverifyPayment = () => {
    if (!payment) return;

    verifyPaymentMutation.mutate({
      id: payment.id,
      verified: false,
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Payment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/payments"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Payment
            </h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Payment ID: #{payment.id.slice(0, 8)}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order ID
              </label>
              <input
                type="text"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter order ID"
              />
            </div>

            {/* Payment Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Option
              </label>
              <select
                name="payment_option_id"
                value={formData.payment_option_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select payment option</option>
                {paymentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.payment_type} - {option.payment_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paid Amount
              </label>
              <input
                type="number"
                name="paid_amount"
                value={formData.paid_amount}
                onChange={handleInputChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>

            {/* Remaining Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remaining Amount
              </label>
              <input
                type="number"
                name="remaining_amount"
                value={formData.remaining_amount}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Type
              </label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="full">Full Payment</option>
                <option value="partial">Partial Payment</option>
                <option value="advance">Advance Payment</option>
              </select>
            </div>

            {/* Payment Screenshot */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Screenshot URL
              </label>
              <input
                type="url"
                name="payment_screenshot"
                value={formData.payment_screenshot}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter screenshot URL"
              />
            </div>

            {/* Is Verified */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Verified
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {!payment?.is_verified && (
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={verifyPaymentMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {verifyPaymentMutation.isPending
                    ? "Verifying..."
                    : "Verify Payment"}
                </button>
              )}
              {payment?.is_verified && (
                <button
                  type="button"
                  onClick={handleUnverifyPayment}
                  disabled={verifyPaymentMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  {verifyPaymentMutation.isPending
                    ? "Unverifying..."
                    : "Unverify Payment"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/payments"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Updating..." : "Update Payment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
