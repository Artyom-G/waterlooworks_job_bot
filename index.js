const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Go to the login page
    await page.goto('https://waterlooworks.uwaterloo.ca/');

    console.log("Please log in...");

    // Wait until redirected to the myAccount page
    await page.waitForURL('https://waterlooworks.uwaterloo.ca/myAccount/**', {
        timeout: 0
    });

    console.log("Logged in!");

    // Do something after login...
    // e.g. take a screenshot
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'after-login.png' });

    // Go to the login page
    await page.goto('https://waterlooworks.uwaterloo.ca/myAccount/co-op/direct/jobs.htm');

    await page.waitForTimeout(1000);

    // Wait for the div with id "displayStudentMyDocuments" to appear
    await page.waitForSelector('#displayStudentMyDocuments', { timeout: 0 });

    // Click the div
    await page.click('#displayStudentMyDocuments');

    await page.waitForTimeout(500000);

    // Close browser when done
    await browser.close();
})();
