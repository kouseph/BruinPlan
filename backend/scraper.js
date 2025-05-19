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
	  
		const autocomplete = subjectDiv.querySelector('#select_filter_subject');
		if (!autocomplete) return '❌ #select_filter_subject not found';
	  
		const autocompleteShadow = autocomplete.shadowRoot;
		if (!autocompleteShadow) return '❌ shadowRoot on #select_filter_subject not found';
	  
		const input = autocompleteShadow.querySelector('input');
		if (!input) return '❌ input not found in autocomplete';
	  
		input.click();
		return '✅ input clicked';
	  `);
    console.log("🔽 Interaction result:", result);

    // STEP 2: Wait for dropdown options to appear
    await driver.sleep(1500); // wait for dropdown to populate

    // STEP 3: Click the first dropdown item from subject autocomplete
    const subjectText = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		if (!app) return '❌ ucla-sa-soc-app not found';
		const root = app.shadowRoot;
		if (!root) return '❌ shadowRoot on app not found';
	  
		const wrapper = root.querySelector('#webComponentWrapper');
		const layout = wrapper?.querySelector('#layoutContentArea');
		const basicSearch = layout?.querySelector('#basic-search');
		const socSearch = basicSearch?.querySelector('#soc-search');
		const partial = socSearch?.querySelector('#partial_content');
		const subjectArea = partial?.querySelector('#div_subjectArea');
		const subjectDiv = subjectArea?.querySelector('#div_subject');
		const autocomplete = subjectDiv?.querySelector('#select_filter_subject');
		const autocompleteShadow = autocomplete?.shadowRoot;
		if (!autocompleteShadow) return '❌ shadowRoot on autocomplete not found';
	  
		const list = autocompleteShadow.querySelector('#dropdownitems');
		if (!list) return '❌ #dropdownitems not found';
	  
		const firstItem = list.querySelector('#option-0');
		if (!firstItem) return '❌ #option-0 not found';
	  
		const text = firstItem.innerText;
		firstItem.click();
		return text;
	  `);

    if (subjectText.startsWith("❌")) {
      throw new Error(subjectText); // bubble up early failure
    }

    console.log(`✅ Selected subject: "${subjectText}"`);

    const goClicked = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		const root = app?.shadowRoot;
		const wrapper = root?.querySelector('#webComponentWrapper');
		const layout = wrapper?.querySelector('#layoutContentArea');
		const basicSearch = layout?.querySelector('#basic-search');
		const socSearch = basicSearch?.querySelector('#soc-search');
		const goButton = socSearch?.querySelector('#btn_go');
		if (!goButton) return '❌ Go button not found';
	  
		goButton.click();
		return '✅ Go button clicked';
	  `);
    console.log(goClicked);

    await driver.wait(async () => {
      return await driver.executeScript(`
		  const app = document.querySelector('ucla-sa-soc-app');
		  const root = app?.shadowRoot;
		  return !!root?.querySelector('#resultsTitle');
		`);
    }, 10000); // 10s max wait

    // Step 1: Click Expand All
    await driver.executeScript(`
	const app = document.querySelector('ucla-sa-soc-app');
	const root = app?.shadowRoot;
	const expandBtn = root?.querySelector("#expandAll");
	if (expandBtn) expandBtn.click();
  `);

    // ✅ Step 2: Wait for course rows to load
    await driver.wait(async () => {
      return await driver.executeScript(`
	  const app = document.querySelector('ucla-sa-soc-app');
	  const root = app?.shadowRoot;
	  return !!root?.querySelector('.row-fluid.data_row.primary-row.class-info.class-not-checked');
	`);
    }, 10000); // wait up to 10s

    const courseDetails = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		const root = app?.shadowRoot;
		const courseDivs = root?.querySelectorAll('.row-fluid.data_row.primary-row.class-info.class-not-checked');
		if (!courseDivs || courseDivs.length === 0) return '❌ No course rows found';
	  
		return Array.from(courseDivs).map(courseDiv => {
		  const fullId = courseDiv.id || '';
		  const courseCode = fullId.split('_')[1] || '(No course code)';
	  
		  // Get day
		  const dayDiv = document.getElementById(fullId + '-days_data');
		  const dayBtn = dayDiv?.querySelector('button');
		  const dayText = dayBtn?.getAttribute('data-content') || '(No day)';
	  
		  // Get time
		  const timeDiv = document.getElementById(fullId + '-time_data');
		  const timeP = timeDiv?.querySelector('p');
		  const timeText = timeP ? timeP.innerText.replace(/\\s+/g, ' ').trim() : '(No time)';
	  
		  return { courseCode, day: dayText, time: timeText };
		});
	  `);

    if (typeof courseDetails === "string" && courseDetails.startsWith("❌")) {
      console.error("Browser context error:", courseDetails);
    } else {
      console.log("📅 Course Schedule:");
      courseDetails.forEach(({ courseCode, day, time }) => {
        console.log(`${courseCode}: ${day} @ ${time}`);
      });
    }
  } catch (err) {
    console.error("❌ Error interacting with shadow DOM:", err);
  } finally {
    await driver.quit();
  }
})();
