"use client";
import { ThemeProvider } from "@/components/context/ThemeContext";
import { AuthProvider, useAuth } from "@/components/context/AuthProvider";
import PremiumHeader from "@/components/global/PremiumHeader";
import AdminSidebar from "@/components/global/AdminSidebar";
import PremiumFooter from "@/components/global/PremiumFooter";
import FaviconSwitcher from "@/components/global/FaviconSwitcher";
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

  // Show full admin layout for authenticated users
  if (admin) {
    return (
      <>
        <FaviconSwitcher />
        {admin && <PremiumHeader />}
        <div className="flex pt-20 min-h-screen">
          {admin && (
            <Suspense
              fallback={
                <div className="w-64 bg-white dark:bg-gray-800 animate-pulse"></div>
              }
            >
              <AdminSidebar />
            </Suspense>
          )}
          <main className="flex-1">{children}</main>
        </div>
        <PremiumFooter />
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
