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
  timeStr: { type: String, required: true },
  instructor: String, // Optional field
  location: String,  // Optional field
  sectionLink: String // Optional field
}, { _id: false });

// Define the main user schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  accessToken: String,
  refreshToken: String,
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

// Add method to validate schedule format
userSchema.methods.validateSchedule = function(schedule) {
  if (!Array.isArray(schedule)) return false;
  
  return schedule.every(entry => {
    return entry.course && 
           entry.day && 
           entry.timeStr && 
           entry.type && 
           entry.timeValid !== undefined &&
           entry.start !== undefined &&
           entry.end !== undefined;
  });
};

const User = mongoose.model('User', userSchema);

export default User;
