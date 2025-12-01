# Deployment

## Overview

GTL runs on Cloudflare Workers with D1 database. Deployment is handled via Wrangler CLI.

## URLs

- **Production**: https://gtl.emilycogsdill.com
- **Workers Dashboard**: https://dash.cloudflare.com

## Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers enabled

## Configuration

### wrangler.toml

```toml
name = "get-to-learning"
main = "src/index.ts"
compatibility_date = "2025-01-15"

routes = [
  { pattern = "gtl.emilycogsdill.com/*", zone_name = "emilycogsdill.com" }
]

[assets]
directory = "./dist"
not_found_handling = "single-page-application"

[[d1_databases]]
binding = "DB"
database_name = "gtl-db"
database_id = "d740952f-4fd9-4a0b-b85f-2ffd042fffd3"

[dev]
port = 8788
```

## Commands

### Development

```bash
# Start local dev server (port 8788)
npm run dev

# Build frontend assets
npm run build:frontend
```

### Database

```bash
# Initialize local D1 database
npm run db:init

# Initialize remote D1 database
npm run db:init:remote

# Execute SQL on local
wrangler d1 execute gtl-db --local --file=./path/to/file.sql

# Execute SQL on remote
wrangler d1 execute gtl-db --remote --file=./path/to/file.sql

# Query local database
wrangler d1 execute gtl-db --local --command="SELECT * FROM projects"

# Query remote database
wrangler d1 execute gtl-db --remote --command="SELECT * FROM projects"
```

### Deployment

```bash
# Deploy to production
npm run deploy

# Or directly with wrangler
wrangler deploy
```

## Deployment Process

1. **Build frontend assets**
   ```bash
   npm run build:frontend
   ```
   This runs Vite build and preserves the vanilla JS components.

2. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```
   This uploads:
   - Worker code (src/index.ts compiled)
   - Static assets (dist/)

3. **Verify deployment**
   ```bash
   curl https://gtl.emilycogsdill.com/api/health
   ```

## Database Seeding

To seed data to production:

1. Create SQL file with INSERT statements
2. Execute on remote:
   ```bash
   wrangler d1 execute gtl-db --remote --file=./seed-data.sql
   ```

Example seed file:
```sql
INSERT INTO projects (name, description) VALUES
  ('Database Internals', 'Study guide for Database Internals book');

INSERT INTO modules (project_id, name, description) VALUES
  (1, 'Chapters 4-6: B-Trees', 'B-Trees, Transactions, Variants');

INSERT INTO flashcards (module_id, front, back) VALUES
  (1, 'WAL', 'Write-Ahead Log - technique for crash recovery');
```

## Troubleshooting

### Local server not starting
- Check if port 8788 is in use
- Run `lsof -i :8788` to find conflicting processes

### Database not found
- Run `npm run db:init` for local
- Run `npm run db:init:remote` for production

### Assets not updating
- Clear browser cache
- Verify `npm run build:frontend` completed
- Check Cloudflare dashboard for deployment status

### CORS issues
- API has permissive CORS (`origin: '*'`)
- If issues persist, check browser console for specific errors

## Monitoring

- **Logs**: Cloudflare Dashboard > Workers > get-to-learning > Logs
- **Analytics**: Cloudflare Dashboard > Workers > get-to-learning > Analytics
- **D1 Metrics**: Cloudflare Dashboard > D1 > gtl-db
