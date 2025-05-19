// models/Class.js
import mongoose from 'mongoose';

const ScheduleEntrySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
  },
  { _id: false }
);

const DiscussionSectionSchema = new mongoose.Schema(
  {
    discussionNumber: { type: String, required: true },
    schedule: [ScheduleEntrySchema],
  },
  { _id: true }
);

const SectionSchema = new mongoose.Schema(
  {
    sectionNumber: { type: String, required: true },
    professorName: { type: String, required: true },
    finalExam: {
      date: { type: Date },
      time: { type: String },
      location: { type: String },
    },
    schedule: [ScheduleEntrySchema],
    discussionSections: [DiscussionSectionSchema],
  },
  { _id: true }
);

const ClassSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, index: true },
    courseTitle: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String },
    credits: { type: Number, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
