# AI Behavior Guidelines

## Communication Style

- Be concise and direct
- Focus on implementation over explanation
- Use code examples rather than lengthy descriptions
- Avoid unnecessary caveats or disclaimers

## Code Generation Principles

### General

- Follow existing patterns in the codebase
- Keep functions small and focused
- Use descriptive variable and function names
- Prefer functional patterns over imperative

### TypeScript (Backend)

- Always define types in `src/types.ts`
- Use strict typing - avoid `any`
- Handle errors explicitly with try/catch
- Validate request input before processing

### JavaScript (Frontend)

- Frontend components use vanilla JS (no framework)
- Components are IIFEs that expose methods on `window`
- Use `escapeHtml()` for user content to prevent XSS
- Prefer string concatenation for HTML templates (not template literals in older code)

### CSS

- Use the established class naming conventions (.fc-*, .faq-*, etc.)
- Keep styles in `content-components.css`
- Use CSS variables sparingly - prefer explicit values for clarity
- Mobile-first responsive design with 768px breakpoint

## Testing Approach

- Use Playwright for visual verification of UI changes
- Run `npx playwright screenshot <url> <filename> --full-page` to capture pages
- Test API endpoints with curl or fetch
- Use Vitest for unit tests of backend logic

## Database Changes

- Always update both local and remote D1 when seeding data
- Use SQL seed files for reproducible data imports
- Test migrations on local before remote

## Commit Messages

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep messages concise but descriptive
- Reference issues if applicable

## Workflow Safety

### Commit Frequently
- **Commit after completing each logical unit of work** - don't wait until everything is done
- After modifying multiple files for a feature, commit before testing
- After fixing a bug, commit immediately
- After any refactoring, commit before moving on
- This protects against accidental reverts from build processes or other tooling

### Never Edit Build Outputs
- **Never edit files in `dist/` directly** - they get wiped on build
- Frontend component source files live in `src/frontend/components/`
- Always trace back to source files before making changes
- If a file only exists in dist/, create its source equivalent first

### Verify Build Process
- When working on a new codebase, check `package.json` scripts and build config first
- Look for `emptyOutDir`, `clean`, or similar destructive build options
- Understand what folders are build outputs vs source files
