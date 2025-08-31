const { firefox } = require('playwright');

try {
    (async () => {
        // Set a folder to store browser state
        const userDataDir = './user-data';

        // Launch browser with persistent context
        const browser = await firefox.launchPersistentContext(userDataDir, {
            headless: false, 
        });

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

        // Wait for the UL with the quick filters
        await page.waitForSelector('ul.tag-rail__list.quick__filters--list.list--plain.display--flex.wrap.width--auto');

        // Get the first <li> inside and click it
        const firstFilter = await page.$('ul.tag-rail__list.quick__filters--list.list--plain.display--flex.wrap.width--auto li');
        if (firstFilter) {
            console.log("Clicking the first quick filter...");
            await firstFilter.click();

            // Wait for page content to reload after filter click
            await page.waitForLoadState('networkidle');
        }

        // Find all rows in the table
        const rows = page.locator('table.table.zebra.position--relative.data-viewer-table tbody tr');
        const rowCount = await rows.count();

        const jobs = [];
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cells = row.locator(':scope > *');
            const link = cells.nth(2).locator('div span span a');
            if (await link.count()) {
                await Promise.all([
                    page.waitForLoadState('load'),
                    link.click()
                ]);

                await page.waitForTimeout(1000);

                // Wait for page/network to load
                await page.waitForLoadState('networkidle');

                // --- Save the information from the panel ---
                const panel = page.locator('div.panel').first();
                const childDivs = panel.locator('> div'); 

                const childCount = await childDivs.count();

                const jobInfo = {}; 

                for (let j = 0; j < childCount; j++) {
                    const child = childDivs.nth(j);
                    const innerDiv = child.locator('div'); 

                    // Get raw HTML from <span> and <p>
                    const spanRaw = await innerDiv.locator('span').innerHTML().catch(() => '');
                    // Remove all spaces from the span
                    const span = spanRaw.replace(/\s+/g, '');

                    const pRaw = await innerDiv.locator('p').innerHTML().catch(() => '');
                    const p = pRaw.replace(/[\n\t]/g, '');

                    //console.log(`${span}:\n${p}\n`);

                    // Optionally, save to jobInfo object
                    jobInfo[span] = p;
                }

                // Add job info to jobs array
                console.log(jobInfo);
                jobs.push(jobInfo);

                // Click the close button inside floating action bar
                const actionBar = page.locator('nav.floating--action-bar.color--bg--default');
                const closeButton = actionBar.locator('button:nth-child(5)');

                await closeButton.click();
            }
        }

        //console.log(jobs);
        await page.waitForTimeout(100000);

        // Close browser when done
        // await browser.close();
    })();
} catch (err) {
    console.log(err);
}
