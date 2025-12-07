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

### ID Mismatch Problem

Local and remote D1 databases have **different auto-increment IDs** for the same logical records. For example:
- Local: Project "Database Internals" might be ID 4
- Remote: Same project might be ID 2

This causes problems when:
- Migrations reference specific IDs
- localStorage caches module IDs from one environment
- API calls use hardcoded IDs

### Syncing Data to Remote

When you need to sync local content to remote:

1. **Query remote first** to find the correct project ID:
   ```bash
   wrangler d1 execute gtl-db --remote --command="SELECT id, name FROM projects"
   ```

2. **Generate migration SQL** that uses subqueries instead of hardcoded IDs:
   ```sql
   -- Use sort_order or other unique fields to reference modules
   INSERT INTO flashcards (module_id, front, back)
   VALUES ((SELECT id FROM modules WHERE project_id = 2 AND sort_order = 1), 'term', 'definition');
   ```

3. **Run migration on remote:**
   ```bash
   wrangler d1 execute gtl-db --remote --file=./src/db/migrations/XXX.sql
   ```

4. **Deploy code changes:**
   ```bash
   npm run deploy
   ```

### Frontend Caching

The frontend stores selected module IDs in localStorage (`gtl_selected_modules_{projectId}`). After database migrations that change module IDs, users may have stale cached IDs.

**The code handles this** by filtering cached IDs against valid modules from the API (see `renderProjectContent` in app.js). This prevents 400 errors from invalid module IDs.

### After any deployment:
- Test the live site with Playwright or manually in browser
- Clear localStorage if you see 400 errors with invalid module IDs
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
