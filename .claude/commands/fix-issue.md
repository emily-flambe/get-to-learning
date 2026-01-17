---
description: Pull and fix a GitHub issue by number
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebFetch
---

# Fix GitHub Issue

Fix the GitHub issue: $ARGUMENTS

## Instructions

1. Fetch the issue details using `gh issue view $ARGUMENTS`
2. Understand the problem described in the issue
3. Search the codebase to locate relevant files
4. Implement the fix following existing patterns
5. Run tests: `npm test && npm run test:e2e`
6. If tests pass, commit with message referencing the issue: `fix: <description> (closes #<issue>)`
