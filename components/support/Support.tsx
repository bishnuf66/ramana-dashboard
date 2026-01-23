"use client";

import {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Github,
  Linkedin,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Support() {
  const developerInfo = {
    name: "Bishnu bk",
    role: "Full Stack Developer & Dashboard Creator",
    email: "bishowkarmabishnu2024@gmail.com",
    phone: "+977 9803364009",
    website: "https:/bishnubk.com.np",
    location: "Nepal",
    experience:
      "Full Stack Developer specializing in React, Next.js, and modern web technologies",
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: developerInfo.email,
      href: `mailto:${developerInfo.email}`,
      color: "bg-blue-500 hover:bg-blue-600",
      description: "For general inquiries and support",
    },
    {
      icon: Phone,
      label: "Phone",
      value: developerInfo.phone,
      href: `tel:${developerInfo.phone.replace(/\s/g, "")}`,
      color: "bg-green-500 hover:bg-green-600",
      description: "For urgent issues and calls",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: developerInfo.phone,
      href: `https://wa.me/9779819274719`,
      color: "bg-green-400 hover:bg-green-500",
      description: "For quick messaging",
    },
    {
      icon: MessageCircle,
      label: "Viber",
      value: developerInfo.phone,
      href: `viber://chat?number=9819274719`,
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Alternative messaging app",
    },
    {
      icon: Globe,
      label: "Website",
      value: "ramana.com.np",
      href: developerInfo.website,
      color: "bg-indigo-500 hover:bg-indigo-600",
      description: "Visit my portfolio",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Support & Developer Contact
        </h2>
      </div>

      {/* Developer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{developerInfo.name}</h3>
            <p className="text-green-100 mb-2">{developerInfo.role}</p>
            <p className="text-sm text-green-50 mb-3">
              {developerInfo.experience}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4" />
              <span>{developerInfo.location}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.a
              key={method.label}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={
                method.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`${method.color} rounded-lg p-4 text-white shadow-lg transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{method.label}</h4>
                  <p className="text-sm opacity-90 mb-1">{method.value}</p>
                  <p className="text-xs opacity-75">{method.description}</p>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Support Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How I Can Help You
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                1
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Dashboard Issues
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you encounter any bugs, errors, or issues with the dashboard
                functionality, feel free to reach out for quick assistance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                2
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Feature Requests
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Have ideas for new features or improvements? I'd love to hear
                your suggestions to make the dashboard even better.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                3
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Technical Support
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help with setup, configuration, or understanding how to use
                specific features? I'm here to provide guidance and support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Response Time
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              I typically respond within 24 hours. For urgent issues, please
              call or message directly via WhatsApp/Viber for faster assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This dashboard was developed with ❤️ by Ramana Theeng
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Thank you for using my dashboard! Your feedback helps me improve it.
        </p>
      </div>
    </div>
  );
}
