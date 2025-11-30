# GTL (Get To Learning)

Personal learning platform with flashcards and FAQs, built on Cloudflare Workers.

## Development

```bash
npm install
npm run dev
```

## Database Setup

```bash
# Initialize local database
npm run db:init

# Initialize remote database
npm run db:init:remote
```

## Deployment

```bash
# Deploy to production
npm run deploy:prod
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project with modules
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

See implementation docs for full API reference.
