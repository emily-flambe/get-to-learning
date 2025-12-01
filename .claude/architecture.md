# Architecture

## System Overview

```
+------------------+     +------------------+     +------------------+
|    Browser       |     | Cloudflare       |     | Cloudflare D1    |
|                  |     | Worker           |     | (SQLite)         |
|  - SPA (Vite)    |<--->|  - Hono API      |<--->|  - projects      |
|  - Hash routing  |     |  - Static assets |     |  - modules       |
|  - Vanilla JS    |     |                  |     |  - flashcards    |
+------------------+     +------------------+     |  - faqs          |
                                                  +------------------+
```

## Data Model

```
Project (1) -----> (*) Module (1) -----> (*) Flashcard
                              |
                              +--------> (*) FAQ
```

### Hierarchy

- **Project**: Top-level container (e.g., "Database Internals")
- **Module**: Section within a project (e.g., "Chapters 4-6: B-Trees")
- **Flashcard**: Term/definition pair for studying
- **FAQ**: Question/answer for deeper understanding

## Request Flow

1. Browser loads SPA from Cloudflare CDN (dist/)
2. SPA makes API calls to `/api/*` endpoints
3. Hono routes requests to appropriate handler
4. Handler validates input and calls query functions
5. D1 executes SQL and returns results
6. Response sent back as JSON

## Component Architecture

### Backend (src/)

```
src/index.ts              # App entry, middleware, route mounting
    |
    +-- api/projects.ts   # /api/projects/* handlers
    +-- api/modules.ts    # /api/modules/* handlers
    +-- api/flashcards.ts # /api/flashcards/* handlers
    +-- api/faqs.ts       # /api/faqs/* handlers
    |
    +-- db/queries.ts     # Database query functions
    +-- types.ts          # TypeScript interfaces
```

### Frontend (dist/)

```
dist/index.html           # Main SPA shell with hash router
    |
    +-- components/
        +-- FlashcardList.js  # Chip display + detail panel
        +-- FAQList.js        # Accordion Q&A display
        +-- ReviewMode.js     # Full-screen study mode
        +-- content-components.css
```

## Key Design Decisions

### Why Cloudflare Workers?
- Edge deployment for low latency
- D1 provides SQLite without server management
- Free tier sufficient for personal use
- Easy deployment with Wrangler

### Why Vanilla JS Frontend?
- Simple app doesn't need framework overhead
- Faster load times
- Easy to understand and modify
- Components are self-contained IIFEs

### Why Hash-Based Routing?
- Works with static hosting (SPA mode)
- No server-side routing needed
- Simple implementation
- Browser handles navigation

### Flashcard UI Design
- Compact chips for space efficiency
- Selected card shows detail panel below all chips
- Chips stay visible during study for context
- Mobile-friendly touch targets
