"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  activeSection:
    | "analytics"
    | "products"
    | "orders"
    | "customers"
    | "reviews"
    | "settings";
  onSectionChange: (
    section:
      | "analytics"
      | "products"
      | "orders"
      | "customers"
      | "reviews"
      | "settings",
  ) => void;
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: Array<{
    id:
      | "analytics"
      | "products"
      | "orders"
      | "customers"
      | "reviews"
      | "settings";
    label: string;
    icon: any;
    description: string;
  }> = [
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      description: "Dashboard and metrics",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      description: "Manage inventory",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      description: "Order management",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      description: "Customer database",
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: Star,
      description: "Review management",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "System settings",
    },
  ];

  const handleLogout = async () => {
    try {
      const { signOutAdmin } = await import("@/lib/supabase/auth");
      await signOutAdmin();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSectionChange = (
    section: "analytics" | "products" | "orders" | "customers" | "settings",
  ) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ramana Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-l-4 border-green-500"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Logout</div>
                <div className="text-xs opacity-75">Sign out of admin</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
