const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  receiptId: { type: String, unique: true, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'], default: 'Cash' },
  installmentNumber: Number,
  utrNumber: String,
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
