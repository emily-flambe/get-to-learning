---
description: Run checks, stage changes, and generate commit message
allowed-tools: Bash, Read, Glob
---

# PR Preparation

Prepare changes for commit and PR.

## Instructions

1. Run all checks:
   - `npm test` - Unit tests
   - `npm run test:e2e` - E2E tests
   - `npm run build` - Build verification

2. Show uncommitted changes:
   - `git status`
   - `git diff --stat`

3. If all checks pass:
   - Stage relevant files with `git add`
   - Generate a descriptive commit message based on the changes
   - Show the proposed commit for review

4. If checks fail:
   - Report which checks failed
   - Show relevant error output
   - Do not stage or commit
