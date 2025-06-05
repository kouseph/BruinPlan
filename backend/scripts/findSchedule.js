function parseTimeRange(timeStr) {
  if (!timeStr || !timeStr.includes("-")) return null;

  function toFloatTime(str) {
    const [time, meridian] = str.trim().split(/(am|pm)/i);
    let [hour, min = 0] = time.split(":").map(Number);
    if (meridian.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (meridian.toLowerCase() === "am" && hour === 12) hour = 0;
    return hour + min / 60;
  }

  try {
    const [startStr, endStr] = timeStr.split("-");
    return [toFloatTime(startStr), toFloatTime(endStr)];
  } catch {
    return null;
  }
}

function hasConflict(a, b) {
  if (!a.timeValid || !b.timeValid) return false;
  
  // Split multiple days like "Tuesday, Thursday"
  const aDays = a.day.split(",").map((d) => d.trim());
  const bDays = b.day.split(",").map((d) => d.trim());
  
  // Check if any days overlap
  const hasCommonDay = aDays.some(dayA => bDays.includes(dayA));
  
  // If they share a common day, check for time overlap
  return hasCommonDay && !(a.end <= b.start || b.end <= a.start);
}

function finalExamConflict(exams) {
  const finals = exams.filter((f) => f.timeValid);
  for (let i = 0; i < finals.length; i++) {
    for (let j = i + 1; j < finals.length; j++) {
      if (
        finals[i].day === finals[j].day &&
        !(finals[i].end <= finals[j].start || finals[j].end <= finals[i].start)
      ) {
        return true;
      }
    }
  }
  return false;
}

function generateAllSchedules(courses) {
  function backtrack(i, currentSchedule, currentFinals) {
    if (i === courses.length)
      return [{ schedule: currentSchedule, finals: currentFinals }];

    const course = courses[i];
    const lectureRange = parseTimeRange(course.time);
    const timeValid = !!lectureRange && !!course.day;

    const lectureEvent = {
      day: timeValid ? course.day : "---",
      timeValid,
      start: timeValid ? lectureRange[0] : null,
      end: timeValid ? lectureRange[1] : null,
      type: "lecture",
      course: course.course,
      timeStr: timeValid ? course.time : "---",
    };

    // Handle final exam
    const examTimeRange = parseTimeRange(course.finalExam?.time);
    const examValid =
      !!examTimeRange &&
      course.finalExam?.day &&
      course.finalExam.day !== "---";

    const finalExamEvent = {
      day: examValid ? course.finalExam.day : "---",
      timeValid: examValid,
      start: examValid ? examTimeRange[0] : null,
      end: examValid ? examTimeRange[1] : null,
      type: "final",
      course: course.course,
      timeStr: examValid ? course.finalExam.time : "---",
    };

    const results = [];
    const discussionOptions =
      course.discussions?.length > 0 ? course.discussions : [null];

    for (const discussion of discussionOptions) {
      const schedCopy = [...currentSchedule, lectureEvent];
      const finalsCopy = [...currentFinals, finalExamEvent];

      if (discussion) {
        const disRange = parseTimeRange(discussion.time);
        const disValid = !!disRange && !!discussion.day;
        schedCopy.push({
          day: disValid ? discussion.day : "---",
          timeValid: disValid,
          start: disValid ? disRange[0] : null,
          end: disValid ? disRange[1] : null,
          type: "discussion",
          course: course.course,
          section: discussion.section,
          timeStr: disValid ? discussion.time : "---",
        });
      }

      results.push(...backtrack(i + 1, schedCopy, finalsCopy));
    }

    return results;
  }

  return backtrack(0, [], []);
}

function isValidSchedule(scheduleObj) {
  const { schedule, finals } = scheduleObj;

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      if (hasConflict(schedule[i], schedule[j])) return false;
    }
  }

  if (finalExamConflict(finals)) return false;

  return true;
}

function findValidSchedule(courses) {
  const allSchedules = generateAllSchedules(courses);

  for (const sched of allSchedules) {
    if (isValidSchedule(sched)) return sched.schedule;
  }

  return "No valid schedule: lectures, discussions, or final exams conflict.";
}

function calculateTotalGap(schedule) {
  const dayGroups = {};

  for (const item of schedule) {
    if (!item.timeValid || item.day === "---") continue;

    // Split multiple days like "Tuesday, Thursday"
    const days = item.day.split(",").map((d) => d.trim());

    for (const day of days) {
      if (!dayGroups[day]) dayGroups[day] = [];
      dayGroups[day].push({ ...item, day }); // keep a copy for each day
    }
  }

  let totalGap = 0;

  for (const day in dayGroups) {
    const events = dayGroups[day].sort((a, b) => a.start - b.start);
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].start - events[i - 1].end;
      if (gap > 0) totalGap += gap;
    }
  }

  return totalGap;
}

