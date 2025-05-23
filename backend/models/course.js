import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
  day: { type: String, required: true },
  instructor: { type: String, required: true },
  section: { type: String, required: true },
  time: { type: String, required: true }
});

const FinalExamSchema = new mongoose.Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  note: { type: String, required: true },
  time: { type: String, required: true }
});

const CourseSchema = new mongoose.Schema({
  course: { type: String, required: true },
  day: { type: String, required: true },
  discussions: [DiscussionSchema],   // array of discussion subdocuments
  instructor: { type: String, required: true },
  section: { type: String, required: true },
  sectionLink: { type: String, required: true },
  time: { type: String, required: true },
  finalExam: FinalExamSchema         // single final exam subdocument
});

const Course = mongoose.model('Course', CourseSchema);

export default Course;
