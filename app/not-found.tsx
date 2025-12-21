"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Search, ArrowLeft, Flower } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Animated 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-rose-500 to-green-500 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for seems to have vanished into thin air
          </p>
          <p className="text-md text-gray-500">
            Maybe it was eaten by a hungry caterpillar or simply never existed
          </p>
        </motion.div>

        {/* Animated Flower Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-100 to-green-100 rounded-full">
            <Flower className="w-12 h-12 text-rose-500" />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-green-500 text-white font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-700 font-medium rounded-full border-2 border-gray-200 hover:border-rose-300 hover:shadow-md transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Admin Dashboard
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            View Cart
          </Link>
        </motion.div>

        {/* Helpful Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Looking for something specific?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <div className="text-rose-500 font-medium mb-1">
                Fresh Flowers
              </div>
              <div className="text-gray-600">
                Beautiful bouquets & arrangements
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-500 font-medium mb-1">
                Premium Fruits
              </div>
              <div className="text-gray-600">Fresh & seasonal selections</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-500 font-medium mb-1">
                Accessories
              </div>
              <div className="text-gray-600">Vases & decorative items</div>
            </div>
          </div>
        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-rose-200/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-40 right-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200/30 rounded-full blur-xl"
          />
        </div>
      </div>
    </div>
  );
}
