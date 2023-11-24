/*KeywordsAPI*/

const Keyword = require('../modules/keywords')
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const UserAgent = require('user-agents');
class Bot {
    constructor() {
        this.isBotRunning = false;
    }

    startBot() {
        this.isBotRunning = true;
        this.runBot();
    }

    stopBot() {
        this.isBotRunning = false;
    }

    async getRandomKeyword() {

        const keywords = await Keyword.find();

        const incompleteKeywords = keywords.filter(keyword => keyword.amount > keyword.clicked_amount);

        if (incompleteKeywords.length === 0) {
            console.log('All keywords have been clicked');
            return null;
        }

        // Get the current time in milliseconds
        const currentTime = new Date().getTime();

        // Create a new Date object for tomorrow's 12:00 am
        const tomorrowTwelveAM = new Date();
        tomorrowTwelveAM.setDate(tomorrowTwelveAM.getDate() + 1);
        tomorrowTwelveAM.setHours(0);
        tomorrowTwelveAM.setMinutes(0);
        tomorrowTwelveAM.setSeconds(0);
        tomorrowTwelveAM.setMilliseconds(0);

        // Get the time for tomorrow's 12:00 am in milliseconds
        const tomorrowTwelveAMTime = tomorrowTwelveAM.getTime();

        // Calculate the time from the current time to tomorrow's 12:00 am
        const timeToTomorrowTwelveAM = tomorrowTwelveAMTime - currentTime;

        console.log(`The time from now to tomorrow's 12:00 am is ${timeToTomorrowTwelveAM} milliseconds`);
        console.log(`waiting ${parseInt(timeToTomorrowTwelveAM / incompleteKeywords.length )} milliseconds...`);

        await new Promise(resolve => setTimeout(resolve, parseInt(timeToTomorrowTwelveAM / incompleteKeywords.length )));

        const totalAmountSum = incompleteKeywords.reduce((acc, keyword) => acc + keyword.amount, 0);
        let random = Math.floor(Math.random() * totalAmountSum);
        let selectedKeyword;
        for (let i = 0; i < incompleteKeywords.length; i++) {
            random -= incompleteKeywords[i].amount;
            if (random < 0) {
                selectedKeyword = incompleteKeywords[i];
                break;
            }
        }
        if (!selectedKeyword) {
            selectedKeyword = incompleteKeywords[incompleteKeywords.length - 1];
        }
        return selectedKeyword;
    }
    async runBot() {
        //Defining the userAgent variable
         // Generate a random user agent string
        
        while (this.isBotRunning) {
            const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
            const proxy = "de.smartproxy.com:20000";
            try {
                const selectedKeyword = await this.getRandomKeyword();

                if (!selectedKeyword) {
                    //Reset the clicked_amount to 0
                    Keyword.updateMany({}, { $set: { clicked_amount: 0 } })
                        .exec()
                        .then(result => {
                            console.log('clicked_amount fields was reset');
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    continue;
                    //break;
                }
                console.log(`Selected keyword: ${selectedKeyword.keyword}`);

                // execute bot logic
                // Chromium options
                const options = new chrome.Options()
                    .addArguments('--disable-blink-features')
                    .addArguments('--disable-blink-features=AutomationControlled')
                    .addArguments( `--user-agent=${userAgent}`)
                    //.addArguments(`--proxy-server=${proxy}`)
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
                await inputField.sendKeys(selectedKeyword.keyword, webdriver.Key.RETURN);

                // Wait for search results to load and click "leber-ratgeber" link
                await driver.wait(
                    webdriver.until.elementLocated(webdriver.By.partialLinkText(selectedKeyword.link)),
                    15000
                );
                const linkElem = await driver.findElement(webdriver.By.partialLinkText(selectedKeyword.link));
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
                await driver.sleep(10000);

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

                // // Click the first two links
                // let count = 0;
                // for (let link of links) {
                //     if (count == 3) break;
                //     count++;
                //     await actions
                //         .keyDown(webdriver.Key.CONTROL)
                //         .click(link)
                //         .keyUp(webdriver.Key.CONTROL)
                //         .perform();
                //     // Wait for the new tab/window to load and switch to it
                //     await driver.sleep(5000);
                // }

                await driver.sleep(5000);
                // Quit the driver when no longer needed
                await driver.quit();
                await Keyword.updateOne({ _id: selectedKeyword._id }, { $inc: { clicked_amount: 1 } });

                // Delay between iterations (adjust as needed)
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (e) {
                console.log(`error: ${e}`)
            }

        }
    }
}


const bot = new Bot();

const startBot = async (req, res) => {
    try {
        bot.startBot()
        res.status(201).json({ 'status': 'started' })
    } catch (error) {
        res.status(500).json({ msg: "error" })
    }

}

const stopBot = async (req, res) => {
    try {
        bot.stopBot()
        res.status(201).json({ 'status': 'stopped' })
    } catch (error) {
        res.status(500).json({ msg: error })
    }
}
const getAllKeywords = async (req, res) => {
    try {
        const getallKeywords = await Keyword.find({})
        res.status(200).json(getallKeywords)
    } catch (error) {
        res.status(500).json({ msg: error })
    }

}

const createKeywords = async (req, res) => {
    try {
        const keyword = await Keyword.create(req.body)
        res.status(201).json({ keyword })
    } catch (error) {
        res.status(500).json({ msg: error })
    }

}

const getKeywords = async (req, res) => {
    try {
        const { _page, _limit } = req.query;
        const keywords = await Keyword.find({})
            .skip((_page - 1) * _limit)
            .limit(parseInt(_limit));

        res.status(200).json(keywords);
    } catch (error) {
        res.status(500).json({ msg: error });
    }


}

const updateKeyword = async (req, res) => {
    try {
        const { id: keywordID } = req.params
        const updatekeyword = await Keyword.findOneAndUpdate({ _id: keywordID }, req.body, { new: true, runValidators: true })
        if (!updatekeyword) {
            return res.status(404).json({ msg: `No keyword with id: ${keywordID} found` })
        }
        res.status(200).json({ updatekeyword })

    } catch (error) {
        res.status(500).json({ msg: error })
    }

}

const deleteKeyword = async (req, res) => {
    try {
        const { id: keywordID } = req.params;
        const deletekeyword = await Keyword.findOneAndDelete({ _id: keywordID });
        if (!deletekeyword) {
            return res.status(404).json({ msg: `No keyword with id: ${keywordID} found` })
        }
        res.status(200).json({ deletekeyword })
    } catch (error) {
        res.status(500).json({ msg: error })
    }
}

module.exports = {
    getAllKeywords,
    createKeywords,
    getKeywords,
    updateKeyword,
    deleteKeyword,
    startBot,
    stopBot
}

/*KeywordsAPI*/