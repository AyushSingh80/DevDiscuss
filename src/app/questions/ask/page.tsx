import React from "react";
import Header from "@/app/components/Header"; // Assuming you have a Header component
import QuestionForm from "@/components/QuestionForm";
import { BackgroundBeams } from "@/components/ui/background-beams";
// Example of a UI component

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <BackgroundBeams /> {/* Add a background effect */}
      <Header />
      <div className="bg-black shadow-md rounded-lg p-6">
        <QuestionForm />
      </div>
    </div>
  );
}
