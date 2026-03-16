import { Permission } from "node-appwrite";
import { profilePicturesBucket, questionAttachmentBucket } from "../name";
import { storage } from "./config";

async function setupQuestionAttachmentBucket() {
  try {
    await storage.getBucket(questionAttachmentBucket);
    console.log("Question attachment storage connected");
  } catch {
    try {
      await storage.createBucket(
        questionAttachmentBucket,
        questionAttachmentBucket,
        [
          Permission.create("users"),
          Permission.read("any"),
          Permission.read("users"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "gif", "jpeg", "webp", "heic"]
      );
      console.log("Question attachment storage created");
    } catch (error) {
      console.error("Error creating question attachment storage:", error);
    }
  }
}

async function setupProfilePicturesBucket() {
  try {
    await storage.getBucket(profilePicturesBucket);
    console.log("Profile pictures storage connected");
  } catch {
    try {
      await storage.createBucket(
        profilePicturesBucket,
        profilePicturesBucket,
        [
          Permission.create("users"),
          Permission.read("any"),
          Permission.read("users"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "gif", "jpeg", "webp", "heic"]
      );
      console.log("Profile pictures storage created");
    } catch (error) {
      console.error("Error creating profile pictures storage:", error);
    }
  }
}

export default async function getOrCreateStorage() {
  await Promise.all([
    setupQuestionAttachmentBucket(),
    setupProfilePicturesBucket(),
  ]);
}
