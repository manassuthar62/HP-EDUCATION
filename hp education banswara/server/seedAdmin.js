const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      adminExists.email = 'hp9414401525@gmail.com';
      await adminExists.save();
      console.log('Admin already exists! Updated email.');
      process.exit();
    }

    const admin = new User({
      username: 'admin',
      email: 'hp9414401525@gmail.com',
      password: 'admin123', // Aap isse baad mein change kar sakte hain
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: hp9414401525@gmail.com');
    console.log('Password: admin123');
    process.exit();
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
