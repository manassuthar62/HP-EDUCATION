const express = require('express');
const router = express.Router();
const { Course, Batch } = require('../models/Academic');

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

module.exports = router;
