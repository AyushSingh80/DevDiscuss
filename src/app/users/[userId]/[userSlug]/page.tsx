import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import React from "react";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import Link from "next/link";
import slugify from "@/utils/slugify";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { MarkdownPreview } from "@/components/RTE";
import {
  IconMessageCircle,
  IconQuestionMark,
  IconStarFilled,
  IconThumbUp,
} from "@tabler/icons-react";

const Page = async ({
  params,
}: {
  params: Promise<{ userId: string; userSlug: string }>;
}) => {
  const { userId } = await params;

  const [user, questions, answers, recentQuestions, recentAnswers, votesGiven] =
    await Promise.all([
      users.get<UserPrefs>(userId),
      databases.listDocuments(db, questionCollection, [
        Query.equal("authorId", userId),
        Query.limit(1),
      ]),
      databases.listDocuments(db, answerCollection, [
        Query.equal("authorId", userId),
        Query.limit(1),
      ]),
      databases.listDocuments(db, questionCollection, [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(5),
      ]),
      databases.listDocuments(db, answerCollection, [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(5),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("votedById", userId),
        Query.limit(1),
      ]),
    ]);

  // Enrich recent answers with their question titles
  const enrichedAnswers = await Promise.all(
    recentAnswers.documents.map(async (ans) => {
      const question = await databases.getDocument(
        db,
        questionCollection,
        ans.questionId,
        [Query.select(["title"])]
      );
      return { ...ans, question };
    })
  );

  const stats = [
    {
      label: "Reputation",
      value: user.prefs.reputation,
      icon: <IconStarFilled className="h-5 w-5 text-orange-400" />,
      gradient: "from-orange-500/20 via-transparent to-transparent",
    },
    {
      label: "Questions Asked",
      value: questions.total,
      icon: <IconQuestionMark className="h-5 w-5 text-purple-400" />,
      gradient: "from-purple-500/20 via-transparent to-transparent",
    },
    {
      label: "Answers Given",
      value: answers.total,
      icon: <IconMessageCircle className="h-5 w-5 text-pink-400" />,
      gradient: "from-pink-500/20 via-transparent to-transparent",
    },
    {
      label: "Votes Cast",
      value: votesGiven.total,
      icon: <IconThumbUp className="h-5 w-5 text-yellow-400" />,
      gradient: "from-yellow-500/20 via-transparent to-transparent",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <MagicContainer
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <MagicCard
            key={stat.label}
            className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden p-6 shadow-xl"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient}`}
            />
            <div className="relative z-10 mb-2">{stat.icon}</div>
            <p className="relative z-10 whitespace-nowrap text-3xl font-bold text-white">
              <NumberTicker value={stat.value} />
            </p>
            <p className="relative z-10 mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              {stat.label}
            </p>
          </MagicCard>
        ))}
      </MagicContainer>

      {/* Recent activity — two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent questions */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Questions</h3>
            {questions.total > 5 && (
              <Link
                href={`/users/${userId}/${slugify(user.name)}/questions`}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                View all →
              </Link>
            )}
          </div>

          {recentQuestions.documents.length === 0 ? (
            <p className="text-sm text-gray-500">No questions yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentQuestions.documents.map((q) => (
                <li
                  key={q.$id}
                  className="group flex flex-col gap-0.5 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/questions/${q.$id}/${slugify(q.title)}`}
                    className="line-clamp-2 text-sm text-orange-400 duration-200 group-hover:text-orange-300"
                  >
                    {q.title}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {convertDateToRelativeTime(new Date(q.$createdAt))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent answers */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Answers</h3>
            {answers.total > 5 && (
              <Link
                href={`/users/${userId}/${slugify(user.name)}/answers`}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                View all →
              </Link>
            )}
          </div>

          {enrichedAnswers.length === 0 ? (
            <p className="text-sm text-gray-500">No answers yet.</p>
          ) : (
            <ul className="space-y-3">
              {enrichedAnswers.map((ans) => (
                <li
                  key={ans.$id}
                  className="group flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/questions/${ans.questionId}/${slugify(
                      ans.question.title
                    )}`}
                    className="text-xs font-medium text-orange-400 duration-200 group-hover:text-orange-300"
                  >
                    Re: {ans.question.title}
                  </Link>
                  <div className="max-h-10 overflow-hidden">
                    <MarkdownPreview
                      source={ans.content}
                      className="text-xs text-gray-400 [&_*]:text-xs [&_p]:m-0"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {convertDateToRelativeTime(new Date(ans.$createdAt))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
