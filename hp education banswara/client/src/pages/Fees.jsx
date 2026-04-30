import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Receipt, TrendingUp, Calendar, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
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
        studentDob: p.studentId?.dob || '',
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
        discount: studentCourse.discount || 0,
        baseFee: studentCourse.totalFee || 0,
        discountRemark: studentCourse.discountRemark,
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Collected Today Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
          borderRadius: '1.25rem', 
          padding: '2rem', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
            <TrendingUp size={120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Collected Today</p>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 800 }}>₹{(stats.today || 0).toLocaleString()}</h2>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '1rem', backdropFilter: 'blur(4px)' }}>
            <DollarSign size={28} />
          </div>
        </div>

        {/* This Month Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
          borderRadius: '1.25rem', 
          padding: '2rem', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
            <Calendar size={120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>This Month</p>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 800 }}>₹{(stats.month || 0).toLocaleString()}</h2>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '1rem', backdropFilter: 'blur(4px)' }}>
            <Receipt size={28} />
          </div>
        </div>

        {/* Total Outstanding Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
          borderRadius: '1.25rem', 
          padding: '2rem', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
            <AlertCircle size={120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Total Outstanding</p>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 800 }}>₹{(stats.pending || 0).toLocaleString()}</h2>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '1rem', backdropFilter: 'blur(4px)' }}>
            <AlertCircle size={28} />
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '0 2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2.5rem' }}>
          <button 
            onClick={() => setView('transactions')}
            style={{
              padding: '1.25rem 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: view === 'transactions' ? '3px solid #2563eb' : '3px solid transparent', 
              color: view === 'transactions' ? '#2563eb' : '#64748b', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            Recent Transactions
          </button>
          <button 
            onClick={() => setView('dues')}
            style={{
              padding: '1.25rem 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: view === 'dues' ? '3px solid #2563eb' : '3px solid transparent', 
              color: view === 'dues' ? '#2563eb' : '#64748b', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            Pending Dues (Upcoming EMI)
          </button>
        </div>

        {view === 'transactions' ? (
          <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Receipt ID</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Student</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Course</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Method</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
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
          <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Course</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Next Due Date</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Next EMI (₹)</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Remaining Total</th>
                <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
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
