import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, CreditCard, Calendar, BookOpen, Hash, Search, X } from 'lucide-react';
import API_URL from '../config';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    paymentMethod: 'Cash',
    utrNumber: '',
    remarks: ''
  });
  const [isLastInstallment, setIsLastInstallment] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 4000);
  };

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
        showNotification('Payment Recorded Successfully!', 'success');
        setTimeout(() => navigate('/fees'), 2000);
      } else {
        const result = await response.json();
        showNotification(result.message || 'Could not save payment', 'error');
      }
    } catch (err) {
      console.error('Error saving payment:', err);
      showNotification('Connection Error: Backend is not responding', 'error');
    }
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { 
    display: 'block', 
    fontSize: '0.85rem', 
    fontWeight: 700, 
    marginBottom: '0.6rem', 
    color: '#475569',
    marginLeft: '0.2rem'
  };
  
  const iconicInputContainer = {
    position: 'relative',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s'
  };

  const iconicInputStyle = {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.75rem',
    border: 'none',
    color: '#1e293b',
    outline: 'none',
    fontSize: '0.95rem'
  };

  const iconInInput = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  };

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
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
            {/* Left Side: Student Selection */}
            <div>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', display: 'flex' }}>
                  <User size={20} color="#2563eb" />
                </div>
                Student Selection
              </h3>

              <div style={{ ...inputGroupStyle, position: 'relative' }}>
                <label style={labelStyle}>Search Student (Name or Number)</label>
                <div className="input-glow" style={iconicInputContainer}>
                  <Search size={18} style={iconInInput} />
                  <input 
                    style={iconicInputStyle} 
                    type="text" 
                    placeholder="Type name or mobile..." 
                    value={searchTerm}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(true);
                    }}
                  />
                </div>

                {showResults && searchTerm && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    marginTop: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                    maxHeight: '250px',
                    overflowY: 'auto'
                  }}>
                    {students.filter(s => 
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.contact.includes(searchTerm) ||
                      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(s => (
                      <div 
                        key={s._id} 
                        onClick={() => {
                          setSearchTerm(`${s.name} (${s.studentId})`);
                          setShowResults(false);
                          handleStudentChange(s._id);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {s.studentId} | Mob: {s.contact}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} /> Course Selection
                  </h4>
                  <div style={inputGroupStyle}>
                    <div className="input-glow" style={iconicInputContainer}>
                      <CreditCard size={18} style={iconInInput} />
                      <select 
                        style={{ ...iconicInputStyle, appearance: 'none' }} 
                        required 
                        value={formData.courseId} 
                        onChange={e => setFormData({...formData, courseId: e.target.value})}
                      >
                        {selectedStudent.courses.map(c => (
                          <option key={c.courseId._id} value={c.courseId._id}>{c.courseId.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Balance</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>₹{currentBalance.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Next EMI Approx.</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                        ₹{isLastInstallment ? currentBalance.toLocaleString() : Math.ceil(currentBalance / (selectedStudent.courses[0]?.installmentsCount || 1)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Payment Details */}
            <div>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', display: 'flex' }}>
                  <CreditCard size={20} color="#10b981" />
                </div>
                Payment Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Amount Paid (₹)</label>
                  <div className="input-glow" style={{ ...iconicInputContainer, backgroundColor: isLastInstallment ? '#f8fafc' : '#ffffff' }}>
                    <div style={{ ...iconInInput, fontSize: '0.9rem', fontWeight: 700 }}>₹</div>
                    <input 
                      style={iconicInputStyle} 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      readOnly={isLastInstallment}
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})} 
                    />
                  </div>
                  {isLastInstallment && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.4rem', fontWeight: 600 }}>FINAL PAYMENT (LOCKED)</p>}
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Payment Method</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <CreditCard size={18} style={iconInInput} />
                    <select 
                      style={{ ...iconicInputStyle, appearance: 'none' }} 
                      value={formData.paymentMethod} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / PhonePe / GPay</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
              </div>

              {formData.paymentMethod !== 'Cash' && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>UTR / Transaction ID</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <Hash size={18} style={iconInInput} />
                    <input style={iconicInputStyle} type="text" placeholder="Enter Ref No." value={formData.utrNumber} onChange={e => setFormData({...formData, utrNumber: e.target.value})} />
                  </div>
                </div>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Remarks</label>
                <div className="input-glow" style={iconicInputContainer}>
                  <Calendar size={18} style={iconInInput} />
                  <input style={iconicInputStyle} type="text" placeholder="e.g. 2nd Installment" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-premium" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '0.75rem' }}
                >
                  <Save size={20} /> Save & Generate Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Stunning Notification Popup */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: 'slideDown 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1rem 2rem',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `2px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '300px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: notification.type === 'success' ? '#16a34a' : '#dc2626'
            }}>
              {notification.type === 'success' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <X size={24} strokeWidth={3} />
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 800 }}>
                {notification.type === 'success' ? 'Great Success!' : 'Attention Required'}
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -100%); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default RecordPayment;
