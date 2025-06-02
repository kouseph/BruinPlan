import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  schedules: [ // Array of schedules. Index 0 is highest preference.
    {
      // A schedule is an array of objects, each representing a course/disc. combo.
      type: [{
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        },
        discussion: { // Array index# of selected discussion
          // from Course's 'discussions' array.
          // -1 means no discussion selected.
          type: Number,
          required: true,
          default: -1     // Default to -1
        }
      }],
      default: []
    }
  ]
});

// Pre-save hook to ensure uniqueness of *courses* within each individual schedule.
// A course should appear at most once per schedule. The discussion index is associated.
userSchemaInstance.pre('save', function(next) {
    if (this.isModified('schedules')) {
        this.schedules = this.schedules.map(scheduleItems => {
            if (!Array.isArray(scheduleItems)) {
                return [];
            }
            const uniqueScheduledCourseItems = [];
            const seenCourseIds = new Set(); // Tracks course ObjectIds to ensure uniqueness per schedule

            for (const item of scheduleItems) {
                // Ensure item is an object and has a 'course' property that's an ObjectId
                if (item && typeof item === 'object' && item.course && mongoose.Types.ObjectId.isValid(item.course)) {
                    const courseIdString = item.course.toString();

                    // Uniqueness check is ONLY based on courseId
                    if (!seenCourseIds.has(courseIdString)) {
                        seenCourseIds.add(courseIdString);

                        // Handle the discussion index
                        let discussionIndex = -1; // Default to "no discussion selected"
                        if (item.discussion !== undefined && typeof item.discussion === 'number') {
                            // Ensure it's an integer; could also add validation item.discussion >= -1
                            discussionIndex = Math.floor(item.discussion);
                        }
                        // If item.discussion is null, undefined, or not a number, it defaults to -1
                        // as per the check above or the schema default if not provided.

                        uniqueScheduledCourseItems.push({
                            course: item.course,
                            discussion: discussionIndex
                        });
                    }
                    // If courseId is already seen, this item (even with a different discussion index)
                    // is skipped for this particular schedule, enforcing one entry per course.
                }
            }
            return uniqueScheduledCourseItems;
        });
    }
    next();
});

export default mongoose.model('user', userSchema);
