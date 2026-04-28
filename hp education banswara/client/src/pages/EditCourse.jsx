import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, Clock, CreditCard, FileText, Trash2 } from 'lucide-react';
import API_URL from '../config';
import CustomAlert from '../components/CustomAlert';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    baseFee: '',
    description: ''
  });

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_URL}/academic/courses/${id}`);
        const data = await response.json();
        if (response.ok) {
          setFormData({
            name: data.name || '',
            duration: data.duration || '',
            baseFee: data.baseFee || '',
            description: data.description || ''
          });
        } else {
          showAlert('error', 'Fetch Failed', data.message || 'Could not load course data.');
        }
        setLoading(false);
      } catch (err) {
        showAlert('error', 'Connection Error', 'Make sure server is running.');
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/academic/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showAlert('success', 'Updated!', 'Course Updated Successfully!', () => navigate('/courses'));
      } else {
        showAlert('error', 'Error', 'Error updating course');
      }
    } catch (err) {
      console.error('Error saving course:', err);
      showAlert('error', 'Connection Error', 'Something went wrong.');
    }
  };

  const handleDeleteCourse = async () => {
    showAlert('confirm', 'Are you sure?', 'This action cannot be undone. All data for this course will be lost.', async () => {
      try {
        const response = await fetch(`${API_URL}/academic/courses/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok) {
          showAlert('success', 'Deleted!', 'Course Deleted Successfully!', () => navigate('/courses'));
        } else {
          showAlert('error', 'Delete Failed', result.message || 'Could not delete course');
        }
      } catch (err) {
        console.error('Error deleting course:', err);
        showAlert('error', 'Connection Error', 'Could not connect to server.');
      }
    });
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Course Data...</div>;

  return (
    <div className="animate-fade-in">
      <CustomAlert 
        {...alertConfig} 
        onClose={closeAlert} 
      />

      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/courses')} className="btn" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Edit Course</h1>
            <p style={{ color: 'var(--text-muted)' }}>Update course details and pricing.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div className="stat-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><BookOpen size={18} /> Course Name</label>
              <input 
                style={inputStyle} 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><Clock size={18} /> Duration (e.g. 6 Months)</label>
              <input 
                style={inputStyle} 
                type="text" 
                required 
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})} 
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}><CreditCard size={18} /> Base Fee (₹)</label>
            <input 
              style={inputStyle} 
              type="number" 
              required 
              value={formData.baseFee} 
              onChange={e => setFormData({...formData, baseFee: e.target.value})} 
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}><FileText size={18} /> Description</label>
            <textarea 
              style={{...inputStyle, height: '100px', resize: 'vertical'}} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleDeleteCourse} className="btn" style={{ padding: '0.8rem 1.5rem', color: 'var(--danger)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={18} /> Delete Course
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
              <Save size={20} /> Update Course
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
