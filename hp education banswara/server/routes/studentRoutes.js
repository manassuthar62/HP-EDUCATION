const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { Course, Batch } = require('../models/Academic');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('courses.courseId courses.batchId').lean();
    res.json(students || []);
  } catch (err) {
    console.error('Student Fetch Error:', err);
    res.status(200).json([]);
  }
});

// Get single student - Place this carefully
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('courses.courseId')
      .populate('courses.batchId')
      .lean();
      
    if (!student) {
      console.log('Student not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error('Fetch Student ID Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create student
router.post('/', async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const Transaction = require('../models/Transaction');

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    // 1. Delete student
    await Student.findByIdAndDelete(studentId);
    // 2. Delete all their transactions
    const result = await Transaction.deleteMany({ studentId: studentId });
    console.log(`[Delete] Student ${studentId} and ${result.deletedCount} transactions removed.`);
    
    res.json({ message: 'Student and associated transactions deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
