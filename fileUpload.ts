import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate upload URL for client-side file upload
export const generateUploadUrl = action({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file to storage and return storage ID
export const saveFile = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    title: v.string(),
    content: v.string(),
    fileSize: v.number(),
    project: v.optional(v.string()),
    team: v.optional(v.string()),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the mutation to save document metadata
    const documentId = await ctx.runMutation(api.documents.uploadDocument, {
      title: args.title,
      content: args.content,
      fileType: args.fileType,
      fileName: args.fileName,
      storageId: args.storageId,
      fileSize: args.fileSize,
      project: args.project,
      team: args.team,
      uploadedBy: args.uploadedBy,
    });

    return { documentId, storageId: args.storageId };
  },
});

