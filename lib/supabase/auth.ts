"use client";

import { supabase } from "./client";
import { toast } from "react-toastify";

// Google OAuth Sign In
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(error.message || "Google sign in failed");
    throw error;
  }
};

// Email/Password Sign In
export const signInAdmin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (adminError || !adminData) {
      await supabase.auth.signOut();
      throw new Error("Access denied. Admin privileges required.");
    }

    return { user: data.user, admin: adminData };
  } catch (error: any) {
    toast.error(error.message || "Login failed");
    throw error;
  }
};

// Sign Up with Email
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) throw error;

    toast.success(
      "Account created successfully! Please check your email to verify.",
    );
    return data;
  } catch (error: any) {
    toast.error(error.message || "Sign up failed");
    throw error;
  }
};

export const signOutAdmin = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success("Logged out successfully");
  } catch (error: any) {
    toast.error(error.message || "Logout failed");
    throw error;
  }
};

export const getCurrentAdmin = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    return adminData ? { user, admin: adminData } : null;
  } catch (error) {
    return null;
  }
};
