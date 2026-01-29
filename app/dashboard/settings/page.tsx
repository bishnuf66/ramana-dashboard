"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  X,
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Edit,
  Trash2,
  Link,
} from "lucide-react";
import OrderViewModal from "@/components/orders/OrderViewModal";
import OrderTable from "@/components/orders/OrderTable";
import CustomersTab from "@/components/customers/CustomersTab";
import type { Database } from "@/types/database.types";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import ProductsPage from "@/components/products/ProductPage";
import SettingPage from "@/components/setting/SettingPage";

import Image from "next/image";
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  category?: {
    id: string;
    name: string;
    slug: string;
    picture: string | null;
  } | null;
};

// Define OrderItem interface manually since it might not exist in generated types
export interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Wrapper component that uses useSearchParams
function DashboardContent() {
  const [adminProfile, setAdminProfile] = useState<{
    user: { id: string; email: string | null; created_at?: string };
    admin: {
      id: string;
      email: string;
      role: string;
      created_at: string | null;
    };
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const current = await getCurrentAdmin();
      if (current) {
        setAdminProfile({
          user: {
            id: current.user.id,
            email: current.user.email ?? null,
            created_at: (current.user as any).created_at,
          },
          admin: current.admin,
        });
      } else {
        setAdminProfile(null);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {<SettingPage adminProfile={adminProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export that wraps the dashboard content in Suspense
export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
