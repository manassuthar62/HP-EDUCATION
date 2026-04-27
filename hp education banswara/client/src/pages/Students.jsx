import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical, Mail, Phone, X, Eye } from 'lucide-react';
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const studentCourseIds = (student.courses || []).map(c => c.courseId?._id || c.courseId);
    const matchesCourse = !selectedCourse || studentCourseIds.includes(selectedCourse);
    
    return matchesSearch && matchesCourse;
  });

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Students...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <h1>Student Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/add-student')}>
          <Plus size={18} /> New Student
        </button>
      </div>

      <div className="data-table-container">
        <div style={{padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)'}}>
          <div style={{position: 'relative', flex: 1}}>
            <Search size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
            <input 
              type="text" 
              placeholder="Search students..." 
              style={{
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                backgroundColor: 'var(--primary-light)', 
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text-main)',
                outline: 'none'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <button className="btn" style={{backgroundColor: 'var(--primary-light)'}}>
            <Filter size={18} /> Filters
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Enrolled Courses</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.map(student => (
              <tr key={student._id}>
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
            ))}
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
