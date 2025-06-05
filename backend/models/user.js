import mongoose from 'mongoose';

// Define the schema for a single schedule item
const scheduleItemSchema = new mongoose.Schema({
  day: { type: String, required: true },
  timeValid: { type: Boolean, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  type: { type: String, required: true },
  course: { type: String, required: true },
  section: String,  // Optional field
  timeStr: { type: String, required: true }
}, { _id: false });

// Define the main user schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  selectedCourses: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  schedules: {
    type: [[scheduleItemSchema]],
    default: [],
  }
});

// Ensure schedules and selectedCourses are always arrays
userSchema.pre('save', function(next) {
  if (!this.schedules) {
    this.schedules = [];
  }
  if (!this.selectedCourses) {
    this.selectedCourses = [];
  }
  next();
});

export default mongoose.model('User', userSchema);
