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
        className="py-4 border-t border-gray-200 dark:border-gray-700"
      >
        {/* Page Footer */}
        <div className="">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 Ramana Dashboard. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
