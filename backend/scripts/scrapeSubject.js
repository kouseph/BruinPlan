// scrapeSubject.js
import { Builder, By, until } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";

export default async function scrapeSubject(optionIndex = 0) {
  const service = new ServiceBuilder(chromedriver.path);
  const options = new Options();
  

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  try {
    await driver.get("https://sa.ucla.edu/ro/public/soc");
    await driver.wait(until.titleContains("Schedule of Classes"), 30000);

    await driver.executeScript(() => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app?.shadowRoot;
      const select = root.querySelector("#optSelectTerm");
      select.value = "25S";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await driver.wait(async () => {
      return await driver.executeScript(() => {
        const root = document.querySelector("ucla-sa-soc-app")?.shadowRoot;
        return !!root?.querySelector("#select_filter_subject");
      });
    }, 10000);

    await driver.executeScript(() => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app.shadowRoot;
      const autocomplete = root.querySelector("#select_filter_subject");
      const autocompleteShadow = autocomplete.shadowRoot;
      const input = autocompleteShadow.querySelector("input");
      input.click();
    });

    await driver.wait(async () => {
      return await driver.executeScript(() => {
        const root = document.querySelector("ucla-sa-soc-app")?.shadowRoot;
        const shadow = root?.querySelector(
          "#select_filter_subject"
        )?.shadowRoot;
        return !!shadow
          ?.querySelector("#dropdownitems")
          ?.querySelector("#option-0");
      });
    }, 10000);

    const subjectText = await driver.executeScript((index) => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app.shadowRoot;
      const autocomplete = root.querySelector("#select_filter_subject");
      const autocompleteShadow = autocomplete?.shadowRoot;
      const list = autocompleteShadow.querySelector("#dropdownitems");
      const item = list.querySelector(`#option-${index}`);
      const text = item?.innerText || "(Invalid Option)";
      item?.click();
      return text;
    }, optionIndex);

    console.log(`selected subject: "${subjectText}"`);

    await driver.executeScript(() => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app?.shadowRoot;
      const goButton = root.querySelector("#btn_go");
      goButton.click();
    });

    await driver.wait(async () => {
      return await driver.executeScript(() => {
        const app = document.querySelector("ucla-sa-soc-app");
        const root = app?.shadowRoot;
        return !!root?.querySelector("#resultsTitle");
      });
    }, 10000);

    await driver.executeScript(() => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app?.shadowRoot;
      const expandBtn = root?.querySelector("#expandAll");
      if (expandBtn) expandBtn.click();
    });

    await driver.wait(async () => {
      let previousCount = 0;
      for (let i = 0; i < 10; i++) {
        const count = await driver.executeScript(() => {
          const root = document.querySelector("ucla-sa-soc-app")?.shadowRoot;
          const rows = root?.querySelectorAll(
            ".row-fluid.data_row.primary-row.class-info"
          );
          return rows?.length || 0;
        });
        if (count === previousCount && count > 0) return true;
        previousCount = count;
        await new Promise((res) => setTimeout(res, 500));
      }
      return false;
    }, 10000);

    const results = await driver.executeScript(() => {
      const app = document.querySelector("ucla-sa-soc-app");
      const root = app?.shadowRoot;
      const allRows = root.querySelectorAll(
        ".row-fluid.data_row.primary-row.class-info"
      );

      return Array.from(allRows).map((row) => {
        const rowId = row.id || "";
        const courseCode = rowId.split("_")[1] || "(No course code)";

        const childrenId = `${rowId.split("_")[0]}_${courseCode}-children`;
        const childrenDiv = root.querySelector("#" + CSS.escape(childrenId));
        const disRows =
          childrenDiv?.querySelectorAll(
            ".row-fluid.data_row.secondary-row.class-info"
          ) || [];

        let parent = row.parentElement;
        let course = "(No course title)";

        while (parent) {
          const head = parent.querySelector("h3.head");
          if (head) {
            const button = head.querySelector("button.linkLikeButton");
            if (button) course = button.innerText.trim();
            break;
          }
          parent = parent.parentElement;
        }

        const timeColumn = row.querySelector(".timeColumn");
        let day = "(No day)";
        let time = "(No time)";
        if (timeColumn) {
          const dayBtn = timeColumn.querySelector("button");
          day = dayBtn?.getAttribute("data-content") || "(No day)";
          const timeParagraphs = timeColumn.querySelectorAll("p");
          time =
            timeParagraphs?.[1]?.innerText.replace(/\s+/g, " ").trim() ||
            "(No time)";
        }

        const sectionAnchor = row.querySelector(".sectionColumn a");
        const section = sectionAnchor?.innerText.trim() || "(No section)";
        const sectionLink =
          sectionAnchor?.href || sectionAnchor?.getAttribute("href") || "";

        const instructorColumn = row.querySelector(".instructorColumn p");
        const instructor =
          instructorColumn?.innerText.trim() || "(No instructor)";

        const discussions = Array.from(disRows).map((dRow) => {
          const dTimeColumn = dRow.querySelector(".timeColumn");
          let dDay = "(No day)";
          let dTime = "(No time)";
          if (dTimeColumn) {
            const dDayBtn = dTimeColumn.querySelector("button");
            dDay = dDayBtn?.getAttribute("data-content") || "(No day)";
            const dTimeParagraphs = dTimeColumn.querySelectorAll("p");
            dTime =
              dTimeParagraphs?.[1]?.innerText.replace(/\s+/g, " ").trim() ||
              "(No time)";
          }

          const dSectionAnchor = dRow.querySelector(".sectionColumn a");
          const dSection = dSectionAnchor?.innerText.trim() || "(No section)";

          const dInstructorColumn = dRow.querySelector(".instructorColumn p");
          const dInstructor =
            dInstructorColumn?.innerText.trim() || "(No instructor)";

          return {
            section: dSection,
            day: dDay,
            time: dTime,
            instructor: dInstructor,
          };
        });

        return {
          course,
          section,
          day,
          time,
          instructor,
          sectionLink,
          discussions,
        };
      });
    });

    async function extractFinalExamInfo(driver) {
      try {
        return await driver.executeScript(() => {
          const app = document.querySelector("ucla-sa-soc-app");
          const root = app?.shadowRoot;
          const finalExamDiv = root?.querySelector("#final_exam_info");
          if (!finalExamDiv) return null;
          const tds = finalExamDiv.querySelectorAll("td");
          if (tds.length < 4) return null;
          return {
            date: tds[0].innerText.trim(),
            day: tds[1].innerText.trim(),
            time: tds[2].innerText.trim(),
            note: tds[3].innerText.trim(),
          };
        });
      } catch (err) {
        console.warn("⚠️ Error extracting final exam info:", err);
        return null;
      }
    }

    async function enrichCoursesWithFinals(driver, courses) {
      const enriched = [];
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const sectionLink = course.sectionLink;
        await driver.get(
          sectionLink.startsWith("http")
            ? sectionLink
            : `https://sa.ucla.edu${sectionLink}`
        );
        await driver.sleep(1000);
        const finalExam = await extractFinalExamInfo(driver);
        enriched.push({ ...course, finalExam });
      }
      return enriched;
    }

    const finalCourses = await enrichCoursesWithFinals(driver, results);
    return finalCourses;
  } catch (err) {
    console.error(err);
  } finally {
    await driver.quit();
  }
}
