import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(), // Extracted text content for search
    fileType: v.string(), // pdf, docx, txt, md, etc.
    fileName: v.string(),
    storageId: v.optional(v.id("_storage")), // Convex storage ID for the file
    fileUrl: v.optional(v.string()), // URL to the actual file (legacy/fallback)
    fileSize: v.number(), // in bytes
    category: v.string(), // Auto-categorized: campaign, strategy, content, analytics, etc.
    project: v.optional(v.string()),
    team: v.optional(v.string()),
    tags: v.array(v.string()), // Auto-generated tags
    uploadedBy: v.string(), // userId
    uploadedAt: v.number(), // timestamp
    lastModified: v.number(),
    indexedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_team", ["team"])
    .index("by_project", ["project"])
    .index("by_uploaded_by", ["uploadedBy"])
    .index("by_uploaded_at", ["uploadedAt"]),
});
