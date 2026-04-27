const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  alternateContact: { type: String },
  email: String,
  address: String,
  fatherName: String,
  enrollmentDate: { type: Date, default: Date.now },
  courses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    totalFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalFee: { type: Number, required: true },
    paymentPlan: { type: String, enum: ['One-Shot', 'Installments'], default: 'Installments' },
    installmentsCount: { type: Number, default: 1 },
    nextDueDate: Date,
    status: { type: String, enum: ['Active', 'Completed', 'Dropped'], default: 'Active' }
  }],
  status: { type: String, enum: ['Active', 'Completed', 'Dropped'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
