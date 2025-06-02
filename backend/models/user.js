import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  schedules: [
    {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }],
      default: []
    }
  ]
});

// A pre-save hook to ensure uniqueness within each individual schedule (i.e. a set of courses)
// !!NOTE!! Only ensures uniqueness in courses w/i one schedule, not uniqueness of schedules
userSchema.pre('save', function(next) {
    if (this.isModified('schedules')) {
        this.schedules = this.schedules.map(scheduleCourses => {
            if (!Array.isArray(scheduleCourses)) {
                return []; // for safety
            }
            // Ensure uniqueness w/i this specific schedule
            const uniqueCourseIdsInSchedule = [];
            const seenIds = new Set();
            for (const courseId of scheduleCourses) {
                if (courseId && !seenIds.has(courseId.toString())) {
                    seenIds.add(courseId.toString());
                    uniqueCourseIdsInSchedule.push(courseId);
                }
            }
            // Sort ObjectIds for consistent storage
            uniqueCourseIdsInSchedule.sort(); // Note: different from string sort.
            return uniqueCourseIdsInSchedule;
        });
    }
    next();
});

export default mongoose.model('user', userSchema);
