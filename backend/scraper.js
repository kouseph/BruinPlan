import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const options = new chrome.Options();
options.addArguments("--headless=new"); // Optional: remove for visible browser

const service = new chrome.ServiceBuilder("/usr/local/bin/chromedriver");

(async function run() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  try {
    // navigating to page
    await driver.get("https://sa.ucla.edu/ro/public/soc");
    await driver.wait(until.titleContains("Schedule of Classes"), 30000);

    // select term spring 2025
    await driver.executeScript(`
      const app = document.querySelector('ucla-sa-soc-app');
      const root = app?.shadowRoot;
      const select = root.querySelector('#optSelectTerm');
      select.value = '25S';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    `);

    // wait for subject dropdown
    await driver.wait(async () => {
      return await driver.executeScript(`
        const root = document.querySelector('ucla-sa-soc-app')?.shadowRoot;
        return !!root?.querySelector('#select_filter_subject');
      `);
    }, 10000);

    // click subject dropdown menu
    await driver.executeScript(`
      const app = document.querySelector('ucla-sa-soc-app');
      const root = app.shadowRoot;
      const autocomplete = root.querySelector('#select_filter_subject');
      const autocompleteShadow = autocomplete.shadowRoot;
      const input = autocompleteShadow.querySelector('input');
      input.click();
    `);

    // wait for the subject dropdown to populate
    await driver.wait(async () => {
      return await driver.executeScript(`
        const root = document.querySelector('ucla-sa-soc-app')?.shadowRoot;
        const shadow = root?.querySelector('#select_filter_subject')?.shadowRoot;
        return !!shadow?.querySelector('#dropdownitems')?.querySelector('#option-0');
      `);
    }, 10000);

    // select subject
    const subjectText = await driver.executeScript(`
      const app = document.querySelector('ucla-sa-soc-app');
      const root = app.shadowRoot;
      const autocomplete = root.querySelector('#select_filter_subject');
      const autocompleteShadow = autocomplete?.shadowRoot;
      const list = autocompleteShadow.querySelector('#dropdownitems');
      const firstItem = list.querySelector('#option-1');
      const text = firstItem.innerText;
      firstItem.click();
      return text;
    `);
    console.log(`selected subject: "${subjectText}"`);

    // click go for selected subject
    await driver.executeScript(`
      const app = document.querySelector('ucla-sa-soc-app');
      const root = app?.shadowRoot;
      const goButton = root.querySelector('#btn_go');	  
      goButton.click();
    `);

    // wait for subject page to load
    await driver.wait(async () => {
      return await driver.executeScript(`
        const app = document.querySelector('ucla-sa-soc-app');
        const root = app?.shadowRoot;
        return !!root?.querySelector('#resultsTitle');
      `);
    }, 10000);

    // expand all courses
    await driver.executeScript(`
      const app = document.querySelector('ucla-sa-soc-app');
      const root = app?.shadowRoot;
      const expandBtn = root?.querySelector("#expandAll");
      if (expandBtn) expandBtn.click();
    `);

    // wait until all courses expanded
    await driver.wait(async () => {
      let previousCount = 0;

      for (let i = 0; i < 10; i++) {
        const count = await driver.executeScript(`
			const root = document.querySelector('ucla-sa-soc-app')?.shadowRoot;
			const rows = root?.querySelectorAll('.row-fluid.data_row.primary-row.class-info');
			return rows?.length || 0;
		  `);

        if (count === previousCount && count > 0) {
          return true;
        }

        previousCount = count;
        await new Promise((res) => setTimeout(res, 500));
      }

      return false;
    }, 10000);

    // get info for each course
    const results = await driver.executeScript(`
		const app = document.querySelector('ucla-sa-soc-app');
		const root = app?.shadowRoot;
		const allRows = root.querySelectorAll('.row-fluid.data_row.primary-row.class-info');
	  
		return Array.from(allRows).map(row => {
			const rowId = row.id || '';
		  	const courseCode = rowId.split('_')[1] || '(No course code)';

			const childrenId = \`\${rowId.split('_')[0]}_\${courseCode}-children\`;
			const childrenDiv = root.querySelector('#' + CSS.escape(childrenId));
			const disRows = childrenDiv?.querySelectorAll('.row-fluid.data_row.secondary-row.class-info') || [];
			const hasDiscussions = disRows.length > 0;
	  
		  let parent = row.parentElement;
		  let courseName = '(No course title)';
		  
		  while (parent) {
			const head = parent.querySelector('h3.head');
			if (head) {
			  const button = head.querySelector('button.linkLikeButton');
			  if (button) {
				courseName = button.innerText.trim();
			  }
			  break;
			}
			parent = parent.paren