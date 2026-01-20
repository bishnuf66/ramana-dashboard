"use client";
import { ThemeProvider } from "@/components/context/ThemeContext";
import { AuthProvider, useAuth } from "@/components/context/AuthProvider";
import PremiumHeader from "@/components/global/PremiumHeader";
import AdminSidebar from "@/components/global/AdminSidebar";
import PremiumFooter from "@/components/global/PremiumFooter";
import FloatingContact from "@/components/global/FloatingContact";
import FaviconSwitcher from "@/components/global/FaviconSwitcher";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  console.log("FROM LAYOUT", admin);
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
      <FloatingContact />
      <ToastContainer
        theme="colored"
        toastClassName="dark:bg-gray-800 dark:text-white"
      />
    </>
  );
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
        <AuthProvider>
          <ThemeProvider>
            <LayoutContent>{children}</LayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
