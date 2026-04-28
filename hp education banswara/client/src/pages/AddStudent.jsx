import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, BookOpen, Clock, CreditCard, Calendar, Hash } from 'lucide-react';
import API_URL from '../config';

const AddStudent = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseBatches, setSelectedCourseBatches] = useState([]);
  const [formData, setFormData] = useState({
    studentId: 'HP-' + Math.floor(Math.random() * 10000), // Auto-generate random ID
    name: '', fatherName: '', contact: '', alternateContact: '', email: '', address: '',
    courseName: '', batchName: '', rollNo: '',
    totalFee: '', discount: '0', paymentPlan: 'Installments', paidAmount: '0', installmentsCount: '1', nextDueDate: '',
    paymentMethod: 'Cash', utrNumber: ''
  });

  useEffect(() => {
    // Fetch courses to populate dropdowns
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/academic/courses`);
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    if (course) {
      setFormData({
        ...formData,
        courseName: course.name,
        totalFee: course.baseFee.toString(),
        batchName: '' // Reset batch when course changes
      });
      setSelectedCourseBatches(course.batches || []);
    } else {
      setFormData({ ...formData, courseName: '', batchName: '' });
      setSelectedCourseBatches([]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = Number(formData.totalFee) - Number(formData.discount);
    const actualPaid = formData.paymentPlan === 'One-Shot' ? finalAmount : Number(formData.paidAmount);
    
    // Find selected course and batch objects to get IDs
    const selectedCourse = courses.find(c => c.name === formData.courseName);
    const selectedBatch = selectedCourseBatches.find(b => b.name === formData.batchName);

    if (!selectedCourse || !selectedBatch) {
      alert('❌ Please select a valid Course and Batch');
      return;
    }

    try {
      const studentData = {
        ...formData,
        courses: [{
          courseId: selectedCourse._id,
          batchId: selectedBatch._id,
          courseName: formData.courseName,
          batchName: formData.batchName,
          totalFee: Number(formData.totalFee),
          discount: Number(formData.discount),
          finalFee: finalAmount,
          paymentPlan: formData.paymentPlan,
          installmentsCount: Number(formData.installmentsCount),
          nextDueDate: formData.paymentPlan === 'One-Shot' ? null : formData.nextDueDate
        }]
      };

      console.log('Saving Student Data:', studentData);

      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      const result = await response.json();

      if (response.ok) {
        // Create initial transaction if paidAmount > 0
        if (actualPaid > 0) {
          try {
            await fetch(`${API_URL}/fees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                receiptId: 'REC-' + Math.floor(Math.random() * 100000),
                studentId: result._id,
                courseId: selectedCourse._id,
                amount: actualPaid,
                paymentMethod: formData.paymentMethod,
                utrNumber: formData.utrNumber,
                remarks: 'Admission Down Payment'
              })
            });
          } catch (feeErr) {
            console.error('Error creating initial receipt:', feeErr);
          }
        }
        
        alert('✅ Student Registered Successfully!');
        navigate('/students');
      } else {
        alert('❌ Error: ' + (result.message || 'Could not save student'));
      }
    } catch (err) {
      console.error('Error adding student:', err);
      alert('❌ Connection Error: Backend is not responding');
    }
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' };

  return (
    <div className="animate-fade-in">
      <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/students')} className="btn" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Add New Student</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Fill in the details below to create a new student profile.</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
          <Save size={20} /> Save Student
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Personal Information */}
          <div className="stat-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--accent)" /> Personal Information
            </h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Student ID (Unique)</label>
              <input style={inputStyle} type="text" placeholder="e.g. HP-1001" required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} type="text" placeholder="Student's Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Father's Name</label>
              <input style={inputStyle} type="text" placeholder="Father's Name" required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Phone size={16} /> Contact No</label>
                <input style={inputStyle} type="tel" placeholder="Mobile Number" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Phone size={16} /> Alternate No</label>
                <input style={inputStyle} type="tel" placeholder="Optional Number" value={formData.alternateContact} onChange={e => setFormData({...formData, alternateContact: e.target.value})} />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Mail size={16} /> Email</label>
              <input style={inputStyle} type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><MapPin size={16} /> Address</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Permanent Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          {/* Academic & Fee Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="stat-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="var(--accent)" /> Academic Details
              </h3>
              
              <div style={inputGroupStyle}>
                <label style={labelStyle}><BookOpen size={16} /> Course Selection</label>
                <select 
                  style={inputStyle} 
                  required 
                  value={formData.courseName} 
                  onChange={e => handleCourseChange(e.target.value)}
                >
                  <option value="">Select a Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><Clock size={16} /> Batch</label>
                  <select 
                    style={inputStyle} 
                    required 
                    value={formData.batchName} 
                    onChange={e => setFormData({...formData, batchName: e.target.value})}
                    disabled={!formData.courseName}
                  >
                    <option value="">Select a Batch</option>
                    {selectedCourseBatches.map(batch => (
                      <option key={batch._id} value={batch.name}>{batch.name} ({batch.time})</option>
                    ))}
                  </select>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><Hash size={16} /> Roll Number</label>
                  <input style={inputStyle} type="text" placeholder="Roll No" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '2rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.02)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--success)" /> Fee Structure
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: formData.paymentPlan === 'Installments' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><CreditCard size={18} /> Payment Plan</label>
                  <select 
                    style={inputStyle} 
                    value={formData.paymentPlan} 
                    onChange={e => setFormData({...formData, paymentPlan: e.target.value})}
                  >
                    <option value="Installments">Installments (EMI)</option>
                    <option value="One-Shot">One-Shot (Full Payment)</option>
                  </select>
                </div>
                {formData.paymentPlan === 'Installments' && (
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Number of Installments</label>
                    <input 
                      style={inputStyle} 
                      type="number" 
                      min="1"
                      placeholder="e.g. 3" 
                      value={formData.installmentsCount} 
                      onChange={e => setFormData({...formData, installmentsCount: e.target.value})} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: formData.paymentPlan === 'Installments' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Total Fee (₹)</label>
                  <input style={inputStyle} type="number" placeholder="0.00" required value={formData.totalFee} onChange={e => setFormData({...formData, totalFee: e.target.value})} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Discount (₹)</label>
                  <input style={inputStyle} type="number" placeholder="0.00" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                </div>
              </div>

              {formData.paymentPlan === 'Installments' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Down Payment (₹)</label>
                      <input style={inputStyle} type="number" placeholder="Amount paid now" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}><Calendar size={16} /> Next Due Date</label>
                      <input style={inputStyle} type="date" required value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}><CreditCard size={18} /> Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: formData.paymentMethod !== 'Cash' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    <select 
                      style={inputStyle} 
                      value={formData.paymentMethod} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">Online / UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                    {formData.paymentMethod !== 'Cash' && (
                      <input 
                        style={inputStyle} 
                        type="text" 
                        placeholder="Transaction ID / UTR" 
                        value={formData.utrNumber} 
                        onChange={e => setFormData({...formData, utrNumber: e.target.value})} 
                      />
                    )}
                </div>
              </div>

              {formData.paymentPlan === 'Installments' && Number(formData.installmentsCount) > 1 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estimated EMI per month</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{Math.ceil((Number(formData.totalFee) - Number(formData.discount) - Number(formData.paidAmount)) / Number(formData.installmentsCount)).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>{formData.installmentsCount} Months</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Final Amount</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    ₹{(Number(formData.totalFee) - Number(formData.discount)).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Remaining Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    ₹{formData.paymentPlan === 'One-Shot' ? '0' : (Number(formData.totalFee) - Number(formData.discount) - Number(formData.paidAmount)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
