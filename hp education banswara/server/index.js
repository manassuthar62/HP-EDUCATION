const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hpeducation918_db_user:admin123@cluster0.q3ouir9.mongodb.net/hp_education?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB: ' + MONGODB_URI.split('@')[1]);
    
    // Auto-update live admin email
    try {
      const User = require('./models/User');
      const admin = await User.findOne({ username: 'admin' });
      if (admin) {
        admin.email = 'hpeducation918@gmail.com'; // HP Education primary email
        await admin.save();
        console.log('✅ Admin Email set to hpeducation918@gmail.com');
      }
    } catch (e) {
      console.error('Error auto-updating admin:', e);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to check DB connection
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is connecting, please try again in a moment.' });
  }
  next();
});

// Register Models
require('./models/User');
require('./models/Student');
require('./models/Academic');
require('./models/Transaction');

const studentRoutes = require('./routes/studentRoutes');
const academicRoutes = require('./routes/academicRoutes');
const feeRoutes = require('./routes/feeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');

app.get('/api/test', (req, res) => res.json({ message: 'Backend is working!' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
