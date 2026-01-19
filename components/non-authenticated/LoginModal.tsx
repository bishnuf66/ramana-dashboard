"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import {
  signInWithGoogle,
  signInAdmin,
  signUpWithEmail,
} from "@/lib/supabase/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.name);
      } else {
        await signInAdmin(formData.email, formData.password);
      }
      onClose();
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-4 md:p-8 rounded-lg shadow-lg w-full mx-10 max-w-lg overflow-y-auto flex items-center justify-center flex-col">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-black">
          {isSignUp ? "Sign Up" : "Log In"}
        </h2>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25-.37a8.01 8.01 0 00-7.48 5.19c-.05-.33-.16-.7-.3-1.04A8.017 8.017 0 0012 4c-4.42 0-8 3.58-8 8 0 .7.08 1.35.22 1.98.4-.2.63-.32-1.28-.32-2.03 0-.78.07-1.53.2-2.25.37a8.01 8.01 0 00-7.48 5.19c-.05.33-.16.7-.3 1.04-.2.63.32 1.28.32 2.03 0 .78-.07 1.53-.2 2.25-.37.63.32 1.28.32 2.03 0 .78-.07 1.53-.2 2.25-.37z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
          {isSignUp && (
            <div className="mb-1 relative">
              <label className="block text-sm font-medium mb-1 text-black">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-1 rounded-lg pl-10"
                required
              />
            </div>
          )}

          <div className="mb-1 relative">
            <label className="block text-sm font-medium mb-1 text-black">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-1 rounded-lg pl-10"
              required
            />
          </div>

          <div className="mb-1 relative">
            <label className="block text-sm font-medium mb-1 text-black">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-1 rounded-lg pl-10"
              required
            />
          </div>

          <div className="mb-1 text-black flex justify-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="ml-2">Remember Me</span>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="primary-green text-white py-1 px-4 rounded w-full"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </div>
        </form>

        {/* Toggle Sign In/Up */}
        <div className="text-center text-black">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="primary-text-green ml-2"
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
