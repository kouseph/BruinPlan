import scrapeSubject from "./scrapeSubject.js";

(async function runAllSubjects() {
  const allCourses = [];
  for (let i = 0; i <= 187; i++) {
    const curr = await scrapeSubject(i);
    console.log(curr);
    allCourses.push(...curr);
  }
})();
