import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, BookOpen, Clock, CreditCard, Calendar, Hash, X } from 'lucide-react';
import API_URL from '../config';

const AddStudent = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseBatches, setSelectedCourseBatches] = useState([]);
  const [formData, setFormData] = useState({
    studentId: 'HP-' + Math.floor(Math.random() * 10000), // Auto-generate random ID
    name: '', fatherName: '', contact: '', alternateContact: '', email: '', address: '',
    courseName: '', batchName: '', rollNo: '',
    totalFee: '', discount: '0', discountRemark: '', paymentPlan: 'Installments', paidAmount: '0', installmentsCount: '1', nextDueDate: '',
    paymentMethod: 'Cash', utrNumber: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    contact: '',
    alternateContact: '',
    email: '',
    address: '',
    contactMatch: '',
    discountRemark: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    if (type !== 'success') {
      setTimeout(() => setNotification({ ...notification, show: false }), 4000);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.length < 3) error = 'Name must be at least 3 characters long';
        break;
      case 'fatherName':
        if (value.trim().length < 3) error = "Father's name is required";
        break;
      case 'contact':
        if (!/^\d{10}$/.test(value)) error = 'Contact must be a 10-digit number';
        if (value === formData.alternateContact) error = 'Both numbers cannot be same!';
        // Clear alternateContact error if it was a match error
        if (value !== formData.alternateContact && errors.alternateContact === 'Both numbers cannot be same!') {
          setErrors(prev => ({ ...prev, alternateContact: '' }));
        }
        break;
      case 'alternateContact':
        if (!/^\d{10}$/.test(value)) error = 'Alternate contact must be a 10-digit number';
        if (value === formData.contact) error = 'Both numbers cannot be same!';
        // Clear contact error if it was a match error
        if (value !== formData.contact && errors.contact === 'Both numbers cannot be same!') {
          setErrors(prev => ({ ...prev, contact: '' }));
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        break;
      case 'address':
        if (value.length < 5) error = 'Please enter a more detailed address';
        break;
      case 'discountRemark':
        if (Number(formData.discount) > 0 && value.trim().length < 3) error = 'Please provide a reason for the discount';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

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
    
    // Sequential Validation Check
    if (!formData.name.trim()) {
      showNotification('Student Full Name is required', 'error');
      return;
    }
    if (!formData.fatherName.trim()) {
      showNotification("Father's Name is required", 'error');
      return;
    }
    if (!formData.contact || formData.contact.length !== 10) {
      showNotification('Valid 10-digit Contact Number is required', 'error');
      return;
    }
    if (!formData.alternateContact || formData.alternateContact.length !== 10) {
      showNotification('Valid 10-digit Alternate Number is required', 'error');
      return;
    }
    if (formData.contact === formData.alternateContact) {
      showNotification('Contact and Alternate numbers cannot be the same', 'error');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showNotification('A valid Email Address is required', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showNotification('Permanent Address is required', 'error');
      return;
    }
    if (!formData.courseName) {
      showNotification('Please select a Course', 'error');
      return;
    }
    if (!formData.batchName) {
      showNotification('Please select a Batch', 'error');
      return;
    }
    if (Number(formData.discount) > 0 && !formData.discountRemark.trim()) {
      showNotification('Please provide a reason for the discount', 'error');
      return;
    }

    const selectedCourse = courses.find(c => c.name === formData.courseName);
    const selectedBatch = selectedCourseBatches.find(b => b.name === formData.batchName);

    if (!selectedCourse || !selectedBatch) {
      showNotification('Course or Batch selection is invalid', 'error');
      return;
    }

    const finalAmount = Number(formData.totalFee) - Number(formData.discount);
    const actualPaid = formData.paymentPlan === 'One-Shot' ? finalAmount : Number(formData.paidAmount);

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
          discountRemark: formData.discountRemark,
          finalFee: finalAmount,
          paymentPlan: formData.paymentPlan,
          installmentsCount: Number(formData.installmentsCount),
          nextDueDate: formData.paymentPlan === 'One-Shot' ? null : formData.nextDueDate
        }]
      };

      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      const result = await response.json();

      if (response.ok) {
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
        
        showNotification('Student Registered Successfully!', 'success');
        // Let the user decide whether to view ID cards or add another student via the popup buttons
      } else {
        showNotification(result.message || 'Could not save student', 'error');
      }
    } catch (err) {
      console.error('Error adding student:', err);
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
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    backgroundColor: 'transparent',
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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/students')} className="btn" style={{ padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Add New Student</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Enter student information to create a new profile.</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn btn-premium" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '0.75rem', fontWeight: 700 }}>
          <Save size={20} /> Save Student Record
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Left Column: Personal Information */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', display: 'flex' }}>
                <User size={20} color="#2563eb" />
              </div>
              Personal Information
            </h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Student ID (Unique)</label>
              <div className="input-glow" style={iconicInputContainer}>
                <Hash size={18} style={iconInInput} />
                <input style={iconicInputStyle} type="text" placeholder="e.g. HP-1001" required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div className="input-glow" style={{ ...iconicInputContainer, borderColor: errors.name ? '#ef4444' : '#e2e8f0' }}>
                <User size={18} style={iconInInput} />
                <input 
                  style={iconicInputStyle} 
                  type="text" 
                  placeholder="Student's Full Name" 
                  required 
                  value={formData.name} 
                  onChange={e => {
                    setFormData({...formData, name: e.target.value});
                    validateField('name', e.target.value);
                  }} 
                />
              </div>
              {errors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.name}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Father's Name</label>
              <div className="input-glow" style={{ ...iconicInputContainer, borderColor: errors.fatherName ? '#ef4444' : '#e2e8f0' }}>
                <User size={18} style={iconInInput} />
                <input 
                  style={iconicInputStyle} 
                  type="text" 
                  placeholder="Father's Name" 
                  required 
                  value={formData.fatherName} 
                  onChange={e => {
                    setFormData({...formData, fatherName: e.target.value});
                    validateField('fatherName', e.target.value);
                  }} 
                />
              </div>
              {errors.fatherName && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.fatherName}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Contact Number</label>
                <div className="input-glow" style={{ ...iconicInputContainer, borderColor: errors.contact ? '#ef4444' : '#e2e8f0' }}>
                  <Phone size={18} style={iconInInput} />
                  <input 
                    style={iconicInputStyle} 
                    type="tel" 
                    placeholder="Mobile Number" 
                    required 
                    maxLength="10"
                    value={formData.contact} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, ''); // Only digits
                      setFormData({...formData, contact: val});
                      validateField('contact', val);
                    }} 
                  />
                </div>
                {errors.contact && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.contact}</div>}
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Alternate Number</label>
                <div className="input-glow" style={{ ...iconicInputContainer, borderColor: errors.alternateContact ? '#ef4444' : '#e2e8f0' }}>
                  <Phone size={18} style={iconInInput} />
                  <input 
                    style={iconicInputStyle} 
                    type="tel" 
                    placeholder="Mandatory Alternate Number" 
                    required 
                    maxLength="10"
                    value={formData.alternateContact} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, ''); // Only digits
                      setFormData({...formData, alternateContact: val});
                      validateField('alternateContact', val);
                    }} 
                  />
                </div>
                {errors.alternateContact && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.alternateContact}</div>}
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <div className="input-glow" style={{ ...iconicInputContainer, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}>
                <Mail size={18} style={iconInInput} />
                <input 
                  style={iconicInputStyle} 
                  type="email" 
                  placeholder="student@example.com" 
                  required 
                  value={formData.email} 
                  onChange={e => {
                    setFormData({...formData, email: e.target.value});
                    validateField('email', e.target.value);
                  }} 
                />
              </div>
              {errors.email && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.email}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Permanent Address</label>
              <div className="input-glow" style={{ ...iconicInputContainer, borderRadius: '0.75rem', borderColor: errors.address ? '#ef4444' : '#e2e8f0' }}>
                <MapPin size={18} style={{ ...iconInInput, top: '1.25rem', transform: 'none' }} />
                <textarea 
                  style={{ ...iconicInputStyle, minHeight: '100px', resize: 'vertical', paddingTop: '0.75rem' }} 
                  placeholder="Street, City, Zip Code" 
                  required
                  value={formData.address} 
                  onChange={e => {
                    setFormData({...formData, address: e.target.value});
                    validateField('address', e.target.value);
                  }} 
                />
              </div>
              {errors.address && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.address}</div>}
            </div>
          </div>

          {/* Right Column: Academic & Fees */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Academic Details Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f5f3ff', borderRadius: '0.5rem', display: 'flex' }}>
                  <BookOpen size={20} color="#7c3aed" />
                </div>
                Academic Details
              </h3>
              
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Course Selection</label>
                <div className="input-glow" style={iconicInputContainer}>
                  <BookOpen size={18} style={iconInInput} />
                  <select 
                    style={{ ...iconicInputStyle, appearance: 'none' }} 
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Batch</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <Clock size={18} style={iconInInput} />
                    <select 
                      style={{ ...iconicInputStyle, appearance: 'none' }} 
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
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Roll Number</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <Hash size={18} style={iconInInput} />
                    <input style={iconicInputStyle} type="text" placeholder="Roll No" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Structure Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', border: '1px solid #dcfce7', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#10b981' }} />
              
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem', color: '#1e293b' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', display: 'flex' }}>
                  <CreditCard size={20} color="#10b981" />
                </div>
                Fee Structure
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: formData.paymentPlan === 'Installments' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Payment Plan</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <CreditCard size={18} style={iconInInput} />
                    <select 
                      style={{ ...iconicInputStyle, appearance: 'none' }} 
                      value={formData.paymentPlan} 
                      onChange={e => setFormData({...formData, paymentPlan: e.target.value})}
                    >
                      <option value="Installments">Installments (EMI)</option>
                      <option value="One-Shot">One-Shot (Full Payment)</option>
                    </select>
                  </div>
                </div>
                {formData.paymentPlan === 'Installments' && (
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>No. of Installments</label>
                    <div className="input-glow" style={iconicInputContainer}>
                      <Hash size={18} style={iconInInput} />
                      <input 
                        style={iconicInputStyle} 
                        type="number" 
                        min="1"
                        placeholder="e.g. 3" 
                        value={formData.installmentsCount} 
                        onChange={e => setFormData({...formData, installmentsCount: e.target.value})} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: formData.paymentPlan === 'Installments' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Total Fee (₹)</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <div style={{ ...iconInInput, fontSize: '0.9rem', fontWeight: 700 }}>₹</div>
                    <input style={iconicInputStyle} type="number" placeholder="0.00" required value={formData.totalFee} onChange={e => setFormData({...formData, totalFee: e.target.value})} />
                  </div>
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Discount (₹)</label>
                  <div className="input-glow" style={iconicInputContainer}>
                    <div style={{ ...iconInInput, fontSize: '0.9rem', fontWeight: 700 }}>₹</div>
                    <input style={iconicInputStyle} type="number" placeholder="0.00" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                  </div>
                </div>
              </div>

              {Number(formData.discount) > 0 && (
                <div style={inputGroupStyle}>
                  <label style={{ ...labelStyle, color: '#2563eb' }}>Discount Remark (Required)</label>
                  <div className="input-glow" style={{ ...iconicInputContainer, borderStyle: 'dashed', borderColor: errors.discountRemark ? '#ef4444' : '#2563eb' }}>
                    <MapPin size={18} style={iconInInput} />
                    <input 
                      style={iconicInputStyle} 
                      type="text" 
                      placeholder="Why is this discount being applied?" 
                      required={Number(formData.discount) > 0}
                      value={formData.discountRemark} 
                      onChange={e => {
                        setFormData({...formData, discountRemark: e.target.value});
                        validateField('discountRemark', e.target.value);
                      }} 
                    />
                  </div>
                  {errors.discountRemark && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.discountRemark}</div>}
                </div>
              )}

              {formData.paymentPlan === 'Installments' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Down Payment (₹)</label>
                    <div className="input-glow" style={iconicInputContainer}>
                      <div style={{ ...iconInInput, fontSize: '0.9rem', fontWeight: 700 }}>₹</div>
                      <input style={iconicInputStyle} type="number" placeholder="Paid now" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} />
                    </div>
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Next Due Date</label>
                    <div className="input-glow" style={iconicInputContainer}>
                      <Calendar size={18} style={iconInInput} />
                      <input style={iconicInputStyle} type="date" required value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: formData.paymentMethod !== 'Cash' ? '1.2fr 1fr' : '1fr', gap: '1rem' }}>
                    <div className="input-glow" style={iconicInputContainer}>
                      <CreditCard size={18} style={iconInInput} />
                      <select 
                        style={{ ...iconicInputStyle, appearance: 'none' }} 
                        value={formData.paymentMethod} 
                        onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">Online / UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    {formData.paymentMethod !== 'Cash' && (
                      <div className="input-glow" style={iconicInputContainer}>
                        <input 
                          style={{ ...iconicInputStyle, paddingLeft: '1rem' }} 
                          type="text" 
                          placeholder="UTR / Txn ID" 
                          value={formData.utrNumber} 
                          onChange={e => setFormData({...formData, utrNumber: e.target.value})} 
                        />
                      </div>
                    )}
                </div>
              </div>

              {formData.paymentPlan === 'Installments' && Number(formData.installmentsCount) > 1 && (
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>Estimated Monthly EMI</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                      ₹{Math.ceil((Number(formData.totalFee) - Number(formData.discount) - Number(formData.paidAmount)) / Number(formData.installmentsCount)).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Plan</div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{formData.installmentsCount} Months</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Final Total Fee</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    ₹{(Number(formData.totalFee) - Number(formData.discount)).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 600 }}>Due Balance</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    ₹{formData.paymentPlan === 'One-Shot' ? '0' : (Number(formData.totalFee) - Number(formData.discount) - Number(formData.paidAmount)).toLocaleString()}
                  </div>
                </div>
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
              
              {notification.type === 'success' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => navigate('/id-cards')}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View All ID Cards
                  </button>
                  <button 
                    onClick={() => {
                      setNotification({ ...notification, show: false });
                      window.location.reload(); // Quick way to reset for next student
                    }}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add Another
                  </button>
                </div>
              )}
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

export default AddStudent;
