import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Helper function to extract text from different file types
function extractTextFromContent(content: string, fileType: string): string {
  // For now, we'll handle text-based formats
  // In production, you'd use libraries like pdf-parse, mammoth, etc.
  if (fileType === "txt" || fileType === "md") {
    return content;
  }
  // For other formats, we'll store the content as-is
  // In a real implementation, you'd parse PDFs, Word docs, etc.
  return content;
}

// Auto-categorize document based on content
function categorizeDocument(title: string, content: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    campaign: ["campaign", "promotion", "launch", "advertising", "ad campaign"],
    strategy: ["strategy", "plan", "roadmap", "goals", "objectives"],
    content: ["content", "blog", "article", "copy", "copywriting", "social media"],
    analytics: ["analytics", "report", "metrics", "kpi", "dashboard", "data"],
    branding: ["brand", "branding", "identity", "guidelines", "style guide"],
    research: ["research", "study", "survey", "analysis", "insights"],
    template: ["template", "boilerplate", "example", "sample"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword) || lowerContent.includes(keyword))) {
      return category;
    }
  }

  return "general";
}

// Extract tags from content
function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const commonTags = [
    "q1", "q2", "q3", "q4",
    "2024", "2025",
    "social media", "email", "seo", "ppc",
    "b2b", "b2c",
    "product launch", "event", "webinar",
  ];

  const foundTags: string[] = [];
  for (const tag of commonTags) {
    if (text.includes(tag)) {
      foundTags.push(tag);
    }
  }

  // Extract project names (words in quotes or ALL CAPS)
  const projectMatches = text.match(/"([^"]+)"/g) || [];
  projectMatches.forEach(match => {
    const project = match.replace(/"/g, "");
    if (project.length > 2 && project.length < 30) {
      foundTags.push(project);
    }
  });

  return foundTags.slice(0, 10); // Limit to 10 tags
}

// Generate a URL for downloading a file from storage
export const getFileUrl = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Upload and index a document
export const uploadDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    fileType: v.string(),
    fileName: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileUrl: v.optional(v.string()),
    fileSize: v.number(),
    project: v.optional(v.string()),
    team: v.optional(v.string()),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Extract text content
    const extractedContent = extractTextFromContent(args.content, args.fileType);
    
    // Auto-categorize
    const category = categorizeDocument(args.title, extractedContent);
    
    // Extract tags
    const tags = extractTags(args.title, extractedContent);

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      content: extractedContent,
      fileType: args.fileType,
      fileName: args.fileName,
      storageId: args.storageId,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      category,
      project: args.project,
      team: args.team,
      tags,
      uploadedBy: args.uploadedBy,
      uploadedAt: now,
      lastModified: now,
      indexedAt: now,
    });

    return documentId;
  },
});

// Search documents
export const searchDocuments = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    team: v.optional(v.string()),
    project: v.optional(v.string()),
    fileType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    const limit = args.limit || 50;

    let documents = await ctx.db.query("documents").collect();

    // Filter by category if provided
    if (args.category) {
      documents = documents.filter(doc => doc.category === args.category);
    }

    // Filter by team if provided
    if (args.team) {
      documents = documents.filter(doc => doc.team === args.team);
    }

    // Filter by project if provided
    if (args.project) {
      documents = documents.filter(doc => doc.project === args.project);
    }

    // Filter by file type if provided
    if (args.fileType) {
      documents = documents.filter(doc => doc.fileType === args.fileType);
    }

    // If no search query, return all filtered documents
    if (!searchQuery) {
      return documents
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .slice(0, limit);
    }

    // Simple text search (in production, use a proper search engine)
    const searchTerms = searchQuery.split(/\s+/);
    const scoredDocs = documents.map(doc => {
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const tagsLower = doc.tags.join(" ").toLowerCase();

      let score = 0;
      searchTerms.forEach(term => {
        // Title matches are worth more
        if (titleLower.includes(term)) score += 10;
        if (contentLower.includes(term)) score += 1;
        if (tagsLower.includes(term)) score += 5;
      });

      return { doc, score };
    });

    // Sort by score and return top results
    return scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.doc);
  },
});

// Get document by ID
export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all categories
export const getCategories = query({
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    const categories = new Set(documents.map(doc => doc.category));
    return Array.from(categories).sort();
  },
});

// Get all teams
export const getTeams = query({
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    const teams = documents
      .map(doc => doc.team)
      .filter((team): team is string => team !== undefined);
    return Array.from(new Set(teams)).sort();
  },
});

// Get all projects
export const getProjects = query({
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    const projects = documents
      .map(doc => doc.project)
      .filter((project): project is string => project !== undefined);
    return Array.from(new Set(projects)).sort();
  },
});

// Get recent documents
export const getRecentDocuments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_uploaded_at")
      .order("desc")
      .take(limit);
    return documents;
  },
});

// Update document
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    project: v.optional(v.string()),
    team: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Document not found");
    }

    // Re-categorize if content changed
    let category = updates.category;
    if (updates.content || updates.title) {
      const title = updates.title || existing.title;
      const content = updates.content || existing.content;
      category = categorizeDocument(title, content);
    }

    // Re-extract tags if content changed
    let tags = updates.tags;
    if (updates.content || updates.title) {
      const title = updates.title || existing.title;
      const content = updates.content || existing.content;
      tags = extractTags(title, content);
    }

    await ctx.db.patch(id, {
      ...updates,
      category: category || existing.category,
      tags: tags || existing.tags,
      lastModified: Date.now(),
    });
  },
});

// Delete document
export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

