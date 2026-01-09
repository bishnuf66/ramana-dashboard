"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import ContactInfo from "../global/ContactInfo";

export default function ContactSection() {
    return (
        <section id="contact" className="py-20 bg-gradient-to-br from-green-50 via-white to-rose-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Get In <span className="text-gradient">Touch</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Ready to create something beautiful? Contact Ramana for your custom bouquet needs
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                            <ContactInfo size="lg" />
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-green-600" />
                                <h4 className="text-xl font-bold text-gray-900">Business Hours</h4>
                            </div>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Monday - Friday</span>
                                    <span>9:00 AM - 7:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday</span>
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday</span>
                                    <span>10:00 AM - 5:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-6 h-6 text-green-600" />
                                <h4 className="text-xl font-bold text-gray-900">Service Area</h4>
                            </div>
                            <p className="text-gray-600">
                                We proudly serve the entire Kathmandu Valley, including Kathmandu,
                                Lalitpur, and Bhaktapur. Free delivery available for orders above NPR 2000.
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Contact Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Contact</h3>

                        {/* Phone Card */}
                        <motion.a
                            href="tel:+9779819274719"
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="block p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <Phone className="w-8 h-8" />
                                <div>
                                    <h4 className="text-xl font-bold">Call Now</h4>
                                    <p className="opacity-90">+977 98192747199</p>
                                </div>
                            </div>
                        </motion.a>

                        {/* WhatsApp Card */}
                        <motion.a
                            href="https://wa.me/9779819274719"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="block p-6 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <MessageCircle className="w-8 h-8" />
                                <div>
                                    <h4 className="text-xl font-bold">WhatsApp</h4>
                                    <p className="opacity-90">Chat with us instantly</p>
                                </div>
                            </div>
                        </motion.a>

                        {/* Viber Card */}
                        <motion.a
                            href="viber://chat?number=9819274719"
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <MessageCircle className="w-8 h-8" />
                                <div>
                                    <h4 className="text-xl font-bold">Viber</h4>
                                    <p className="opacity-90">Message us on Viber</p>
                                </div>
                            </div>
                        </motion.a>

                        {/* Email Card */}
                        <motion.a
                            href="mailto:ramanatheeng65@gmail.com"
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <Mail className="w-8 h-8" />
                                <div>
                                    <h4 className="text-xl font-bold">Email Us</h4>
                                    <p className="opacity-90">ramanatheeng65@gmail.com</p>
                                </div>
                            </div>
                        </motion.a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}