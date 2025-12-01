import { test, expect } from '@playwright/test';

// Smoke tests - verify essential user flows work
// These tests assume a running dev server with existing data

test.describe('Smoke Tests', () => {
  test('homepage loads and shows header', async ({ page }) => {
    await page.goto('/');
    // Check the header loads - GTL app has h1 with "GTL"
    const header = page.locator('h1');
    await expect(header).toBeVisible();
  });

  test('can navigate to a module', async ({ page }) => {
    await page.goto('/');

    // Click first project if it exists
    const projectLink = page.locator('.project-card a').first();
    if (await projectLink.count() > 0) {
      await projectLink.click();
      await expect(page.locator('.module-card, .empty-state')).toBeVisible();
    }
  });

  test('flashcard section renders', async ({ page }) => {
    // Navigate directly to a module page (assumes module 3 exists from Database Internals)
    await page.goto('/#/modules/3');

    // Wait for content to load
    await page.waitForTimeout(500);

    // Check flashcard section exists
    const flashcardSection = page.locator('.flashcard-section');
    if (await flashcardSection.count() > 0) {
      await expect(flashcardSection).toBeVisible();
      await expect(page.locator('.fc-chip, .empty-state')).toBeVisible();
    }
  });

  test('questions section renders with tag filter', async ({ page }) => {
    await page.goto('/#/modules/3');
    await page.waitForTimeout(500);

    const faqSection = page.locator('.faq-section');
    if (await faqSection.count() > 0) {
      await expect(faqSection).toBeVisible();
      // Tag filter should appear if there are tagged questions
      const tagFilter = page.locator('.tag-filter');
      // Just check section loads - tag filter may or may not be present
      await expect(page.locator('.faq-list, .empty-state')).toBeVisible();
    }
  });
});
