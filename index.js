const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Create fake user-agent
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';
// Fisher-Yates shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
async function generateDriver() {
    // Chromium options
    const options = new chrome.Options()
        .addArguments(`user-agent=${userAgent}`)
        .excludeSwitches('enable-automation'); // Optional: Exclude automation flag

    // Create a new WebDriver with options
    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Navigate to website while spoofing user-agent
    await driver.get('https://www.google.de/');
    // Accept cookies
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('L2AGLb')), 5000).click();

    // Find and input search query
    const inputField = await driver.findElement(webdriver.By.name('q'));
    await inputField.sendKeys('Leberkur', webdriver.Key.RETURN);

    // Wait for search results to load and click "leber-ratgeber" link
    await driver.wait(
        webdriver.until.elementLocated(webdriver.By.partialLinkText("leber-ratgeber")),
        15000
    );
    const linkElem = await driver.findElement(webdriver.By.partialLinkText("leber-ratgeber"));
    // Use the `sendKeys()` method on the link element to open it in a new tab via `Control` + `click`
    const controlClick = driver.actions({ bridge: true });
    await controlClick
        .keyDown(webdriver.Key.CONTROL) // Press the `Control` key down
        .click(linkElem) // Click the link using left-click
        .keyUp(webdriver.Key.CONTROL) // Release the `Control` key
        .perform();

    // After the click action opens the link in a new tab, you need to switch the Selenium focus to that tab window so that you can interact with it.
    // First, get all of the open windows/tabs available to Selenium:
    const availableWindows = await driver.getAllWindowHandles();

    // In order to interact with any window in Selenium, we need to switch to the correct window with a corresponding handle.
    // In this case, the new tab window would be the second tab element, which is at index 1 of `availableWindows` array:
    const newTabWindow = availableWindows[1];

    //Then, switch the Selenium focus to that new/test or tab window by using the `switchTo().window()` method against the window handle:
    await driver.switchTo().window(newTabWindow);


    // Wait for page to load
    await driver.wait(webdriver.until.titleContains("Vorbe"), 10000);

    // Perform actions on the webpage
    // Scroll down to the bottom of the page
    await driver.executeScript("window.scrollTo(0,document.body.scrollHeight)");

    // Sleep a bit before continuing
    await driver.sleep(2000);

    // Scroll back up to the top of the page
    await driver.executeScript("window.scrollTo(0,0)");

    // Find all links and save them to an array
    const links = await driver.findElements(webdriver.By.css("a"));

    // Perform a Ctrl + Click action on each link to open in a new tab/window
    const actions = driver.actions({ bridge: true });

    // Shuffle the links array to randomize the order
    //shuffle(links);

    // Click the first two links
    let count = 0;
    for (let link of links) {
        if (count == 3) break;
        count++;
        await actions
            .keyDown(webdriver.Key.CONTROL)
            .click(link)
            .keyUp(webdriver.Key.CONTROL)
            .perform();
        // Wait for the new tab/window to load and switch to it
        await driver.sleep(5000);
    }


    // Perform actions on the webpage

    return driver;
}

async function main() {
    let isRunning = true;

    while (isRunning) {
        const driver = await generateDriver();

        // Perform actions on the webpage with the driver

        // Quit the driver when no longer needed
        await driver.quit();

        // Delay between iterations (adjust as needed)
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main().catch(console.error);
