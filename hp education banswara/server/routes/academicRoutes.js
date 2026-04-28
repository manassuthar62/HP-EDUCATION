const express = require('express');
const router = express.Router();
const { Course, Batch } = require('../models/Academic');
const Student = require('../models/Student');

// Course Routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().lean();
    const coursesWithBatches = await Promise.all(courses.map(async (course) => {
      const batches = await Batch.find({ courseId: course._id }).lean();
      return { ...course, batches };
    }));
    res.json(coursesWithBatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    console.log(`[Academic API] Fetching course: ${req.params.id}`);
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log(`[Academic API] Course NOT FOUND: ${req.params.id}`);
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(`[Academic API] Error fetching course ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/courses', async (req, res) => {
  const course = new Course(req.body);
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any student is enrolled in this course
    const studentInCourse = await Student.findOne({ 'courses.courseId': id });
    if (studentInCourse) {
      return res.status(400).json({
        message: 'Cannot delete course: Students are still enrolled in this course. Please remove students first.'
      });
    }

    // Optionally check if batches exist
    const batchesExist = await Batch.findOne({ courseId: id });
    if (batchesExist) {
       return res.status(400).json({
         message: 'Cannot delete course: Batches are still linked to this course. Please delete batches first.'
       });
    }

    await Course.findByIdAndDelete(id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Batch Routes
router.get('/batches/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid Course ID' });
    }
    const batches = await Batch.find({ courseId: new mongoose.Types.ObjectId(courseId) });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find().populate('courseId');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/batches', async (req, res) => {
  const batch = new Batch(req.body);
  try {
    const newBatch = await batch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/batches/:id', async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any student is assigned to this batch
    const studentInBatch = await Student.findOne({ 'courses.batchId': id });
    if (studentInBatch) {
      return res.status(400).json({ 
        message: 'Cannot delete batch: Students are still assigned to this batch. Please transfer or delete students first.' 
      });
    }

    await Batch.findByIdAndDelete(id);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
