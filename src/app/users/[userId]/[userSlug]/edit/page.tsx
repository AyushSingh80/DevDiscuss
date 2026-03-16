"use client";

import { account } from "@/models/client/config";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const { user } = useAuthStore();
  const { userId, userSlug } = useParams<{
    userId: string;
    userSlug: string;
  }>();
  const router = useRouter();

  // Form state
  const [name, setName] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [oldPassword, setOldPassword] = React.useState("");

  // UI state
  const [savingName, setSavingName] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [nameError, setNameError] = React.useState("");
  const [nameSuccess, setNameSuccess] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState("");

  // Pre-fill name once user is available
  React.useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  // Redirect if viewing someone else's profile
  React.useEffect(() => {
    if (user && user.$id !== userId) {
      router.replace(`/users/${userId}/${userSlug}`);
    }
  }, [user, userId, userSlug, router]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;

    setSavingName(true);
    setNameError("");
    setNameSuccess("");

    try {
      await account.updateName(trimmed);
      // Patch the persisted store so the UI reflects the new name immediately
      const current = useAuthStore.getState().user;
      if (current) {
        useAuthStore.setState({ user: { ...current, name: trimmed } });
      }
      setNameSuccess("Name updated successfully!");
    } catch (err) {
      const e = err as Error;
      setNameError(e.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !oldPassword) return;
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      await account.updatePassword(newPassword, oldPassword);
      setPasswordSuccess("Password changed successfully!");
      setNewPassword("");
      setOldPassword("");
    } catch (err) {
      const e = err as Error;
      setPasswordError(e.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Don't render until we confirm ownership
  if (!user || user.$id !== userId) return null;

  return (
    <div className="space-y-6">
      {/* Section: Display Name */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <IconUser className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold">Display Name</h2>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white",
                "placeholder-gray-600 backdrop-blur-sm transition-colors duration-200",
                "focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
              )}
              placeholder="Your display name"
              required
            />
          </div>

          {nameError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {nameError}
            </p>
          )}
          {nameSuccess && (
            <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {nameSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={savingName || !name.trim() || name.trim() === user.name}
            className={cn(
              "flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white",
              "hover:bg-orange-600 transition-colors duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {savingName ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconDeviceFloppy className="h-4 w-4" />
            )}
            {savingName ? "Saving…" : "Save Name"}
          </button>
        </form>
      </section>

      {/* Section: Change Password */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <IconLock className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white",
                "placeholder-gray-600 transition-colors duration-200",
                "focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
              )}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white",
                "placeholder-gray-600 transition-colors duration-200",
                "focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
              )}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          {passwordError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {passwordSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword || !newPassword || !oldPassword}
            className={cn(
              "flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white",
              "hover:bg-purple-700 transition-colors duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {savingPassword ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconLock className="h-4 w-4" />
            )}
            {savingPassword ? "Saving…" : "Change Password"}
          </button>
        </form>
      </section>

      {/* Back link */}
      <Link
        href={`/users/${userId}/${userSlug}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>
    </div>
  );
};

export default Page;
