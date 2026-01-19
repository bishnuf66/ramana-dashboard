import type { Metadata } from "next";
import { ThemeProvider } from "@/components/context/ThemeContext";
import PremiumHeader from "@/components/non-authenticated/PremiumHeader";
import PremiumFooter from "@/components/global/PremiumFooter";
import FloatingContact from "@/components/global/FloatingContact";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramana - Handmade Bouquets | Kathmandu Valley, Nepal",
  description:
    "Beautiful handmade bouquets crafted with love by Ramana. Premium quality floral arrangements for every special moment in Kathmandu Valley, Nepal. Hand made by Ramana with passion and care.",
  keywords:
    "handmade bouquets, flowers Kathmandu, Nepal flowers, custom bouquets, floral arrangements Kathmandu Valley, handcrafted flowers Nepal, Ramana bouquets",
  icons: {
    icon: "/favicon-light.ico",
    apple: "/favicon-light.ico",
  },
  openGraph: {
    title: "Ramana - Handmade Bouquets | Kathmandu Valley",
    description:
      "Beautiful handmade bouquets crafted with love by Ramana in Kathmandu Valley, Nepal",
    url: "https://ramana.com.np",
    siteName: "Ramana Handmade Bouquets",
    locale: "en_US",
    type: "website",
  },
};

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
        <ThemeProvider>
          <FaviconSwitcher />
          <PremiumHeader />
          <main className="pt-20 min-h-screen">{children}</main>
          <PremiumFooter />
          <FloatingContact />
          <ToastContainer
            theme="colored"
            toastClassName="dark:bg-gray-800 dark:text-white"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
