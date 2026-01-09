"use client";

import { Phone, Mail, MessageCircle, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface ContactInfoProps {
    showSocial?: boolean;
    variant?: "light" | "dark";
    size?: "sm" | "md" | "lg";
}

export default function ContactInfo({
    showSocial = true,
    variant = "light",
    size = "md"
}: ContactInfoProps) {
    const textColor = variant === "dark" ? "text-white" : "text-gray-700";
    const linkColor = variant === "dark" ? "text-green-300" : "text-green-600";

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    return (
        <div className={`space-y-4 ${sizeClasses[size]}`}>
            {/* Phone */}
            <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
            >
                <Phone className={`w-5 h-5 ${linkColor}`} />
                <a
                    href="tel:+9779819274719"
                    className={`${linkColor} hover:underline transition-colors`}
                >
                    +977 98192747199
                </a>
            </motion.div>

            {/* Email */}
            <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
            >
                <Mail className={`w-5 h-5 ${linkColor}`} />
                <a
                    href="mailto:ramanatheeng65@gmail.com"
                    className={`${linkColor} hover:underline transition-colors`}
                >
                    ramanatheeng65@gmail.com
                </a>
            </motion.div>

            {/* Website */}
            <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
            >
                <Globe className={`w-5 h-5 ${linkColor}`} />
                <a
                    href="https://ramana.com.np"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkColor} hover:underline transition-colors`}
                >
                    ramana.com.np
                </a>
            </motion.div>

            {/* Messaging Apps */}
            <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
            >
                <MessageCircle className={`w-5 h-5 ${linkColor}`} />
                <div className="flex gap-4">
                    <a
                        href="viber://chat?number=9819274719"
                        className={`${linkColor} hover:underline transition-colors`}
                    >
                        Viber
                    </a>
                    <a
                        href="https://wa.me/9779819274719"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkColor} hover:underline transition-colors`}
                    >
                        WhatsApp
                    </a>
                </div>
            </motion.div>

            {/* Social Media */}
            {showSocial && (
                <div className="pt-4 border-t border-gray-200">
                    <p className={`${textColor} mb-3 font-medium`}>Follow Us:</p>
                    <div className="flex gap-4">
                        <a
                            href="https://www.facebook.com/ramana.bouquets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkColor} hover:underline transition-colors`}
                        >
                            Facebook
                        </a>
                        <a
                            href="https://www.instagram.com/ramana.bouquets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkColor} hover:underline transition-colors`}
                        >
                            Instagram
                        </a>
                        <a
                            href="https://www.tiktok.com/@ramana.bouquets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkColor} hover:underline transition-colors`}
                        >
                            TikTok
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}