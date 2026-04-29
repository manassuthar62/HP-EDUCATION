import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical, Mail, Phone, X, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(`${API_URL}/students`);
        const studentData = await studentRes.json();
        setStudents(Array.isArray(studentData) ? studentData : []);

        const courseRes = await fetch(`${API_URL}/academic/courses`);
        const courseData = await courseRes.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/students/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setStudents(students.filter(s => s._id !== id));
          alert('✅ Student deleted successfully');
        } else {
          alert('❌ Error deleting student');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('❌ Connection Error');
      }
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      // Fetch all fees to calculate balance
      const feesRes = await fetch(`${API_URL}/fees`);
      const feesData = await feesRes.json();
      const allFees = Array.isArray(feesData) ? feesData : [];

      const dataToExport = filteredStudents.map(student => {
        const course = student.courses && student.courses[0];
        const studentFees = allFees.filter(f => f.studentId?._id === student._id);
        const paid = studentFees.reduce((sum, f) => sum + f.amount, 0);
        const total = course?.finalFee || 0;
        const balance = total - paid;

        return {
          'Student_ID': student.studentId,
          'Name': student.name,
          'Father_Name': student.fatherName,
          'Contact': student.contact,
          'Email': student.email || 'N/A',
          'Course': course?.courseName || course?.courseId?.name || 'N/A',
          'Batch': course?.batchName || course?.batchId?.name || 'N/A',
          'Total_Fee': total,
          'Paid_Fee': paid,
          'Balance': balance,
          'Address': student.address || 'N/A',
          'Status': student.status
        };
      });

      if (dataToExport.length === 0) {
        alert('No data to export');
        setLoading(false);
        return;
      }

      // Generate CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Students_Report_${selectedCourse ? 'Course_Wise' : 'All'}_${(() => { const d = new Date(); return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`; })()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    } catch (err) {
      console.error('Export Error:', err);
      alert('❌ Error exporting data');
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = student.name?.toLowerCase().includes(searchLower) || 
                         student.studentId?.toLowerCase().includes(searchLower) ||
                         student.contact?.includes(searchTerm);
    
    // If user is searching, show results from any course
    if (searchTerm.trim() !== '') {
      return matchesSearch;
    }

    // If no search, filter by selected course
    if (!selectedCourse) return false;

    const studentCourseIds = (student.courses || []).map(c => c.courseId?._id || c.courseId);
    const matchesCourse = studentCourseIds.includes(selectedCourse);
    
    return matchesSearch && matchesCourse;
  });

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Students...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Student Management</h1>
          {selectedCourse && (
            <p style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Total Students in this Course: {filteredStudents.length}
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-student')}>
          <Plus size={18} /> New Student
        </button>
      </div>

      <div className="data-table-container" style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by Name, Mobile or ID..." 
                style={{
                  width: '100%', 
                  padding: '0.85rem 1rem 0.85rem 2.75rem', 
                  backgroundColor: '#ffffff', 
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                className="input-glow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  padding: '0.85rem 2.5rem 0.85rem 2.75rem',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '220px',
                  appearance: 'none'
                }}
                className="input-glow"
              >
                <option value="">--- All Courses ---</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            className="btn" 
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.85rem 1.5rem', 
              borderRadius: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)'
            }}
            onClick={handleDownloadExcel}
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
        <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>S.N.</th>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Student Details</th>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Contact Info</th>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Enrolled Courses</th>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={student._id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{index + 1}</td>
                  <td>
                    <div style={{fontWeight: 600}}>{student.name}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>ID: {student.studentId}</div>
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'}}>
                      <Mail size={14} color="var(--text-muted)" /> {student.email || 'N/A'}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'}}>
                      <Phone size={14} color="var(--text-muted)" /> {student.contact}
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem'}}>
                      {(student.courses || []).map((c, i) => (
                        <span key={i} style={{backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem'}}>
                          {c.courseName} ({c.batchName})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      color: student.status === 'Active' ? 'var(--success)' : 'var(--text-muted)',
                      backgroundColor: student.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => navigate(`/student-details/${student._id}`)}
                        title="View Details"
                        style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', backgroundColor: 'var(--primary-light)', padding: '0.4rem', borderRadius: '0.5rem'}}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)}
                        title="Delete Student"
                        style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem', borderRadius: '0.5rem'}}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="no-results">
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {searchTerm 
                    ? `No students found matching "${searchTerm}"` 
                    : selectedCourse 
                      ? 'No students found in this course.' 
                      : 'Search by Name/Mobile or select a course to view students.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Add this CSS-in-JS or separate CSS for modal
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '2rem'
};

const modalContentStyle = {
  backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem',
  width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--border)'
};

const inputGroupStyle = { marginBottom: '1rem', flex: 1 };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' };
const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--primary-light)', color: 'var(--text-main)', outline: 'none' };

export default Students;
