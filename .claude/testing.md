# Testing

## Overview

The test suite is intentionally minimal, focusing only on essential behavior.

## Test Types

### API Tests (Unit/Integration)
- **Location:** `test/api.test.ts`
- **Framework:** Vitest with Cloudflare Workers pool
- **Run:** `npm test` or `npm run test:watch`

Tests all CRUD operations for:
- Projects
- Modules
- Flashcards
- Questions (FAQs) with tags

Each test runs against an isolated in-memory D1 database.

### E2E Tests (Smoke)
- **Location:** `test/e2e/smoke.spec.ts`
- **Framework:** Playwright
- **Run:** `npm run test:e2e` (requires dev server running)

Smoke tests verify:
- Homepage loads
- Navigation works
- Flashcard section renders
- Questions section renders

### Run All Tests
```bash
npm run test:all
```

## When to Add Tests

Only add tests for:
1. **Critical paths** - user flows that must not break
2. **Complex logic** - business rules that are easy to get wrong
3. **Regressions** - bugs that have occurred before

Do NOT add tests for:
- Simple CRUD (already covered)
- CSS/styling
- Minor UI variations

## Test Database Schema

The test setup in `test/api.test.ts` creates tables fresh for each test. When adding columns to the schema, also update the test setup.

Current tables:
- `projects` - id, name, description, timestamps
- `modules` - id, project_id, name, description, sort_order, timestamps
- `flashcards` - id, module_id, front, back, sort_order, timestamps
- `faqs` - id, module_id, question, answer, tags, sort_order, timestamps
