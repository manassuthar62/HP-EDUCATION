const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: String, // e.g., "6 Months"
  baseFee: { type: Number, required: true }
}, { timestamps: true });

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  time: String, // e.g., "8:00 AM - 10:00 AM"
  faculty: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
const Batch = mongoose.model('Batch', batchSchema);

module.exports = { Course, Batch };
