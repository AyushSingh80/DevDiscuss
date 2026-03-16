import QuestionForm from "@/components/QuestionForm";
import { Particles } from "@/components/magicui/particles";
import {
  IconBulb,
  IconCode,
  IconListCheck,
  IconSearch,
} from "@tabler/icons-react";

const tips = [
  {
    icon: <IconSearch className="h-4 w-4 shrink-0 text-orange-400" />,
    heading: "Search first",
    body: "Check if your question has already been answered before posting.",
  },
  {
    icon: <IconListCheck className="h-4 w-4 shrink-0 text-orange-400" />,
    heading: "Be specific",
    body: "Include error messages, relevant versions, and what you already tried.",
  },
  {
    icon: <IconCode className="h-4 w-4 shrink-0 text-orange-400" />,
    heading: "Add a code sample",
    body: "A minimal reproducible example makes it much easier to get help.",
  },
  {
    icon: <IconBulb className="h-4 w-4 shrink-0 text-orange-400" />,
    heading: "Use clear tags",
    body: "Tags help the right people find your question quickly.",
  },
];

export default function Page() {
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
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Ask a{" "}
            <span className="bg-gradient-to-r from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-transparent">
              Question
            </span>
          </h1>
          <p className="mt-1 text-gray-400">
            Share your problem with the community and get help from developers
            worldwide.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Form ── */}
          <div className="lg:col-span-2">
            <QuestionForm />
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4 lg:col-span-1">
            {/* Tips card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="mb-4 font-semibold text-white">
                Tips for a good question
              </h3>
              <ul className="space-y-4">
                {tips.map((tip) => (
                  <li key={tip.heading} className="flex gap-3">
                    <span className="mt-0.5">{tip.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tip.heading}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{tip.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formatting guide */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="mb-3 font-semibold text-white">
                Markdown formatting
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-400">
                {[
                  ["**bold**", "bold text"],
                  ["`code`", "inline code"],
                  ["```js … ```", "code block"],
                  ["# Heading", "section header"],
                  ["- item", "bullet list"],
                  ["> text", "blockquote"],
                ].map(([syntax, desc]) => (
                  <li key={syntax} className="flex items-center gap-2">
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-orange-300">
                      {syntax}
                    </code>
                    <span>→ {desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
