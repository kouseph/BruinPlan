import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const options = new chrome.Options();
// options.addArguments("--headless=new"); // Optional: remove for visible browser

const service = new chrome.ServiceBuilder("/usr/local/bin/chromedriver");

(async function run() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  try {
    console.log("🚀 Navigating...");
    await driver.get("https://sa.ucla.edu/ro/public/soc");
    await driver.wait(until.titleContains("Schedule of Classes"), 30000);
    console.log("✅ Page loaded");

    const setTerm = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		const root = app?.shadowRoot;
		if (!root) return '❌ Shadow root not found';
	  
		const select = root.querySelector('#optSelectTerm');
		if (!select) return '❌ Term select element not found';
	  
		select.value = '25S'; // Spring 2025
		select.dispatchEvent(new Event('change', { bubbles: true }));
		return '✅ Spring 2025 selected';
	  `);
    console.log(setTerm);

    // Wait for dropdown to populate
    await driver.sleep(1000);

    const result = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		if (!app) return '❌ ucla-sa-soc-app not found';
		const root = app.shadowRoot;
		if (!root) return '❌ shadowRoot on app not found';
	  
		const wrapper = root.querySelector('#webComponentWrapper');
		if (!wrapper) return '❌ #webComponentWrapper not found';
	  
		const layout = wrapper.querySelector('#layoutContentArea');
		if (!layout) return '❌ #layoutContentArea not found';
	  
		const basicSearch = layout.querySelector('#basic-search');
		if (!basicSearch) return '❌ #basic-search not found';
	  
		const socSearch = basicSearch.querySelector('#soc-search');
		if (!socSearch) return '❌ #soc-search not found';
	  
		const partial = socSearch.querySelector('#partial_content');
		if (!partial) return '❌ #partial_content not found';
	  
		const subjectArea = partial.querySelector('#div_subjectArea');
		if (!subjectArea) return '❌ #div_subjectArea not found';
	  
		const subjectDiv = subjectArea.querySelector('#div_subject');
		if (!subjectDiv) return '❌ #div_subject not found';
	 