import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const options = new chrome.Options();
options.addArguments("--headless=new");

const service = new chrome.ServiceBuilder("/usr/local/bin/chromedriver");

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .setChromeService(service)
  .build();

try {
  console.log("Navigating...");
  await driver.get("https://web.cs.ucla.edu/classes/spring25/cs35L/index.html");

  await driver.wait(until.elementLocated(By.css("h1")), 10000);
  const heading = await driver.findElement(By.css("h1")).getText();
  console.log("✅ Heading:", heading);
} catch (err) {
  console.error("❌ Error:", err);
} finally {
  await driver.quit();
}
