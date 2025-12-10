'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Story', href: '#story' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    shop: [
      { name: 'All Products', href: '#products' },
      { name: 'Flowers', href: '#flowers' },
      { name: 'Accessories', href: '#accessories' },
      { name: 'Gift Sets', href: '#gifts' },
    ],
    support: [
      { name: 'FAQ', href: '#faq' },
      { name: 'Shipping', href: '#shipping' },
      { name: 'Returns', href: '#returns' },
      { name: 'Privacy Policy', href: '#privacy' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-rose-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img
                src="/images/fruit-store-logo.jpg"
                alt="Logo"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-green-500"
              />
              <div>
                <div className="text-2xl font-bold">Bloom & Blossom</div>
                <div className="text-sm text-gray-400">Premium Floral Arrangements</div>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Creating beautiful moments with handcrafted floral arrangements. 
              Every bloom tells a story, every arrangement speaks from the heart.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((SocialIcon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/10 hover:bg-green-500 rounded-full transition-colors backdrop-blur-sm"
                >
                  <SocialIcon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">+9812354678</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">contact@bloomblossom.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">Kathmandu, Nepal</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            Copyright © {currentYear} Bloom & Blossom. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-current" /> for flower lovers
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

