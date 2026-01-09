"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Mail, X } from "lucide-react";

export default function FloatingContact() {
    const [isOpen, setIsOpen] = useState(false);

    const contactOptions = [
        {
            icon: Phone,
            label: "Call",
            href: "tel:+9779819274719",
            color: "bg-green-500 hover:bg-green-600",
        },
        {
            icon: MessageCircle,
            label: "WhatsApp",
            href: "https://wa.me/9779819274719",
            color: "bg-green-400 hover:bg-green-500",
        },
        {
            icon: MessageCircle,
            label: "Viber",
            href: "viber://chat?number=9819274719",
            color: "bg-purple-500 hover:bg-purple-600",
        },
        {
            icon: Mail,
            label: "Email",
            href: "mailto:ramanatheeng65@gmail.com",
            color: "bg-blue-500 hover:bg-blue-600",
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 space-y-3"
                    >
                        {contactOptions.map((option, index) => (
                            <motion.a
                                key={option.label}
                                href={option.href}
                                target={option.href.startsWith("http") ? "_blank" : undefined}
                                rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg transition-all ${option.color}`}
                            >
                                <option.icon className="w-5 h-5" />
                                <span className="font-medium">{option.label}</span>
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${isOpen
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="message"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}