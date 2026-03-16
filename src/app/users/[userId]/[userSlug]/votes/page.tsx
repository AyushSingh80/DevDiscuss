import Pagination from "@/components/Pagination";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases } from "@/models/server/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconFilter,
} from "@tabler/icons-react";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; userSlug: string }>;
  searchParams: Promise<{ page?: string; voteStatus?: "upvoted" | "downvoted" }>;
}) => {
  const { userId, userSlug } = await params;
  const { page, voteStatus } = await searchParams;
  const currentPage = page || "1";

  const query = [
    Query.equal("votedById", userId),
    Query.orderDesc("$createdAt"),
    Query.offset((+currentPage - 1) * 25),
    Query.limit(25),
  ];

  if (voteStatus) query.push(Query.equal("voteStatus", voteStatus));

  const votes = await databases.listDocuments(db, voteCollection, query);

  votes.documents = await Promise.all(
    votes.documents.map(async (vote) => {
      if (vote.type === "question") {
        const question = await databases.getDocument(
          db,
          questionCollection,
          vote.typeId,
          [Query.select(["title"])]
        );
        return { ...vote, question };
      }

      const answer = await databases.getDocument(
        db,
        answerCollection,
        vote.typeId
      );
      const question = await databases.getDocument(
        db,
        questionCollection,
        answer.questionId,
        [Query.select(["title"])]
      );
      return { ...vote, question };
    })
  );

  const filterBase = `/users/${userId}/${userSlug}/votes`;

  const filters = [
    { label: "All", value: undefined, href: filterBase },
    {
      label: "Upvotes",
      value: "upvoted" as const,
      href: `${filterBase}?voteStatus=upvoted`,
    },
    {
      label: "Downvotes",
      value: "downvoted" as const,
      href: `${filterBase}?voteStatus=downvoted`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header: count + filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          {votes.total} {votes.total === 1 ? "vote" : "votes"}
        </p>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <IconFilter className="ml-1 h-3.5 w-3.5 shrink-0 text-gray-500" />
          {filters.map((f) => {
            const active = voteStatus === f.value;
            return (
              <Link
                key={f.label}
                href={f.href}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Vote list */}
      {votes.documents.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-gray-500">
          No votes yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {votes.documents.map((vote) => {
            const isUp = vote.voteStatus === "upvoted";
            return (
              <li
                key={vote.$id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.07]"
              >
                {/* Vote badge */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isUp
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isUp ? (
                    <IconCaretUpFilled className="h-4 w-4" />
                  ) : (
                    <IconCaretDownFilled className="h-4 w-4" />
                  )}
                </span>

                {/* Target info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/questions/${vote.question.$id}/${slugify(
                      vote.question.title
                    )}`}
                    className="line-clamp-1 text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                  >
                    {vote.question.title}
                  </Link>
                  <p className="mt-0.5 text-xs capitalize text-gray-500">
                    {vote.type} · {isUp ? "upvoted" : "downvoted"}
                  </p>
                </div>

                {/* Date */}
                <span className="shrink-0 text-xs text-gray-500">
                  {convertDateToRelativeTime(new Date(vote.$createdAt))}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination total={votes.total} limit={25} />
    </div>
  );
};

export default Page;
