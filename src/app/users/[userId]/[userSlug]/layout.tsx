import env from "@/app/env";
import { Particles } from "@/components/magicui/particles";
import { avatars } from "@/models/client/config";
import { profilePicturesBucket } from "@/models/name";
import { users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import React from "react";
import EditButton from "./EditButton";
import Navbar from "./Navbar";
import {
  IconCalendarFilled,
  IconClockFilled,
  IconStarFilled,
} from "@tabler/icons-react";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string; userSlug: string }>;
}) => {
  const { userId } = await params;
  const user = await users.get<UserPrefs>(userId);
  const avatarUrl = user.prefs?.profilePictureId
    ? `${env.appwrite.endpoint}/storage/buckets/${profilePicturesBucket}/files/${user.prefs.profilePictureId}/view?project=${env.appwrite.projectId}`
    : avatars.getInitials(user.name, 200, 200).toString();

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Particles
        className="fixed inset-0 h-full w-full"
        quantity={300}
        ease={100}
        color="#ffffff"
        refresh
      />

      <div className="container relative mx-auto px-4 pb-20 pt-32">
        {/* Profile header card */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {/* Subtle gradient glow in corner */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#ffd319]/20 via-[#ff2975]/20 to-[#8c1eff]/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0 self-start">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-[#ffd319] via-[#ff2975] to-[#8c1eff] opacity-70 blur-sm" />
              <picture className="relative block h-24 w-24 sm:h-28 sm:w-28">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="relative h-full w-full rounded-xl object-cover"
                />
              </picture>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="mt-0.5 text-gray-400">{user.email}</p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <IconCalendarFilled className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  Joined {convertDateToRelativeTime(new Date(user.$createdAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconClockFilled className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  Last active {convertDateToRelativeTime(new Date(user.$updatedAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconStarFilled className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  {user.prefs?.reputation ?? 0} reputation
                </span>
              </div>
            </div>

            {/* Edit button — only shown to profile owner */}
            <div className="shrink-0 self-start">
              <EditButton />
            </div>
          </div>
        </div>

        {/* Sidebar nav + page content */}
        <div className="flex flex-col gap-6 sm:flex-row">
          <Navbar />
          <div className="w-full min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
