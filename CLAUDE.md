# GTL (Get To Learning)

Personal learning platform with flashcards and FAQs for studying technical topics.

## Quick Reference

- **Live URL**: https://gtl.emilycogsdill.com
- **Dev Server**: `npm run dev` (port 8788)
- **Deploy**: `npm run deploy`

## Documentation

- [AI Behavior Guidelines](.claude/ai-behavior.md) - Communication style and code generation principles
- [Architecture](.claude/architecture.md) - System design and component structure
- [API Reference](.claude/api.md) - REST endpoints and database schema
- [Frontend](.claude/frontend.md) - UI components and styling
- [Coding Standards](.claude/coding-standards.md) - TypeScript conventions and patterns
- [Deployment](.claude/deployment.md) - Cloudflare Workers deployment guide

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JS with hash-based routing
- **Build**: Vite
- **Testing**: Vitest with Cloudflare Workers pool

## Project Structure

```
src/
  index.ts          # Main app entry, route mounting
  types.ts          # TypeScript interfaces
  api/
    projects.ts     # Project CRUD endpoints
    modules.ts      # Module CRUD endpoints
    flashcards.ts   # Flashcard CRUD + bulk operations
    faqs.ts         # FAQ CRUD + bulk operations
  db/
    schema.sql      # Database schema
    queries.ts      # Database query functions

dist/
  index.html        # Main SPA entry
  app.js            # Hash router and state management
  components/
    FlashcardList.js     # Flashcard chip display + detail panel
    FAQList.js           # FAQ accordion display
    ReviewMode.js        # Full-screen flashcard review
    content-components.css  # Component styles
```

## Critical: Local/Remote Database Sync

**ALWAYS ensure remote deployment matches local.** This is non-negotiable.

When running database migrations:
1. Run on local: `wrangler d1 execute gtl-db --local --file=./src/db/migrations/XXX.sql`
2. Run on remote: `wrangler d1 execute gtl-db --remote --file=./src/db/migrations/XXX.sql`
3. **Verify** the remote data matches local before considering done

**ID differences:** Local and remote databases may have different IDs for the same records. Always query remote to find correct IDs before running migrations that reference specific records.

**After any deployment:**
- Check the live site visually (don't just curl the API)
- Verify data appears correctly on remote
- Compare with localhost:8788 to ensure parity

## Common Tasks

```bash
# Development
npm run dev                    # Start dev server on port 8788
npm run test                   # Run tests

# Database
npm run db:init                # Initialize local D1
npm run db:init:remote         # Initialize remote D1

# Deployment
npm run deploy                 # Deploy to Cloudflare
```
