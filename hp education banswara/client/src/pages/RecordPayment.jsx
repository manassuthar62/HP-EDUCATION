import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, CreditCard, Calendar, BookOpen, Hash } from 'lucide-react';
import API_URL from '../config';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    paymentMethod: 'Cash',
    utrNumber: '',
    remarks: 'Installment Payment'
  });
  const [isLastInstallment, setIsLastInstallment] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        setStudents(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentChange = async (id) => {
    const student = students.find(s => s._id === id);
    setSelectedStudent(student);
    
    if (student && student.courses && student.courses.length > 0) {
      const course = student.courses[0];
      
      try {
        // Fetch current payment history to calculate balance
        const res = await fetch(`${API_URL}/fees/student/${id}`);
        const payments = await res.json();
        const totalPaid = Array.isArray(payments) ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
        const balance = course.finalFee - totalPaid;
        const instCount = course.installmentsCount || 1;
        
        // Calculate EMI: (Total Fee - Initial Payment) / Installments
        // Or simply: Balance / Remaining Installments?
        // Let's use Balance / installmentsCount for consistency with StudentDetails
        // Check if this is the last installment
        // Total expected = 1 (Downpayment) + instCount (EMIs)
        // If payments.length >= instCount, this is the final EMI collection
        const isFinal = payments.length >= instCount;
        setIsLastInstallment(isFinal);
        setCurrentBalance(balance);

        const calculatedEMI = balance > 0 ? (isFinal ? balance : Math.ceil(balance / (instCount - payments.length + 1))) : '';

        setFormData({
          ...formData,
          studentId: id,
          courseId: course.courseId._id,
          amount: calculatedEMI.toString(),
          remarks: isFinal ? `Final Installment Payment` : `Installment Payment`
        });
      } catch (err) {
        console.error('Error auto-calculating EMI:', err);
        setIsLastInstallment(false);
        setFormData({
          ...formData,
          studentId: id,
          courseId: course.courseId._id,
          amount: ''
        });
      }
    } else {
      setIsLastInstallment(false);
      setFormData({ ...formData, studentId: id, courseId: '', amount: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: 'REC-' + Math.floor(Math.random() * 100000),
          ...formData
        })
      });

      if (response.ok) {
        alert('✅ Payment Recorded Successfully!');
        navigate('/fees');
      } else {
        const result = await response.json();
        alert('❌ Error: ' + (result.message || 'Could not save payment'));
      }
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('❌ Connection Error');
    }
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Data...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/fees')} className="btn" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Record New Payment</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter payment details and generate a new receipt.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="stat-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left Column */}
            <div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><User size={18} /> Select Student</label>
                <select style={inputStyle} required value={formData.studentId} onChange={e => handleStudentChange(e.target.value)}>
                  <option value="">-- Search/Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>

              {selectedStudent && selectedStudent.courses && selectedStudent.courses.length > 0 && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><BookOpen size={18} /> Select Course</label>
                  <select style={inputStyle} required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                    {selectedStudent.courses.map(c => (
                      <option key={c.courseId._id} value={c.courseId._id}>{c.courseId.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Amount Paid (₹) {isLastInstallment && <span style={{color: 'var(--error)', marginLeft: '10px', fontSize: '0.7rem'}}>FINAL PAYMENT (LOCKED)</span>}</label>
                  <input 
                    style={{...inputStyle, backgroundColor: isLastInstallment ? 'rgba(0,0,0,0.05)' : 'var(--bg-card)'}} 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    readOnly={isLastInstallment}
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                  {isLastInstallment && <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px'}}>This is the final payment to clear the balance of ₹{currentBalance.toLocaleString()}.</p>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><CreditCard size={18} /> Payment Method</label>
                  <select style={inputStyle} value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / PhonePe / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {formData.paymentMethod !== 'Cash' && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><Hash size={18} /> UTR / Transaction ID</label>
                  <input style={inputStyle} type="text" placeholder="Enter UTR or Ref No." value={formData.utrNumber} onChange={e => setFormData({...formData, utrNumber: e.target.value})} />
                </div>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Remarks</label>
                <input style={inputStyle} type="text" placeholder="e.g. 2nd Installment, Admission Fee" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
              <Save size={20} /> Save Payment & Generate Receipt
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecordPayment;
