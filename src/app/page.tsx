import { Suspense } from "react";
import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";
import { cn } from "@/lib/utils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-2xl font-bold tracking-tight">
      <span className="bg-gradient-to-r from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-transparent">
        {children}
      </span>
    </h2>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 h-5 w-3/4 rounded bg-white/10" />
      <div className="h-4 w-1/2 rounded bg-white/10" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero — parallax scroll with HeroSectionHeader + question thumbnails */}
      <HeroSection />

      {/* Content section */}
      <section
        className={cn(
          "relative border-t border-white/10",
          "bg-gradient-to-b from-black via-zinc-950 to-black"
        )}
      >
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

            {/* Latest Questions — takes 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <SectionHeading>Latest Questions</SectionHeading>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                }
              >
                <LatestQuestions />
              </Suspense>
            </div>

            {/* Top Contributors — 1/3 width on large screens */}
            <div>
              <SectionHeading>Top Contributors</SectionHeading>
              <Suspense
                fallback={
                  <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/2 rounded bg-white/10" />
                            <div className="h-3 w-1/3 rounded bg-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <TopContributers />
              </Suspense>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
