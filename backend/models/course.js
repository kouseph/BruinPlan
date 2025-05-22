import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: String, 
});

export default mongoose.model('course', courseSchema);