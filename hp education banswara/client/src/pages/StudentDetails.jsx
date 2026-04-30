import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, BookOpen, Clock, CreditCard, Calendar, Hash, Receipt, Download, Trash2, Edit, TrendingUp } from 'lucide-react';
import { generateReceipt } from '../utils/receiptGenerator';
import API_URL from '../config';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(`${API_URL}/students/${id}`);
        const studentData = await studentRes.json();
        if (studentRes.status === 404) {
          setStudent(null);
          setLoading(false);
          return;
        }
        setStudent(studentData);

        const transRes = await fetch(`${API_URL}/fees`);
        const transData = await transRes.json();
        // Filter transactions for this student
        const studentTrans = transData.filter(t => t.studentId?._id === id);
        setTransactions(studentTrans.reverse());
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Student Profile...</div>;
  if (!student) return <div style={{padding: '2rem', textAlign: 'center'}}>Student not found!</div>;

  const course = student.courses && student.courses[0];
  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = course ? course.finalFee - totalPaid : 0;

  const handleDownload = async (t) => {
    try {
      const studentPaymentsRes = await fetch(`${API_URL}/fees/student/${id}`);
      const studentPayments = await studentPaymentsRes.json();
      
      generateReceipt({
        receiptId: t.receiptId,
        studentName: student.name,
        fatherName: student.fatherName,
        studentDob: student.dob,
        studentContact: student.contact,
        courseName: t.courseId?.name || course?.courseId?.name || 'N/A',
        batchName: t.batchId?.name || course?.batchId?.name || 'N/A',
        totalFee: course?.finalFee || 0,
        installmentsCount: course?.installmentsCount || 1,
        amount: t.amount,
        allPayments: Array.isArray(studentPayments) ? studentPayments : [t],
        balance: balance,
        nextDueDate: course?.nextDueDate,
        paymentDate: t.paymentDate,
        paymentMethod: t.paymentMethod,
        utrNumber: t.utrNumber,
        remarks: t.remarks || `Payment via ${t.paymentMethod}`,
        discount: course?.discount || 0,
        baseFee: course?.totalFee || 0,
        discountRemark: course?.discountRemark,
        installment: t.remarks
      });
    } catch (err) {
      console.error('Error generating receipt from details:', err);
      generateReceipt(t);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/students')} className="btn" style={{ padding: '0.6rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <ArrowLeft size={22} color="#475569" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{student.name}</h1>
            <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
              Student ID: <span style={{ color: '#2563eb', fontWeight: 700 }}>{student.studentId}</span> | Joined: {(() => { const d = new Date(student.createdAt); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate(`/edit-student/${id}`)} className="btn" style={{ backgroundColor: '#ffffff', color: '#64748b', border: '1.5px solid #e2e8f0', gap: '0.6rem', display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600 }}>
            <Edit size={18} /> Edit Profile
          </button>
          <button onClick={() => navigate('/record-payment')} className="btn" style={{ backgroundColor: '#2563eb', color: 'white', gap: '0.6rem', display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)' }}>
            <Plus size={18} /> Collect Fees
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
        <div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', display: 'flex' }}>
                <User size={20} color="#2563eb" />
              </div>
              Personal Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Father's Name</label>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{student.fatherName || 'N/A'}</span>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date of Birth</label>
                <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#64748b" /> 
                  {student.dob ? (() => { const d = new Date(student.dob); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Contact Number</label>
                  <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} color="#64748b" /> {student.contact}</span>
                </div>
                {student.alternateContact && (
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Alternate No.</label>
                    <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={14} color="#64748b" /> {student.alternateContact}</span>
                  </div>
                )}
              </div>
              {student.email && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</label>
                  <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} color="#64748b" /> {student.email}</span>
                </div>
              )}
              {student.address && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Permanent Address</label>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} color="#64748b" /> {student.address}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
            borderRadius: '1.25rem', 
            padding: '2rem', 
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.2)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#ffffff' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', display: 'flex' }}>
                <CreditCard size={20} color="#ffffff" />
              </div>
              Fee Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Total Course Fee:</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{course?.finalFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Total Amount Paid:</span>
                <span style={{ fontWeight: 700, color: '#4ade80', fontSize: '1.1rem' }}>₹{totalPaid.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Remaining Balance:</span>
                <span style={{ fontWeight: 900, color: '#f87171', fontSize: '1.75rem' }}>₹{balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Course & History */}
        <div>
          {/* Course Details */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', display: 'flex' }}>
                <BookOpen size={20} color="#10b981" />
              </div>
              Enrolled Course Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', rowGap: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Course Name</label>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>{course?.courseId?.name || course?.courseName}</span>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Batch</label>
                <span style={{ fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.9rem' }}>{course?.batchId?.name || course?.batchName}</span>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Payment Plan</label>
                <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  {course?.paymentPlan}
                </span>
              </div>
              
              {course?.discount > 0 && (
                <div style={{ gridColumn: 'span 3', padding: '1.25rem', backgroundColor: '#fff7ed', borderRadius: '1rem', border: '1.5px dashed #fb923c' }}>
                  <label style={{ fontSize: '0.75rem', color: '#c2410c', display: 'block', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Discount Reward</label>
                  <span style={{ fontWeight: 700, color: '#ea580c', fontSize: '1rem' }}>{course.discountRemark || 'No remark'} — ₹{course.discount.toLocaleString()} Saved</span>
                </div>
              )}
              
              {course?.paymentPlan === 'Installments' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Installments</label>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{course?.installmentsCount || 1} Months</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Monthly EMI</label>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.1rem' }}>
                      ₹{(() => {
                        const instCount = course?.installmentsCount || 1;
                        const paidEMIsCount = Math.max(0, transactions.length - 1);
                        const remainingInstCount = Math.max(1, instCount - paidEMIsCount);
                        return Math.ceil(balance / remainingInstCount).toLocaleString();
                      })()}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Next Due</label>
                    <span style={{ fontWeight: 800, color: balance > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {balance > 0 ? (
                        <>
                          <Calendar size={16} />
                          {(() => {
                            const baseDateStr = course?.nextDueDate || student.createdAt;
                            if (!baseDateStr) return 'Not Set';
                            const d = new Date(baseDateStr);
                            const offset = course?.nextDueDate ? 0 : Math.max(0, transactions.length - 1) + 1;
                            d.setMonth(d.getMonth() + offset);
                            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                          })()}
                        </>
                      ) : 'COMPLETED'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: '#1e293b' }}>
                <div style={{ padding: '0.4rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', display: 'flex' }}>
                  <Receipt size={18} color="#2563eb" />
                </div>
                Payment Ledger
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '0.5rem' }}>
                {transactions.length} Records
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Receipt</th>
                    <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Date</th>
                    <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Method</th>
                    <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Amount</th>
                    <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#1e293b' }}>{t.receiptId}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>{(() => { const d = new Date(t.paymentDate); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() || 'N/A'}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t.paymentMethod}
                        </span>
                        {t.utrNumber && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Ref: {t.utrNumber}</div>}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>₹{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button onClick={() => handleDownload(t)} className="btn" style={{ padding: '0.5rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '0.6rem', transition: 'all 0.2s' }}>
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Installment Plan */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#fff7ed', borderRadius: '0.5rem', display: 'flex' }}>
                <Calendar size={20} color="#ea580c" />
              </div>
              {course?.paymentPlan === 'One-Shot' ? 'Payment Status' : 'Fee Installment Schedule'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {course?.paymentPlan === 'One-Shot' ? (
                <div style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.5rem', 
                  backgroundColor: balance <= 0 ? '#f0fdf4' : '#fffbeb',
                  borderRadius: '1rem',
                  border: `1.5px solid ${balance <= 0 ? '#dcfce7' : '#fef3c7'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: balance <= 0 ? '#22c55e' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>Full Course Payment</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        {balance <= 0 ? 'All fees settled' : 'Payment pending'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>₹{course?.finalFee.toLocaleString()}</div>
                    <span style={{
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      color: balance <= 0 ? '#16a34a' : '#b45309',
                      textTransform: 'uppercase',
                      backgroundColor: balance <= 0 ? '#dcfce7' : '#fef3c7',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.4rem'
                    }}>
                      {balance <= 0 ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ) : (
                (() => {
                  const plan = [];
                  const instCount = course?.installmentsCount || 1;
                  const paidEMIsCount = Math.max(0, transactions.length - 1);
                  const remainingInstCount = Math.max(1, instCount - paidEMIsCount);
                  const emi = balance > 0 ? Math.ceil(balance / remainingInstCount) : 0;
                  
                  plan.push({ 
                    label: 'Initial / Down Payment', 
                    status: 'PAID', 
                    amount: transactions[transactions.length - 1]?.amount || 0,
                    date: transactions[transactions.length - 1]?.paymentDate
                  });

                  let runningBalance = balance;
                  for (let i = 1; i <= instCount; i++) {
                    const isPaid = transactions.length > i;
                    let displayAmount = emi;
                    if (isPaid) {
                      displayAmount = transactions[transactions.length - 1 - i]?.amount || emi;
                    } else {
                      if (i === instCount) {
                        displayAmount = runningBalance;
                      } else {
                        displayAmount = emi;
                        runningBalance -= emi;
                      }
                    }

                    plan.push({
                      label: `Installment #${i}`,
                      status: isPaid ? 'PAID' : 'PENDING',
                      amount: displayAmount,
                      date: isPaid ? transactions[transactions.length - 1 - i]?.paymentDate : (() => {
                        const baseDateStr = course?.nextDueDate || student.createdAt;
                        if (!baseDateStr) return null;
                        const baseDate = new Date(baseDateStr);
                        const offset = course?.nextDueDate ? (i - 1) : i;
                        baseDate.setMonth(baseDate.getMonth() + offset);
                        return baseDate;
                      })()
                    });
                  }

                  return plan.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1.25rem 1.5rem', 
                      backgroundColor: item.status === 'PAID' ? '#f0fdf4' : '#fffbeb',
                      borderRadius: '1rem',
                      border: `1.5px solid ${item.status === 'PAID' ? '#dcfce7' : '#fef3c7'}`,
                      transition: 'transform 0.2s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: item.status === 'PAID' ? '#22c55e' : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {item.status === 'PAID' ? <TrendingUp size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{item.label}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                            {item.date ? (() => {
                              const d = new Date(item.date);
                              return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                            })() : 'Scheduled'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>₹{item.amount.toLocaleString()}</div>
                        <span style={{
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          color: item.status === 'PAID' ? '#16a34a' : '#b45309',
                          textTransform: 'uppercase',
                          backgroundColor: item.status === 'PAID' ? '#dcfce7' : '#fef3c7',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.4rem'
                        }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default StudentDetails;
