const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const { Batch } = require('../models/Academic');

router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalBatches = await Batch.countDocuments({ active: true });
    
    const students = await Student.find();
    const studentIds = students.map(s => s._id.toString());
    
    const transactions = await Transaction.find();
    // Only count transactions for existing students
    const validTransactions = transactions.filter(t => studentIds.includes(t.studentId.toString()));
    
    const totalCollection = validTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate Today's Collection
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayTransactions = validTransactions.filter(t => {
      const d = new Date(t.paymentDate);
      return d >= todayStart && d <= todayEnd;
    });
    const totalCollectionToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate This Month's Collection
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthTransactions = validTransactions.filter(t => {
      const d = new Date(t.paymentDate);
      return d >= monthStart;
    });
    const totalCollectionMonth = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate pending fees
    let totalExpected = 0;
    students.forEach(s => {
      s.courses.forEach(c => {
        totalExpected += (c.finalFee || 0);
      });
    });
    const pendingFees = totalExpected - totalCollection;

    // Find students with due dates in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const upcomingStudents = await Student.find({
      'courses.nextDueDate': { $lte: twoDaysFromNow, $gte: new Date() }
    }).populate('courses.courseId').lean();

    const upcomingFees = await Promise.all(upcomingStudents.map(async (s) => {
      const course = s.courses && s.courses[0];
      if (!course) return null;

      // Calculate total paid from transactions
      const studentTransactions = await Transaction.find({ studentId: s._id });
      const totalPaid = studentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const balance = course.finalFee - totalPaid;
      
      // Calculate next EMI
      const nextEmi = course.paymentPlan === 'Installments' 
        ? Math.ceil(balance / (course.installmentsCount || 1)) 
        : balance;

      return {
        _id: s._id,
        name: s.name,
        contact: s.contact,
        courseName: course.courseId?.name || course.courseName,
        nextEmi: nextEmi,
        balance: balance,
        dueDate: course.nextDueDate
      };
    }));

    const allRecentTransactions = await Transaction.find()
      .populate('studentId', 'name')
      .populate('courseId', 'name')
      .sort({ paymentDate: -1 });

    const recentTransactions = allRecentTransactions
      .filter(tx => tx.studentId !== null)
      .slice(0, 5);

    // Calculate Monthly Collection for Chart (Last 6 Months)
    const monthlyCollection = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      
      const monthlyTxs = validTransactions.filter(t => {
        const pDate = new Date(t.paymentDate);
        return pDate >= start && pDate <= end;
      });
      
      monthlyCollection.push({
        name: monthNames[m],
        collected: monthlyTxs.reduce((sum, t) => sum + t.amount, 0)
      });
    }

    res.json({
      totalStudents,
      totalBatches,
      totalCollection,
      totalCollectionToday,
      totalCollectionMonth,
      pendingFees,
      recentTransactions,
      monthlyCollection,
      upcomingFees: upcomingFees.filter(f => f !== null)
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ message: err.message, upcomingFees: [], recentTransactions: [] });
  }
});

module.exports = router;
