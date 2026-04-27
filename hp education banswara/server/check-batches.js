const mongoose = require('mongoose');
const { Course, Batch } = require('./models/Academic');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Database Check ---');
    
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses.`);
    
    const batches = await Batch.find();
    console.log(`Found ${batches.length} batches total.`);
    
    batches.forEach(b => {
      console.log(`- Batch: ${b.name}, CourseId: ${b.courseId}, Time: ${b.time}`);
    });

    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
