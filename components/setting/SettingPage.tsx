"use client";

import React, { useState } from "react";
import {
  updateUserEmail,
  updateUserPassword,
  updateUserName,
} from "@/lib/supabase/auth";

interface SettingPageProps {
  adminProfile: {
    user: { id: string; email: string | null; created_at?: string };
    admin: {
      id: string;
      email: string;
      role: string;
      created_at: string | null;
    };
  } | null;
}

function SettingPage({ adminProfile }: SettingPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [nameForm, setNameForm] = useState({ name: "" });

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserEmail(emailForm.email);
      setEmailForm({ email: "", password: "" });
    } catch (error) {
      // Error is handled in the auth function
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserPassword(passwordForm.newPassword);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error is handled in the auth function
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameForm.name) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUserName(nameForm.name);
      setNameForm({ name: "" });
    } catch (error) {
      // Error is handled in the auth function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Admin Details
        </h3>
        {adminProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Email
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {adminProfile.user?.email || adminProfile.admin.email}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Role
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {adminProfile.admin.role}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Admin ID
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white break-all">
                {adminProfile.admin.id}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {adminProfile.admin.created_at
                  ? new Date(
                      adminProfile.admin.created_at as string,
                    ).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Not logged in as admin.
          </div>
        )}
      </div>

      {/* Update Email Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Update Email
        </h3>
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Email
            </label>
            <input
              type="email"
              value={emailForm.email}
              onChange={(e) =>
                setEmailForm({ ...emailForm, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter new email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) =>
                setEmailForm({ ...emailForm, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter current password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* Update Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Update Password
        </h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Confirm new password"
              required
            />
            {passwordForm.newPassword !== passwordForm.confirmPassword &&
              passwordForm.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
          </div>
          <button
            type="submit"
            disabled={
              isLoading ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Update Name Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Update Name
        </h3>
        <form onSubmit={handleNameUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={nameForm.name}
              onChange={(e) =>
                setNameForm({ ...nameForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Name"}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            System Info
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Environment
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              Production
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Version
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingPage;
