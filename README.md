# Convex

A smart internal search tool that indexes all marketing documents and assets, delivers fast and relevant results, and helps teams find information instantly.

## About

This is the Convex backend for the Knowledge Discovery & Internal Search platform. It provides:
- Document indexing and search functionality
- User management and authentication
- File upload and storage
- Interview scheduling and management
- Comment and rating system

## Getting Started

### Prerequisites
- Node.js 18+
- Convex account (sign up at https://convex.dev)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
CONVEX_DEPLOYMENT=your_convex_deployment_url
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

3. Run the development server:
```bash
npm run dev
```

4. Deploy to production:
```bash
npm run deploy
```

## Convex Functions

Write your Convex functions here. See https://docs.convex.dev/functions for more.

### Query Function Example

```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  args: {
    first: v.number(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db.query("tablename").collect();
    return documents;
  },
});
```

### Mutation Function Example

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  args: {
    first: v.string(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      body: args.first,
      author: args.second,
    });
    return await ctx.db.get(id);
  },
});
```

## Project Structure

- `schema.ts` - Database schema definitions
- `documents.ts` - Document search and indexing functions
- `fileUpload.ts` - File upload handling
- `users.ts` - User management functions
- `interviews.ts` - Interview scheduling functions
- `comments.ts` - Comment and rating system
- `http.ts` - HTTP endpoints (webhooks)
- `auth.config.ts` - Authentication configuration

## Documentation

Use the Convex CLI to push your functions to a deployment. See everything the Convex CLI can do by running `npx convex -h` in your project root directory. To learn more, launch the docs with `npx convex docs`.
