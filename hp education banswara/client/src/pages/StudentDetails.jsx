import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, BookOpen, Clock, CreditCard, Calendar, Hash, Receipt, Download, Trash2, Edit } from 'lucide-react';
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
        studentContact: student.contact,
        courseName: t.courseId?.name || course?.courseId?.name || 'N/A',
        batchName: student.batchName || course?.batchId?.name || 'N/A',
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
        installment: t.remarks
      });
    } catch (err) {
      console.error('Error generating receipt from details:', err);
      generateReceipt(t);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="header" style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <button onClick={() => navigate('/students')} className="btn" style={{padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem'}}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{fontSize: '1.75rem', fontWeight: 800}}>{student.name}</h1>
            <p style={{color: 'var(--text-muted)'}}>Student ID: {student.studentId} | Joined: {(() => { const d = new Date(student.createdAt); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })()}</p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={() => navigate(`/edit-student/${id}`)} className="btn" style={{backgroundColor: 'var(--primary-light)', color: 'var(--accent)', gap: '0.5rem', display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem'}}>
            <Edit size={18} /> Edit Profile
          </button>
          <button onClick={() => navigate('/record-payment')} className="btn btn-primary" style={{padding: '0.75rem 1.5rem'}}>
            <Plus size={18} /> Collect Fees
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
        {/* Left Column: Personal Info & Stats */}
        <div>
          <div className="stat-card" style={{padding: '2rem', marginBottom: '2rem'}}>
            <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <User size={20} color="var(--accent)" /> Personal Info
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              <div>
                <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Father's Name</label>
                <span style={{fontWeight: 600}}>{student.fatherName}</span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Contact Number</label>
                  <span style={{fontWeight: 600}}><Phone size={14} style={{marginRight: '5px'}} /> {student.contact}</span>
                </div>
                {student.alternateContact && (
                  <div>
                    <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Alternate No.</label>
                    <span style={{fontWeight: 600}}><Phone size={14} style={{marginRight: '5px'}} /> {student.alternateContact}</span>
                  </div>
                )}
              </div>
              {student.email && (
                <div>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Email Address</label>
                  <span style={{fontWeight: 600}}><Mail size={14} style={{marginRight: '5px'}} /> {student.email}</span>
                </div>
              )}
              {student.address && (
                <div>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Permanent Address</label>
                  <span style={{fontWeight: 600, fontSize: '0.9rem'}}><MapPin size={14} style={{marginRight: '5px'}} /> {student.address}</span>
                </div>
              )}
              {student.rollNo && (
                <div>
                  <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Roll Number</label>
                  <span style={{fontWeight: 600}}><Hash size={14} style={{marginRight: '5px'}} /> {student.rollNo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card" style={{padding: '2rem', backgroundColor: 'var(--primary-light)', border: 'none'}}>
            <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <CreditCard size={20} color="var(--accent)" /> Fee Summary
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Total Fee:</span>
                <span style={{fontWeight: 700}}>₹{course?.finalFee.toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Total Paid:</span>
                <span style={{fontWeight: 700, color: 'var(--success)'}}>₹{totalPaid.toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)'}}>
                <span style={{fontWeight: 600}}>Balance:</span>
                <span style={{fontWeight: 800, color: 'var(--error)', fontSize: '1.25rem'}}>₹{balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Course & History */}
        <div>
          {/* Course Details */}
          <div className="stat-card" style={{padding: '2rem', marginBottom: '2rem'}}>
            <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <BookOpen size={20} color="var(--accent)" /> Enrolled Course Details
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', rowGap: '1.5rem'}}>
              <div>
                <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Course</label>
                <span style={{fontWeight: 700, fontSize: '1.1rem'}}>{course?.courseId?.name || course?.courseName}</span>
              </div>
              <div>
                <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Batch</label>
                <span style={{fontWeight: 600}}>{course?.batchId?.name || course?.batchName}</span>
              </div>
              <div>
                <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Payment Plan</label>
                <span style={{backgroundColor: 'var(--primary-light)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.85rem'}}>
                  {course?.paymentPlan}
                </span>
              </div>
              
              {course?.paymentPlan === 'Installments' && (
                <>
                  <div>
                    <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Total Installments</label>
                    <span style={{fontWeight: 700, color: 'var(--accent)'}}>{course?.installmentsCount || 1}</span>
                  </div>
                  <div>
                    <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Approx. EMI</label>
                    <span style={{fontWeight: 700}}>
                      ₹{(() => {
                        const instCount = course?.installmentsCount || 1;
                        const paidEMIsCount = Math.max(0, transactions.length - 1);
                        const remainingInstCount = Math.max(1, instCount - paidEMIsCount);
                        return Math.ceil(balance / remainingInstCount).toLocaleString();
                      })()}
                    </span>
                  </div>
                  <div>
                    <label style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Next Due Date</label>
                    <span style={{fontWeight: 700, color: balance > 0 ? 'var(--error)' : 'var(--success)'}}>
                      {balance > 0 ? (
                        <>
                          <Calendar size={14} style={{marginRight: '4px'}} />
                          {(() => {
                            const baseDateStr = course?.nextDueDate || student.createdAt;
                            if (!baseDateStr) return 'Not Set';
                            const d = new Date(baseDateStr);
                            if (!course?.nextDueDate) {
                              const paidEMIsCount = Math.max(0, transactions.length - 1);
                              d.setMonth(d.getMonth() + paidEMIsCount + 1);
                            }
                            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                          })()}
                        </>
                      ) : 'FEES COMPLETED'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="stat-card" style={{padding: '0', marginBottom: '2rem'}}>
            <div style={{padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Receipt size={20} color="var(--accent)" /> Payment History
              </h3>
            </div>
            <div style={{padding: '0 1rem'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border)'}}>
                    <th style={{padding: '1rem'}}>Receipt</th>
                    <th style={{padding: '1rem'}}>Date</th>
                    <th style={{padding: '1rem'}}>Method</th>
                    <th style={{padding: '1rem'}}>Amount</th>
                    <th style={{padding: '1rem'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map(t => (
                    <tr key={t._id} style={{borderBottom: '1px solid var(--border)'}}>
                      <td style={{padding: '1rem', fontWeight: 600}}>{t.receiptId}</td>
                      <td style={{padding: '1rem'}}>{(() => { const d = new Date(t.paymentDate); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })()}</td>
                      <td style={{padding: '1rem'}}>
                        {t.paymentMethod}
                        {t.utrNumber && <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>ID: {t.utrNumber}</div>}
                      </td>
                      <td style={{padding: '1rem', fontWeight: 700, color: 'var(--success)'}}>₹{t.amount.toLocaleString()}</td>
                      <td style={{padding: '1rem'}}>
                        <button onClick={() => handleDownload(t)} className="btn" style={{padding: '0.4rem', backgroundColor: 'var(--primary-light)', color: 'var(--accent)'}}>
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'}}>No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Installment Plan (Statement) */}
          <div className="stat-card" style={{padding: '2rem'}}>
            <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Calendar size={20} color="var(--accent)" /> Fee Installment Plan
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {/* Calculate Installments Plan */}
              {(() => {
                const plan = [];
                const instCount = course?.installmentsCount || 1;
                const paidEMIsCount = Math.max(0, transactions.length - 1);
                const remainingInstCount = Math.max(1, instCount - paidEMIsCount);
                const emi = balance > 0 ? Math.ceil(balance / remainingInstCount) : 0;
                
                // Show paid first (Downpayment)
                plan.push({ 
                  label: 'Down Payment / Initial Payment', 
                  status: 'PAID', 
                  amount: transactions[transactions.length - 1]?.amount || 0,
                  date: transactions[transactions.length - 1]?.paymentDate
                });

                // Show future installments
                let runningBalance = balance;
                for (let i = 1; i <= instCount; i++) {
                  const isPaid = transactions.length > i;
                  const isLastPending = !isPaid && (i === instCount || (i < instCount && transactions.length > (i + 1) === false)); 
                  // Wait, simpler: if it's the last one in the loop and it's pending.
                  
                  let displayAmount = emi;
                  if (isPaid) {
                    displayAmount = transactions[transactions.length - 1 - i]?.amount || emi;
                  } else {
                    // If it's the last installment in the plan, use the remaining running balance
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
                      // Original fixed schedule logic: EMI #i is always (base + i) months
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
                    padding: '1rem', 
                    backgroundColor: item.status === 'PAID' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    borderRadius: '0.75rem',
                    border: `1px solid ${item.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`
                  }}>
                    <div>
                      <div style={{fontWeight: 700}}>{item.label}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                        {item.date ? (() => {
                          const d = new Date(item.date);
                          return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                        })() : 'Future Date'}
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontWeight: 800}}>₹{item.amount.toLocaleString()}</div>
                      <span style={{
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: item.status === 'PAID' ? 'var(--success)' : 'var(--warning)',
                        textTransform: 'uppercase'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ));
              })()}
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
