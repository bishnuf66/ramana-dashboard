"use client";
import React from "react";
import { ThemeProvider } from "@/components/context/ThemeContext";
import { AuthProvider, useAuth } from "@/components/context/AuthProvider";
import PremiumHeader from "@/components/global/PremiumHeader";
import AdminSidebar from "@/components/global/AdminSidebar";
import PremiumFooter from "@/components/global/PremiumFooter";
import FaviconSwitcher from "@/components/global/FaviconSwitcher";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // More reliable approach: check if this is likely a 404 by checking for invalid routes
  // Known valid routes and patterns
  const validRoutePatterns = [
    /^\/$/, // root
    /^\/login$/,
    /^\/auth\/callback$/,
    /^\/dashboard$/,
    /^\/dashboard\/analytics$/,
    /^\/dashboard\/products$/,
    /^\/dashboard\/orders$/,
    /^\/dashboard\/customers$/,
    /^\/dashboard\/reviews$/,
    /^\/dashboard\/blog$/,
    /^\/dashboard\/categories$/,
    /^\/dashboard\/discounts$/,
    /^\/dashboard\/testimonials$/,
    /^\/dashboard\/payment-options$/,
    /^\/dashboard\/payments$/,
    /^\/dashboard\/support$/,
    /^\/dashboard\/settings$/,
    /^\/blog(\/\d+)?(\/edit)?$/, // blog, blog/[id], blog/[id]/edit
    /^\/blog\/new$/, // blog/new
    /^\/categories(\/\d+)?(\/edit)?$/, // categories, categories/[id], categories/[id]/edit
    /^\/categories\/new$/, // categories/new
    /^\/discounts(\/\d+)?(\/edit)?$/, // discounts, discounts/[id], discounts/[id]/edit
    /^\/discounts\/new$/, // discounts/new
    /^\/payments(\/\d+)?(\/edit)?$/, // payments, payments/[id], payments/[id]/edit
    /^\/payments\/new$/, // payments/new
    /^\/products(\/\d+)?(\/edit)?$/, // products, products/[id], products/[id]/edit
    /^\/products\/new$/, // products/new
    /^\/testimonials(\/\d+)?(\/edit)?$/, // testimonials, testimonials/[id], testimonials/[id]/edit
    /^\/testimonials\/new$/, // testimonials/new
  ];

  const isNotFoundPage = !validRoutePatterns.some((pattern) =>
    pattern.test(pathname),
  );

  // Route protection using same logic as header/sidebar
  useEffect(() => {
    // Allow access to login page without authentication
    if (pathname === "/login" || pathname === "/auth/callback") {
      return;
    }

    // If not loading and not admin, redirect to login
    if (!loading && !admin) {
      console.log("Route protection: Redirecting to login");
      router.push("/login");
      return;
    }

    // If admin is on login page, redirect to dashboard
    if (!loading && admin && pathname === "/login") {
      console.log(
        "Route protection: Admin on login page, redirecting to dashboard",
      );
      router.push("/dashboard");
      return;
    }
  }, [admin, loading, pathname, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show login page layout for unauthenticated users on login page
  if (!admin && (pathname === "/login" || pathname === "/auth/callback")) {
    return (
      <>
        <FaviconSwitcher />
        <main className="flex-1">{children}</main>
        <ToastContainer
          theme="colored"
          toastClassName="dark:bg-gray-800 dark:text-white"
        />
      </>
    );
  }

  // Show full admin layout for authenticated users (except 404 page)
  if (admin && !isNotFoundPage) {
    return (
      <>
        <FaviconSwitcher />
        {admin && <PremiumHeader />}
        <div className="flex min-h-screen mt-20">
          {admin && (
            <Suspense
              fallback={
                <div className="w-64 bg-white dark:bg-gray-800 animate-pulse"></div>
              }
            >
              <AdminSidebar />
            </Suspense>
          )}
          <div className="flex-1 p-10">
            <div className="flex justify-start">
              <Breadcrumb />
            </div>
            <main>{children}</main>
          </div>
        </div>
        <PremiumFooter />
        <ToastContainer
          theme="colored"
          toastClassName="dark:bg-gray-800 dark:text-white"
        />
      </>
    );
  }

  // Show minimal layout for 404 page
  if (admin && isNotFoundPage) {
    return (
      <>
        <FaviconSwitcher />
        <main className="min-h-screen">{children}</main>
        <ToastContainer
          theme="colored"
          toastClassName="dark:bg-gray-800 dark:text-white"
        />
      </>
    );
  }

  // Fallback (shouldn't reach here due to redirect above)
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-light.ico" type="image/x-icon" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <LayoutContent>{children}</LayoutContent>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
