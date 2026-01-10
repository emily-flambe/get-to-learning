---
description: Sync local D1 database changes to remote
allowed-tools: Bash, Read, Write, Edit
---

# Database Sync

Sync database changes from local to remote D1.

## Instructions

1. Query remote database state:
   ```bash
   wrangler d1 execute gtl-db --remote --command="SELECT id, name FROM projects"
   wrangler d1 execute gtl-db --remote --command="SELECT id, project_id, name FROM modules"
   ```

2. Compare with local:
   ```bash
   wrangler d1 execute gtl-db --local --command="SELECT id, name FROM projects"
   wrangler d1 execute gtl-db --local --command="SELECT id, project_id, name FROM modules"
   ```

3. For any new content to sync:
   - Generate migration SQL using subqueries (not hardcoded IDs)
   - Save to `src/db/migrations/XXX_<description>.sql`
   - Test on local first: `wrangler d1 execute gtl-db --local --file=<migration>`
   - Apply to remote: `wrangler d1 execute gtl-db --remote --file=<migration>`

4. Deploy if code changes needed:
   ```bash
   npm run deploy
   ```

5. Verify remote matches local behavior
