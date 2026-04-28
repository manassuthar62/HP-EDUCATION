import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateReceipt } from '../utils/receiptGenerator';
import API_URL from '../config';

const Fees = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState([]);
  const [view, setView] = useState('transactions'); // 'transactions' or 'dues'
  const [stats, setStats] = useState({ today: 0, month: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feesRes = await fetch(`${API_URL}/fees`);
        const feesData = await feesRes.json();
        const allPayments = Array.isArray(feesData) ? feesData : [];
        setPayments(allPayments);

        // Calculate Stats locally
        const now = new Date();
        const formatDateLocal = (date) => {
          if (!date) return "";
          const d = new Date(date);
          if (isNaN(d.getTime())) return "";
          return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        };
        const todayStr = formatDateLocal(now);

        const todayTotal = allPayments
          .filter(p => p.paymentDate && formatDateLocal(p.paymentDate) === todayStr)
          .reduce((sum, p) => sum + p.amount, 0);

        const monthTotal = allPayments
          .filter(p => {
            if (!p.paymentDate) return false;
            const d = new Date(p.paymentDate);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((sum, p) => sum + p.amount, 0);

        const studentsRes = await fetch(`${API_URL}/students`);
        const studentsData = await studentsRes.json();
        const allStudents = Array.isArray(studentsData) ? studentsData : [];

        // Filter students with pending balance
        const pendingDues = allStudents.filter(s => {
          const course = s.courses && s.courses[0];
          if (!course) return false;
          const studentPayments = allPayments.filter(p => (p.studentId?._id || p.studentId) === s._id);
          const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
          return (course.finalFee - totalPaid) > 0;
        }).map(s => {
          const course = s.courses[0];
          const studentPayments = allPayments.filter(p => (p.studentId?._id || p.studentId) === s._id);
          const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
          const balance = (course.finalFee || 0) - totalPaid;
          const emi = course.paymentPlan === 'Installments' ? Math.ceil(balance / (course.installmentsCount || 1)) : balance;
          return {
            ...s,
            balance,
            nextEmi: emi,
            dueDate: course.nextDueDate
          };
        });
        setDues(pendingDues);
        
        try {
          const statsRes = await fetch(`${API_URL}/dashboard/stats`);
          const statsData = await statsRes.json();
          setStats({
            today: todayTotal,
            month: monthTotal,
            pending: statsData.pendingFees || 0
          });
        } catch (e) {
          console.error("Dashboard stats error:", e);
          setStats(prev => ({ ...prev, today: todayTotal, month: monthTotal }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Fee Records...</div>;

  const handleDownload = async (p) => {
    try {
      // Fetch all payments for this student to show ledger in receipt
      const studentPaymentsRes = await fetch(`${API_URL}/fees/student/${p.studentId?._id}`);
      const studentPayments = await studentPaymentsRes.json();
      
      const studentDues = dues.find(d => d._id === p.studentId?._id);
      const studentInfo = studentDues || {};
      const studentCourse = p.studentId?.courses?.find(c => 
        (c.courseId?._id || c.courseId).toString() === (p.courseId?._id || p.courseId).toString()
      ) || {};

      generateReceipt({
        receiptId: p.receiptId,
        studentName: p.studentId?.name || 'N/A',
        studentContact: p.studentId?.contact || 'N/A',
        courseName: p.courseId?.name || 'N/A',
        batchName: studentCourse.batchName || 'N/A',
        totalFee: studentCourse.finalFee || 0,
        installmentsCount: studentCourse.installmentsCount || 1,
        amount: p.amount, // current payment
        allPayments: Array.isArray(studentPayments) ? studentPayments : [p],
        balance: studentInfo.balance || 0,
        nextDueDate: studentInfo.dueDate,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        utrNumber: p.utrNumber,
        remarks: p.remarks || `Payment via ${p.paymentMethod}`,
        installment: p.remarks
      });
    } catch (err) {
      console.error('Error fetching history for receipt:', err);
      // Fallback to basic receipt if fetch fails
      generateReceipt(p);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1>Fee Management</h1>
          <p style={{color: 'var(--text-muted)'}}>Manage receipts and track upcoming installments.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/record-payment')}
        >
          <Plus size={18} /> Record New Payment
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Collected Today</span>
          <span className="stat-value">₹{(stats.today || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">₹{(stats.month || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Outstanding</span>
          <span className="stat-value" style={{color: 'var(--error)'}}>₹{(stats.pending || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{padding: '0.5rem 1.5rem', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)'}}>
          <button 
            onClick={() => setView('transactions')}
            style={{padding: '1rem 0', background: 'none', border: 'none', borderBottom: view === 'transactions' ? '2px solid var(--accent)' : '2px solid transparent', color: view === 'transactions' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer'}}
          >
            Recent Transactions
          </button>
          <button 
            onClick={() => setView('dues')}
            style={{padding: '1rem 0', background: 'none', border: 'none', borderBottom: view === 'dues' ? '2px solid var(--accent)' : '2px solid transparent', color: view === 'dues' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer'}}
          >
            Pending Dues (Upcoming EMI)
          </button>
        </div>

        {view === 'transactions' ? (
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td style={{fontWeight: 600}}>{p.receiptId}</td>
                  <td>{p.studentId?.name || 'N/A'}</td>
                  <td>{p.courseId?.name || 'N/A'}</td>
                  <td style={{fontWeight: 600}}>₹{p.amount.toLocaleString()}</td>
                  <td>{(() => { const d = new Date(p.paymentDate); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })()}</td>
                  <td>
                    <span style={{backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem'}}>
                      {p.paymentMethod}
                    </span>
                    {p.utrNumber && <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px'}}>ID: {p.utrNumber}</div>}
                  </td>
                  <td>
                    <button onClick={() => handleDownload(p)} className="btn" style={{padding: '0.4rem', backgroundColor: 'var(--primary-light)', color: 'var(--accent)'}}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Next Due Date</th>
                <th>Next EMI (₹)</th>
                <th>Remaining Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dues.map(d => (
                <tr key={d._id}>
                  <td>
                    <div style={{fontWeight: 600}}>{d.name}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{d.contact}</div>
                  </td>
                  <td>{d.courses[0].courseName}</td>
                  <td>
                    <span style={{color: 'var(--error)', fontWeight: 600}}>
                      {d.dueDate ? (() => { const d = new Date(d.dueDate); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() : 'Not Set'}
                    </span>
                  </td>
                  <td style={{fontWeight: 700, color: 'var(--accent)'}}>₹{d.nextEmi.toLocaleString()}</td>
                  <td style={{fontWeight: 600}}>₹{d.balance.toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => navigate('/record-payment')}
                      className="btn btn-primary" 
                      style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}
                    >
                      Collect Fees
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Fees;
