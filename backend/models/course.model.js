import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  // Add your course fields here based on your data structure
  // This is a basic example - adjust according to your needs
  name: String,
  description: String,
  // Add other fields as needed
}, {
  // This allows the schema to accept any fields, even if not defined above
  strict: false
});

const Course = mongoose.model('Course', courseSchema);

export default Course; 