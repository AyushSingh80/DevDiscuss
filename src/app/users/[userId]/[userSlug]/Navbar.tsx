"use client";

import { cn } from "@/lib/utils";
import {
  IconLayoutDashboard,
  IconMessage,
  IconQuestionMark,
  IconThumbUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
const items = [
  {
    name: "Summary",
    icon: <IconLayoutDashboard className="h-4 w-4 shrink-0" />,
    suffix: "",
  },
  {
    name: "Questions",
    icon: <IconQuestionMark className="h-4 w-4 shrink-0" />,
    suffix: "/questions",
  },
  {
    name: "Answers",
    icon: <IconMessage className="h-4 w-4 shrink-0" />,
    suffix: "/answers",
  },
  {
    name: "Votes",
    icon: <IconThumbUp className="h-4 w-4 shrink-0" />,
    suffix: "/votes",
  },
];

const Navbar = () => {
  const { userId, userSlug } = useParams<{
    userId: string;
    userSlug: string;
  }>();
  const pathname = usePathname();
  const base = `/users/${userId}/${userSlug}`;

  return (
    <nav className="shrink-0">
      <ul className="flex w-full gap-1 overflow-auto sm:w-44 sm:flex-col">
        {items.map((item) => {
          const href = `${base}${item.suffix}`;
          const active = pathname === href;

          return (
            <li key={item.name}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    active ? "text-orange-400" : "text-gray-500"
                  )}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
