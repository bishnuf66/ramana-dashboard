"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { Upload, X, CreditCard, Smartphone, Building } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Database } from "@/types/database.types";
type PaymentOption = Database["public"]["Tables"]["payment_options"]["Row"];
type PaymentOptionInsert =
  Database["public"]["Tables"]["payment_options"]["Insert"];
type PaymentOptionUpdate =
  Database["public"]["Tables"]["payment_options"]["Update"];

interface PaymentOptionFormProps {
  paymentOption?: PaymentOption;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentOptionForm({
  paymentOption,
  onSuccess,
  onCancel,
}: PaymentOptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<{
    payment_type: "esewa" | "khalti" | "bank_transfer";
    payment_number: string;
    status: "active" | "inactive" | null;
  }>({
    payment_type: "esewa",
    payment_number: "",
    status: "active" as "active" | "inactive" | null,
  });

  useEffect(() => {
    if (paymentOption) {
      setFormData({
        payment_type: paymentOption.payment_type,
        payment_number: paymentOption.payment_number,
        status: (paymentOption.status || "active") as
          | "active"
          | "inactive"
          | null,
      });
      setImagePreview(paymentOption.qr_image_url || "");
    }
  }, [paymentOption]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Generate path for payment QR images
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `payment-qr/${timestamp}-${sanitizedFileName}`;

      const publicUrl = await uploadImage(file, fileName);
      setImagePreview(publicUrl);
      toast.success("QR code image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload QR code image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentOption) {
        // Check if image has changed and delete old image
        if (
          paymentOption.qr_image_url &&
          paymentOption.qr_image_url !== imagePreview
        ) {
          try {
            await deleteImage(paymentOption.qr_image_url);
          } catch (imageError) {
            console.warn("Failed to delete old payment QR image:", imageError);
            // Don't throw - continue with update
          }
        }

        // Update existing payment option
        const updateData: PaymentOptionUpdate = {
          payment_type: formData.payment_type,
          payment_number: formData.payment_number,
          qr_image_url: imagePreview || null,
          status: formData.status,
        };

        const { error } = await (supabase as any)
          .from("payment_options")
          .update(updateData)
          .eq("id", paymentOption.id);

        if (error) throw error;
        toast.success("Payment option updated successfully");
      } else {
        // Create new payment option
        const insertData: PaymentOptionInsert = {
          payment_type: formData.payment_type,
          payment_number: formData.payment_number,
          qr_image_url: imagePreview || null,
          status: formData.status,
        };

        const { error } = await (supabase as any)
          .from("payment_options")
          .insert([insertData]);

        if (error) throw error;
        toast.success("Payment option created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving payment option:", error);
      toast.error("Failed to save payment option");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "esewa":
        return <Smartphone className="w-5 h-5" />;
      case "khalti":
        return <CreditCard className="w-5 h-5" />;
      case "bank_transfer":
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case "esewa":
        return "eSewa";
      case "khalti":
        return "Khalti";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return type;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Type *
            </label>
            <select
              value={formData.payment_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_type: e.target.value as
                    | "esewa"
                    | "khalti"
                    | "bank_transfer",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.payment_type === "bank_transfer"
                ? "Account Number"
                : "Phone Number"}{" "}
              *
            </label>
            <input
              type="text"
              required
              value={formData.payment_number}
              onChange={(e) =>
                setFormData({ ...formData, payment_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={
                formData.payment_type === "bank_transfer"
                  ? "Enter bank account number"
                  : "Enter phone number"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status || "active"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive" | null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              QR Code Image
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="qr-image-upload"
              />
              <label
                htmlFor="qr-image-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              >
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="QR Code Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview("");
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload QR code
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Payment Type Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                {getPaymentIcon(formData.payment_type)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getPaymentLabel(formData.payment_type)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.payment_number || "No number provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : paymentOption ? "Update" : "Create"} Payment
          Option
        </button>
      </div>
    </form>
  );
}