function findOptimizedSchedule(courses) {
  const allSchedules = generateAllSchedules(courses).filter(isValidSchedule);

  if (allSchedules.length === 0) {
    return "No valid schedule: lectures, discussions, or final exams conflict.";
  }

  let best = allSchedules[0];
  let minGap = calculateTotalGap(best.schedule);

  for (const sched of allSchedules.slice(1)) {
    const gap = calculateTotalGap(sched.schedule);
    if (gap < minGap) {
      best = sched;
      minGap = gap;
    }
  }

  return best.schedule;
}

function prettyPrint(schedule) {
  if (typeof schedule === "string") {
    console.log(schedule);
    return;
  }

  // Group by course for lecture, discussion, and final exam info
  const grouped = {};

  for (const item of schedule) {
    if (!grouped[item.course]) {
      grouped[item.course] = { course: item.course };
    }

    if (item.type === "lecture") {
      grouped[item.course].lecture = item;
    } else if (item.type === "discussion") {
      grouped[item.course].discussion = item;
    }
  }

  for (const courseName in grouped) {
    const { lecture, discussion } = grouped[courseName];

    console.log(`📚 ${courseName}`);
    if (lecture) {
      console.log(`   📘 Lecture`);
      console.log(`     Day: ${lecture.day}`);
      console.log(`     Time: ${lecture.timeStr}`);
    }

    if (discussion) {
      console.log(`   🗣️ Discussion`);
      console.log(`     Section: ${discussion.section}`);
      console.log(`     Day: ${discussion.day}`);
      console.log(`     Time: ${discussion.timeStr}`);
    }

    // Find final exam event from original course list
    const courseObj = courses.find((c) => c.course === courseName);
    const exam = courseObj?.finalExam || {};
    const finalDay = exam.day && exam.day !== "---" ? exam.day : "---";
    const finalTime = exam.time && exam.time.includes("-") ? exam.time : "---";
    const finalDate =
      exam.date && exam.date !== "None listed" ? exam.date : "---";

    console.log(`   📝 Final Exam`);
    console.log(`     Date: ${finalDate}`);
    console.log(`     Day: ${finalDay}`);
    console.log(`     Time: ${finalTime}`);
    console.log("");
  }
}

function findAllOptimizedSchedules(courses) {
  const allSchedules = generateAllSchedules(courses);
  const validSchedules = allSchedules.filter(isValidSchedule);

  if (validSchedules.length === 0) {
    return []; // or return a message if you prefer
  }

  validSchedules.sort((a, b) => {
    return calculateTotalGap(a.schedule) - calculateTotalGap(b.schedule);
  });

  return validSchedules.map((sched) => sched.schedule);
}

