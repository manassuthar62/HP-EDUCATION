import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, Clock, CreditCard, FileText } from 'lucide-react';
import API_URL from '../config';

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
          console.error('Course fetch failed:', data.message);
          alert('Error: Could not load course data.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course:', err);
        alert('Connection Error: Make sure server is running.');
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
        alert('✅ Course Updated Successfully!');
        navigate('/courses');
      } else {
        alert('❌ Error updating course');
      }
    } catch (err) {
      console.error('Error saving course:', err);
      alert('❌ Connection Error');
    }
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Course Data...</div>;

  return (
    <div className="animate-fade-in">
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

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
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
