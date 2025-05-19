// models/User.js
import mongoose from 'mongoose';

const PlannedScheduleItemSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    discussionSectionId: { type: mongoose.Schema.Types.ObjectId },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    googleId: { type: String, unique: true, sparse: true, index: true }, // Unique ID from Google
    image: { type: String }, // URL for profile picture from Google
    plannedSchedule: [PlannedScheduleItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
