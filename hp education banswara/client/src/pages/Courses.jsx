import React, { useState, useEffect } from 'react';
import { Plus, Book, Clock, DollarSign, X, Save, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/academic/courses`);
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleManageBatches = (courseId) => {
    navigate(`/manage-batches/${courseId}`);
  };

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Courses...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header" style={{marginBottom: '2rem'}}>
        <div>
          <h1>Course & Batch Management</h1>
          <p style={{color: 'var(--text-muted)'}}>Define courses and their respective batches.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-course')}>
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="stats-grid" style={{marginBottom: '2rem'}}>
        <div className="stat-card">
          <span className="stat-label">Total Courses</span>
          <span className="stat-value">{courses.length}</span>
        </div>
      </div>

      <div className="data-table-container">
        <table>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Duration</th>
              <th>Base Fee</th>
              <th>Description</th>
              <th>Batches</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>No courses found. Add your first course to get started!</td></tr>
            ) : (
              courses.map(course => (
                <tr key={course._id}>
                  <td style={{fontWeight: 600}}>{course.name}</td>
                  <td>{course.duration}</td>
                  <td style={{fontWeight: 600}}>₹{course.baseFee.toLocaleString()}</td>
                  <td style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>{course.description || 'N/A'}</td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <button 
                        onClick={() => navigate(`/edit-course/${course._id}`)}
                        className="btn" 
                        style={{padding: '0.4rem', backgroundColor: 'var(--primary-light)', color: 'var(--accent)'}}
                        title="Edit Course"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn" 
                        style={{padding: '0.5rem 1rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--accent)'}}
                        onClick={() => navigate(`/manage-batches/${course._id}`)}
                      >
                        Manage Batches ({course.batches?.length || 0})
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
