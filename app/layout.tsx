import type { Metadata } from "next";
import { CartProvider } from "@/components/context/CartContext";
import PremiumHeader from "@/components/non-authenticated/PremiumHeader";
import PremiumFooter from "@/components/global/PremiumFooter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom & Blossom - Premium Floral Arrangements",
  description: "Discover exquisite handcrafted flowers and accessories. Premium quality arrangements for every special moment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <PremiumHeader />
          <main className="pt-20">
            {children}
          </main>
          <PremiumFooter />
          <ToastContainer />
        </CartProvider>
      </body>
    </html>
  );
}

