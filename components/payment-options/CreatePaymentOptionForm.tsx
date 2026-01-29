"use client";

import { useState } from "react";
import {
  Upload,
  X,
  CreditCard,
  Smartphone,
  Building,
  Save,
} from "lucide-react";
import Image from "next/image";
import { useCreatePaymentOption } from "@/hooks/usePaymentOptions";
import { useUpload } from "@/hooks/useUpload";
import { Database } from "@/types/database.types";

type PaymentOptionInsert =
  Database["public"]["Tables"]["payment_options"]["Insert"];

interface CreatePaymentOptionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreatePaymentOptionForm({
  onSuccess,
  onCancel,
}: CreatePaymentOptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const createMutation = useCreatePaymentOption();
  const uploadMutation = useUpload();

  const [formData, setFormData] = useState<{
    payment_type: "esewa" | "khalti" | "bank_transfer";
    payment_number: string;
    status: "active" | "inactive";
  }>({
    payment_type: "esewa",
    payment_number: "",
    status: "active",
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        bucket: "payment-qr-images",
      });
      return result.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleImagePreview = (file: File) => {
    setImageFile(file);

    // Create preview URL without uploading
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImagePreview(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let qrImageUrl = null;

      // Upload image only if a file was selected
      if (imageFile) {
        qrImageUrl = await uploadImage(imageFile);
      }

      const insertData: PaymentOptionInsert = {
        payment_type: formData.payment_type,
        payment_number: formData.payment_number,
        qr_image_url: qrImageUrl,
        status: formData.status,
      };

      createMutation.mutate(insertData, {
        onSuccess: () => {
          onSuccess();
        },
        onError: (error: any) => {
          console.error("Error creating payment option:", error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error saving payment option:", error);
      setLoading(false);
    }
  };

  const removeImage = () => {
    // Clean up the object URL to prevent memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Type
          </label>
          <select
            value={formData.payment_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_type: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="esewa">Esewa</option>
            <option value="khalti">Khalti</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Payment Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Number / Details
          </label>
          <input
            type="text"
            value={formData.payment_number}
            onChange={(e) =>
              setFormData({ ...formData, payment_number: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter payment number or bank details"
            required
          />
        </div>
      </div>

      {/* QR Code Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          QR Code Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="QR Code preview"
                  width={200}
                  height={200}
                  className="mx-auto h-32 w-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="qr-image-upload"
                className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
              >
                <span>Upload a file</span>
                <input
                  id="qr-image-upload"
                  name="qr-image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as "active" | "inactive",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? "Creating..." : "Create Payment Option"}
        </button>
      </div>
    </form>
  );
}
