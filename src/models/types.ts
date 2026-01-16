import { Models } from "appwrite";

export interface Author extends Models.Document {
  name: string;
  reputation: number;
}


export interface Vote extends Models.Document {
  type: "question" | "answer";
  votedById: string;
  voteStatus: "upvoted" | "downvoted";
}

export interface Comment extends Models.Document {
  content: string;
  type: "question" | "answer";
  authorId: string;
  author: Author;
}

export interface Answer extends Models.Document {
  content: string;
  questionId: string;
  authorId: string;
  author: Author;
  upvotesDocuments: Models.DocumentList<Vote>;
  downvotesDocuments: Models.DocumentList<Vote>;
  comments: Models.DocumentList<Comment>;
}

export interface Question extends Models.Document {
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  attachmentId?: string;
  author: Author;
  answers: Models.DocumentList<Answer>;
  upvotesDocuments: Models.DocumentList<Vote>;
  downvotesDocuments: Models.DocumentList<Vote>;
  comments: Models.DocumentList<Comment>;
}
