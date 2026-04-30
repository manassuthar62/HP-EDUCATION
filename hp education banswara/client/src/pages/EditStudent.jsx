import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, BookOpen, Clock, CreditCard, Calendar, Hash } from 'lucide-react';
import API_URL from '../config';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseBatches, setSelectedCourseBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '', dob: '', fatherName: '', contact: '', alternateContact: '', email: '', address: '',
    courseName: '', batchName: '', rollNo: '',
    totalFee: '', discount: '0', paymentPlan: 'Installments', paidAmount: '0', installmentsCount: '1', nextDueDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses first
        const coursesRes = await fetch(`${API_URL}/academic/courses`);
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // Fetch student details
        const studentRes = await fetch(`${API_URL}/students/${id}`);
        const student = await studentRes.json();
        
        if (student) {
          const courseInfo = student.courses && student.courses.length > 0 ? student.courses[0] : {};
          
          setFormData({
            studentId: student.studentId || '',
            name: student.name || '',
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            fatherName: student.fatherName || '',
            contact: student.contact || '',
            alternateContact: student.alternateContact || '',
            email: student.email || '',
            address: student.address || '',
            courseName: courseInfo.courseId?.name || '',
            batchName: courseInfo.batchId?.name || '',
            rollNo: student.rollNo || '',
            totalFee: courseInfo.totalFee || '',
            discount: courseInfo.discount || '0',
            paymentPlan: courseInfo.paymentPlan || 'Installments',
            installmentsCount: courseInfo.installmentsCount || '1',
            nextDueDate: courseInfo.nextDueDate ? new Date(courseInfo.nextDueDate).toISOString().split('T')[0] : ''
          });

          // Set batches for the selected course
          if (courseInfo.courseId) {
            const course = coursesData.find(c => c._id === courseInfo.courseId._id);
            setSelectedCourseBatches(course ? course.batches : []);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCourseChange = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    if (course) {
      setFormData({
        ...formData,
        courseName: course.name,
        totalFee: course.baseFee.toString(),
        batchName: ''
      });
      setSelectedCourseBatches(course.batches || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find(c => c.name === formData.courseName);
      const selectedBatch = selectedCourseBatches.find(b => b.name === formData.batchName);

      const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courses: [{
            courseId: selectedCourse?._id,
            batchId: selectedBatch?._id,
            courseName: formData.courseName,
            batchName: formData.batchName,
            totalFee: Number(formData.totalFee),
            discount: Number(formData.discount),
            finalFee: Number(formData.totalFee) - Number(formData.discount),
            paymentPlan: formData.paymentPlan,
            installmentsCount: Number(formData.installmentsCount),
            nextDueDate: formData.nextDueDate
          }]
        })
      });

      if (response.ok) {
        alert('✅ Student Updated Successfully!');
        navigate('/students');
      } else {
        alert('❌ Error updating student');
      }
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Student Details...</div>;

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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Edit Student</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Update profile and academic information.</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: '0.75rem' }}>
          <Save size={20} /> Update Student
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
              <input style={inputStyle} type="text" value={formData.studentId} disabled />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Date of Birth</label>
              <input style={inputStyle} type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Father's Name</label>
              <input style={inputStyle} type="text" required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Phone size={16} /> Contact No</label>
                <input style={inputStyle} type="tel" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Phone size={16} /> Alternate No</label>
                <input style={inputStyle} type="tel" value={formData.alternateContact} onChange={e => setFormData({...formData, alternateContact: e.target.value})} />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}><Mail size={16} /> Email</label>
              <input style={inputStyle} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          {/* Academic Information */}
          <div className="stat-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent)" /> Academic Details
            </h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}><BookOpen size={16} /> Course Selection</label>
              <select style={inputStyle} required value={formData.courseName} onChange={e => handleCourseChange(e.target.value)}>
                <option value="">Select a Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Clock size={16} /> Batch</label>
                <select style={inputStyle} required value={formData.batchName} onChange={e => setFormData({...formData, batchName: e.target.value})}>
                  <option value="">Select a Batch</option>
                  {selectedCourseBatches.map(batch => (
                    <option key={batch._id} value={batch.name}>{batch.name} ({batch.time})</option>
                  ))}
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><Hash size={16} /> Roll Number</label>
                <input style={inputStyle} type="text" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
               <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--success)" /> Fee & Payment Plan
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Payment Plan</label>
                  <select style={inputStyle} value={formData.paymentPlan} onChange={e => setFormData({...formData, paymentPlan: e.target.value})}>
                    <option value="Installments">Installments</option>
                    <option value="One-Shot">One-Shot</option>
                  </select>
                </div>
                {formData.paymentPlan === 'Installments' && (
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Total Installments</label>
                    <input style={inputStyle} type="number" min="1" value={formData.installmentsCount} onChange={e => setFormData({...formData, installmentsCount: e.target.value})} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Total Fee (₹)</label>
                  <input style={inputStyle} type="number" value={formData.totalFee} onChange={e => setFormData({...formData, totalFee: e.target.value})} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Discount (₹)</label>
                  <input style={inputStyle} type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                </div>
              </div>

              {formData.paymentPlan === 'Installments' && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}><Calendar size={16} /> Next Due Date</label>
                  <input style={inputStyle} type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
