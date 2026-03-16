import { HeroParallax } from "@/components/ui/hero-parallax";
import { databases } from "@/models/server/config";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import slugify from "@/utils/slugify";
import env from "@/app/env";
import HeroSectionHeader from "./HeroSectionHeader";

export default async function HeroSection() {
  const questions = await databases.listDocuments(db, questionCollection, [
    Query.orderDesc("$createdAt"),
    Query.limit(15),
  ]);

  const products = questions.documents
    .filter((q) => q.attachmentId)
    .map((q) => ({
      title: q.title as string,
      link: `/questions/${q.$id}/${slugify(q.title as string)}`,
      // Construct the URL directly — avoids SDK version inconsistencies in server context
      thumbnail: `${env.appwrite.endpoint}/storage/buckets/${questionAttachmentBucket}/files/${q.attachmentId}/view?project=${env.appwrite.projectId}`,
    }));

  return (
    <HeroParallax
      header={<HeroSectionHeader />}
      products={products}
    />
  );
}
