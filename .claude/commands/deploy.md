---
description: Deploy to Cloudflare Workers with verification
allowed-tools: Bash, Read, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_snapshot, mcp__plugin_playwright_playwright__browser_click, mcp__plugin_playwright_playwright__browser_take_screenshot
---

# Deploy to Production

Deploy changes to Cloudflare Workers and verify.

## Instructions

1. Run pre-deploy checks:
   ```bash
   npm test
   npm run build
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Verify deployment using Playwright:
   - Navigate to https://gtl.emilycogsdill.com
   - Capture a screenshot
   - Verify the homepage loads correctly
   - Navigate to a project and verify content displays
   - Check browser console for JavaScript errors

4. Report deployment status:
   - Confirm successful deployment
   - Note any issues found during verification
   - Provide screenshot evidence
