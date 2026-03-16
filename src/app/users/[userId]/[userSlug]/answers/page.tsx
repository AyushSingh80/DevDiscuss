import Pagination from "@/components/Pagination";
import { MarkdownPreview } from "@/components/RTE";
import { answerCollection, db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; userSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) => {
  const { userId } = await params;
  const { page } = await searchParams;
  const currentPage = page || "1";

  const queries = [
    Query.equal("authorId", userId),
    Query.orderDesc("$createdAt"),
    Query.offset((+currentPage - 1) * 25),
    Query.limit(25),
  ];

  const answers = await databases.listDocuments(db, answerCollection, queries);

  answers.documents = await Promise.all(
    answers.documents.map(async (ans) => {
      const question = await databases.getDocument(
        db,
        questionCollection,
        ans.questionId,
        [Query.select(["title"])]
      );
      return { ...ans, question };
    })
  );

  return (
    <div className="space-y-4">
      {/* Count */}
      <p className="text-sm text-gray-400">
        {answers.total} {answers.total === 1 ? "answer" : "answers"}
      </p>

      {answers.documents.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-gray-500">
          No answers yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {answers.documents.map((ans) => (
            <li
              key={ans.$id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:bg-white/[0.07]"
            >
              {/* Answer content preview */}
              <div className="max-h-36 overflow-hidden px-5 pt-5">
                <MarkdownPreview
                  source={ans.content}
                  className="rounded-lg text-sm"
                />
              </div>

              {/* Footer: question link + date */}
              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3">
                <Link
                  href={`/questions/${ans.questionId}/${slugify(
                    ans.question.title
                  )}`}
                  className="flex items-center gap-1.5 truncate text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                >
                  <IconExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ans.question.title}</span>
                </Link>
                <span className="shrink-0 text-xs text-gray-500">
                  {convertDateToRelativeTime(new Date(ans.$createdAt))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination total={answers.total} limit={25} />
    </div>
  );
};

export default Page;
