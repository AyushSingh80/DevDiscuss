"use client";

import { account, storage } from "@/models/client/config";
import { profilePicturesBucket } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import env from "@/app/env";
import {
  IconArrowLeft,
  IconCamera,
  IconDeviceFloppy,
  IconLoader2,
  IconLock,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { ID } from "appwrite";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

/* ─── helpers ─────────────────────────────────────────────────────────── */

function avatarUrl(profilePictureId: string | undefined, name: string) {
  if (profilePictureId) {
    return `${env.appwrite.endpoint}/storage/buckets/${profilePicturesBucket}/files/${profilePictureId}/view?project=${env.appwrite.projectId}`;
  }
  return `${env.appwrite.endpoint}/avatars/initials?name=${encodeURIComponent(name)}&width=200&height=200&project=${env.appwrite.projectId}`;
}

/* ─── component ────────────────────────────────────────────────────────── */

const Page = () => {
  const { user } = useAuthStore();
  const { userId, userSlug } = useParams<{
    userId: string;
    userSlug: string;
  }>();
  const router = useRouter();

  /* ── name state ── */
  const [name, setName] = React.useState("");
  const [savingName, setSavingName] = React.useState(false);
  const [nameError, setNameError] = React.useState("");
  const [nameSuccess, setNameSuccess] = React.useState("");

  /* ── password state ── */
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState("");

  /* ── avatar state ── */
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const [savingAvatar, setSavingAvatar] = React.useState(false);
  const [removingAvatar, setRemovingAvatar] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState("");
  const [avatarSuccess, setAvatarSuccess] = React.useState("");

  /* ── init ── */
  React.useEffect(() => {
    if (user?.name) setName(user.name);
    if (user) setAvatarPreview(avatarUrl(user.prefs?.profilePictureId, user.name));
  }, [user]);

  React.useEffect(() => {
    if (user && user.$id !== userId) {
      router.replace(`/users/${userId}/${userSlug}`);
    }
  }, [user, userId, userSlug, router]);

  if (!user || user.$id !== userId) return null;

  /* ─── handlers ─────────────────────────────────────────────────────── */

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
    setAvatarSuccess("");
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const currentPrefs = useAuthStore.getState().user?.prefs;

      // Delete old picture if one exists
      if (currentPrefs?.profilePictureId) {
        try {
          await storage.deleteFile(profilePicturesBucket, currentPrefs.profilePictureId);
        } catch {
          // File may have already been deleted — ignore
        }
      }

      // Upload new picture
      const uploaded = await storage.createFile(
        profilePicturesBucket,
        ID.unique(),
        avatarFile
      );

      // Persist the file ID in user prefs (spread to preserve reputation etc.)
      const updatedPrefs = { reputation: currentPrefs?.reputation ?? 0, profilePictureId: uploaded.$id };
      await account.updatePrefs(updatedPrefs);

      // Patch store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, prefs: updatedPrefs } });
      }

      setAvatarPreview(
        avatarUrl(uploaded.$id, useAuthStore.getState().user?.name ?? "")
      );
      setAvatarFile(null);
      setAvatarSuccess("Profile picture updated!");
    } catch (err) {
      setAvatarError((err as Error).message || "Failed to upload picture.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const currentPrefs = useAuthStore.getState().user?.prefs;
    if (!currentPrefs?.profilePictureId) return;

    setRemovingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      await storage.deleteFile(profilePicturesBucket, currentPrefs.profilePictureId);

      const restPrefs = { reputation: currentPrefs.reputation ?? 0 };
      await account.updatePrefs(restPrefs);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, prefs: restPrefs } });
      }

      setAvatarPreview(avatarUrl(undefined, user.name));
      setAvatarFile(null);
      setAvatarSuccess("Profile picture removed.");
    } catch (err) {
      setAvatarError((err as Error).message || "Failed to remove picture.");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) return;

    setSavingName(true);
    setNameError("");
    setNameSuccess("");

    try {
      await account.updateName(trimmed);
      const current = useAuthStore.getState().user;
      if (current) useAuthStore.setState({ user: { ...current, name: trimmed } });
      setNameSuccess("Name updated successfully!");
    } catch (err) {
      setNameError((err as Error).message || "Failed to update name.");
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
      setPasswordError((err as Error).message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  /* ─── render ────────────────────────────────────────────────────────── */

  const hasCustomPicture = !!user.prefs?.profilePictureId;

  return (
    <div className="space-y-6">
      {/* ── Section: Profile Picture ── */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
            <IconCamera className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold">Profile Picture</h2>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar preview with click-to-upload overlay */}
          <div className="group relative shrink-0 self-start">
            {/* Gradient ring */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#ffd319] via-[#ff2975] to-[#8c1eff] opacity-60 blur-sm transition-opacity group-hover:opacity-90" />

            <div className="relative h-28 w-28 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview}
                alt="Profile picture preview"
                className="h-full w-full object-cover"
              />

              {/* Hover overlay — click to choose file */}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <IconCamera className="h-5 w-5 text-white" />
                <span className="text-xs font-medium text-white">Change</span>
              </label>
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Instructions + actions */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-300">
                {avatarFile ? (
                  <span className="text-orange-400">
                    Ready to upload: <strong>{avatarFile.name}</strong>
                  </span>
                ) : (
                  "Click the image to select a new photo."
                )}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP or GIF · max 10 MB
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!avatarFile || savingAvatar}
                onClick={handleSaveAvatar}
                className={cn(
                  "flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white",
                  "hover:bg-orange-600 transition-colors duration-200",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {savingAvatar ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="h-4 w-4" />
                )}
                {savingAvatar ? "Uploading…" : "Save Photo"}
              </button>

              {hasCustomPicture && (
                <button
                  type="button"
                  disabled={removingAvatar}
                  onClick={handleRemoveAvatar}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400",
                    "hover:bg-red-500/20 transition-colors duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                >
                  {removingAvatar ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                  {removingAvatar ? "Removing…" : "Remove Photo"}
                </button>
              )}
            </div>

            {avatarError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {avatarError}
              </p>
            )}
            {avatarSuccess && (
              <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
                {avatarSuccess}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Section: Display Name ── */}
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

      {/* ── Section: Change Password ── */}
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
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors duration-200 hover:text-gray-300"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>
    </div>
  );
};

export default Page;
