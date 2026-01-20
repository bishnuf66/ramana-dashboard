"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white relative overflow-hidden transition-colors ">
      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-gray-300 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Copyright © {currentYear} Ramana Handmade Bouquets. All rights
          reserved.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
          Made with <Heart className="w-4 h-4 text-rose-500 fill-current" /> for
          bouquet lovers
        </p>
      </motion.div>
    </footer>
  );
}
