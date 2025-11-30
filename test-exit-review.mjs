import { chromium } from '@playwright/test';

async function testExitReview() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Add console logging
  page.on('console', msg => console.log('   [BROWSER]:', msg.text()));

  console.log('Testing Exit Review button on gtl.emilycogsdill.com...\n');

  try {
    // First, create flashcard via API
    console.log('1. Creating flashcard via API...');
    const createResponse = await fetch('https://gtl.emilycogsdill.com/api/modules/1/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'Playwright Test Q', back: 'Playwright Test A' })
    });
    const flashcard = await createResponse.json();
    console.log(`   Created flashcard: ${JSON.stringify(flashcard)}`);

    // Navigate directly to review mode
    console.log('2. Navigating to review mode...');
    await page.goto('https://gtl.emilycogsdill.com/#/modules/1/review');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Check page content
    const pageContent = await page.content();
    const hasExitButton = pageContent.includes('Exit Review');
    console.log(`   Has Exit Review button: ${hasExitButton}`);

    if (hasExitButton) {
      // Debug - check window state
      const debugInfo = await page.evaluate(() => {
        return {
          hash: window.location.hash,
          navigateType: typeof window.navigate,
          ReviewModeExists: typeof window.ReviewMode !== 'undefined',
          navigateFunction: window.navigate ? window.navigate.toString().slice(0, 100) : 'N/A'
        };
      });
      console.log('3. Debug state before click:');
      console.log(`   Hash: ${debugInfo.hash}`);
      console.log(`   window.navigate type: ${debugInfo.navigateType}`);
      console.log(`   ReviewMode exists: ${debugInfo.ReviewModeExists}`);

      // Click the Exit Review button
      console.log('4. Clicking Exit Review button...');
      await page.click('button:has-text("Exit Review")');
      await page.waitForTimeout(2000);

      const afterUrl = page.url();
      console.log(`   URL after click: ${afterUrl}`);

      if (currentUrl === afterUrl) {
        console.log('\n** FAIL: Exit Review button did NOT navigate! **\n');

        // More debugging
        const afterDebug = await page.evaluate(() => {
          return {
            hash: window.location.hash,
            pageContent: document.body.innerHTML.slice(0, 500)
          };
        });
        console.log('   After-click state:');
        console.log(`   Hash: ${afterDebug.hash}`);
        console.log(`   Page content preview: ${afterDebug.pageContent.slice(0, 200)}...`);
      } else {
        console.log('\n** SUCCESS: Exit Review button worked! **');
        console.log(`   Navigated from ${currentUrl} to ${afterUrl}`);
      }
    } else {
      console.log('\n   Page content preview:');
      console.log(pageContent.slice(0, 1000));
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testExitReview();