const courses = [
  {
    "_id": "682fb71d516c94b923ccb331",
    "course": "35L - Software Construction",
    "day": "Tuesday, Thursday",
    "discussions": [
      {
        "day": "Friday",
        "instructor": "Elamri, O.",
        "section": "Dis 1A",
        "time": "10am-11:50am",
        "_id": "682fb71d516c94b923ccb332"
      },
      {
        "day": "Friday",
        "instructor": "Wan, E.",
        "section": "Dis 1B",
        "time": "10am-11:50am",
        "_id": "682fb71d516c94b923ccb333"
      },
      {
        "day": "Friday",
        "instructor": "Suresh, N.",
        "section": "Dis 1C",
        "time": "12pm-1:50pm",
        "_id": "682fb71d516c94b923ccb334"
      },
      {
        "day": "Friday",
        "instructor": "Ji, K.",
        "section": "Dis 1D",
        "time": "2pm-3:50pm",
        "_id": "682fb71d516c94b923ccb335"
      }
    ],
    "instructor": "Eggert, P.R.",
    "section": "Lec 1",
    "sectionLink": "https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?term_cd=25S&subj_area_cd=COM%20SCI&crs_catlg_no=0035L%20%20%20&class_id=187105200&class_no=%20001%20%20",
    "time": "4pm-5:50pm",
    "finalExam": {
      "date": "June 9, 2025",
      "day": "Monday",
      "note": "Check back on 05/26/2025 (Monday of 9th week) for final exam location",
      "time": "6:30pm-9:30pm",
      "_id": "682fb71d516c94b923ccb336"
    },
    "__v": 0
  },
    {
    "_id": "682fb71d516c94b923ccb32a",
    "course": "33 - Introduction to Computer Organization",
    "day": "Tuesday, Thursday",
    "discussions": [
      {
        "day": "Friday",
        "instructor": "Alandary, S.",
        "section": "Dis 1A",
        "time": "10am-11:50am",
        "_id": "682fb71d516c94b923ccb32b"
      },
      {
        "day": "Friday",
        "instructor": "Xu, Z.",
        "section": "Dis 1B",
        "time": "10am-11:50am",
        "_id": "682fb71d516c94b923ccb32c"
      },
      {
        "day": "Friday",
        "instructor": "Tecot, L.",
        "section": "Dis 1C",
        "time": "12pm-1:50pm",
        "_id": "682fb71d516c94b923ccb32d"
      },
      {
        "day": "Friday",
        "instructor": "Korb, A.L.",
        "section": "Dis 1D",
        "time": "12pm-1:50pm",
        "_id": "682fb71d516c94b923ccb32e"
      },
      {
        "day": "Friday",
        "instructor": "Kupsh, D.M.",
        "section": "Dis 1E",
        "time": "2pm-3:50pm",
        "_id": "682fb71d516c94b923ccb32f"
      }
    ],
    "instructor": "Batista, S.",
    "section": "Lec 1",
    "sectionLink": "https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?term_cd=25S&subj_area_cd=COM%20SCI&crs_catlg_no=0033%20%20%20%20&class_id=187101200&class_no=%20001%20%20",
    "time": "2pm-3:50pm",
    "finalExam": {
      "date": "June 11, 2025",
      "day": "Wednesday",
      "note": "Check back on 05/26/2025 (Monday of 9th week) for final exam location",
      "time": "11:30am-2:30pm",
      "_id": "682fb71d516c94b923ccb330"
    },
    "__v": 0
  },
  {
    "_id": "683d0b2955ef19713d263c18",
    "course": "120B - Sensation and Perception",
    "day": "Tuesday, Thursday",
    "discussions": [
      {
        "day": "Tuesday",
        "instructor": "Kamper, D.G.",
        "section": "Dis 1A",
        "time": "3pm-3:50pm",
        "_id": "683d0b2955ef19713d263c19"
      },
      {
        "day": "Tuesday",
        "instructor": "Kamper, D.G.",
        "section": "Dis 1B",
        "time": "4pm-4:50pm",
        "_id": "683d0b2955ef19713d263c1a"
      },
      {
        "day": "Wednesday",
        "instructor": "Zhao, Y.",
        "section": "Dis 1C",
        "time": "8am-8:50am",
        "_id": "683d0b2955ef19713d263c1b"
      },
      {
        "day": "Wednesday",
        "instructor": "Zhao, Y.",
        "section": "Dis 1D",
        "time": "9am-9:50am",
        "_id": "683d0b2955ef19713d263c1c"
      },
      {
        "day": "Thursday",
        "instructor": "Zhao, Y.",
        "section": "Dis 1E",
        "time": "3pm-3:50pm",
        "_id": "683d0b2955ef19713d263c1d"
      },
      {
        "day": "Thursday",
        "instructor": "Zhao, Y.",
        "section": "Dis 1F",
        "time": "4pm-4:50pm",
        "_id": "683d0b2955ef19713d263c1e"
      },
      {
        "day": "Friday",
        "instructor": "Moon, D.",
        "section": "Dis 1G",
        "time": "10am-10:50am",
        "_id": "683d0b2955ef19713d263c1f"
      },
      {
        "day": "Friday",
        "instructor": "Moon, D.",
        "section": "Dis 1H",
        "time": "11am-11:50am",
        "_id": "683d0b2955ef19713d263c20"
      }
    ],
    "instructor": "Shams, L.",
    "section": "Lec 1",
    "sectionLink": "https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?term_cd=25S&subj_area_cd=PSYCH%20%20&crs_catlg_no=0120B%20%20%20&class_id=328450200&class_no=%20001%20%20",
    "time": "8am-9:15am",
    "finalExam": {
      "date": "None listed",
      "day": "---",
      "note": "---",
      "time": "Consult instructor for method of evaluation",
      "_id": "683d0b2955ef19713d263c21"
    },
    "__v": 0
  },
];

const allValidSortedSchedules = findAllOptimizedSchedules(courses);

// To preview all of them nicely
if (allValidSortedSchedules.length === 0) {
  console.log(
    "❌ No valid schedule: lectures, discussions, or final exams conflict."
  );
} else {
  allValidSortedSchedules.forEach((schedule, idx) => {
    console.log(
      `\n🔢 Schedule #${idx + 1} (Total Gap: ${calculateTotalGap(
        schedule
      )} hrs):`
    );
    prettyPrint(schedule);
  });
}
