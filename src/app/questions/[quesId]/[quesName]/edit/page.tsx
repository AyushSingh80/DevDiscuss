import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { Question } from "@/models/types"; // 1. Import your type
import React from "react";
import EditQues from "./EditQues";

const Page = async ({
  params,
}: {
  params: Promise<{ quesId: string; quesName: string }>; // 2. Fix for Next.js 15 (Must be Promise)
}) => {
  const { quesId } = await params; // 3. Await the params

  const question = await databases.getDocument(
    db,
    questionCollection,
    quesId
  );

  return (
    // 4. Cast the generic document to your specific 'Question' type
    <EditQues question={question as unknown as Question} />
  );
};

export default Page;