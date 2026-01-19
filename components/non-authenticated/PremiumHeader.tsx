"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { Menu, X, User, ChevronDown, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../global/Logo";
import ThemeToggle from "../global/ThemeToggle";

import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PremiumHeader() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for authenticated user
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Load user profile from auth.users
        const { data: profile } = await supabase
          .from("auth.users")
          .select("id, email, raw_user_meta_data, created_at")
          .eq("id", user.id)
          .single();

        setUserProfile(profile);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Reload profile when user logs in
        supabase
          .from("auth.users")
          .select("id, email, raw_user_meta_data, created_at")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUserProfile(data));
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Logo
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full ring-2 ring-green-200 dark:ring-green-600 group-hover:ring-green-500 transition-all"
                />
              </motion.div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  Ramana
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Hand Made by Ramana
                </div>
              </div>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage products and orders
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Profile / Login */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {userProfile?.raw_user_meta_data?.avatar_url ? (
                      <Image
                        src={userProfile.raw_user_meta_data.avatar_url}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="max-w-32 truncate">
                      {userProfile?.raw_user_meta_data?.full_name ||
                        user.user_metadata?.full_name ||
                        user.user_metadata?.display_name ||
                        user.email?.split("@")[0] ||
                        "User"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {userProfile?.raw_user_meta_data?.full_name ||
                              user.user_metadata?.full_name ||
                              user.user_metadata?.display_name ||
                              "User"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/login")}
                  className="hidden md:flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <User className="w-4 h-4" />
                  Login
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <nav className="px-4 py-4 space-y-4">
                <Link
                  href="/"
                  className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="#products"
                  className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="#about"
                  className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Profile/Login */}
                {user ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userProfile?.raw_user_meta_data?.full_name ||
                            user.user_metadata?.full_name ||
                            user.user_metadata?.display_name ||
                            "User"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
