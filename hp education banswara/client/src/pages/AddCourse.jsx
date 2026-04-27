import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Book, Clock, CreditCard, AlignLeft } from 'lucide-react';
import API_URL from '../config';

const AddCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', duration: '', baseFee: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/academic/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        navigate('/courses');
      }
    } catch (err) {
      console.error('Error adding course:', err);
    }
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.8rem 1.2rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' };

  return (
    <div className="animate-fade-in">
      <div className="header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/courses')} className="btn" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create New Course</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Define a new educational program for your academy.</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
          <Save size={20} /> Save Course
        </button>
      </div>

      <div className="stat-card" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}><Book size={18} color="var(--accent)" /> Course Full Name</label>
            <input 
              style={inputStyle} 
              type="text" 
              placeholder="e.g. DCA (Diploma in Computer Applications)" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><Clock size={18} color="var(--accent)" /> Duration</label>
              <input 
                style={inputStyle} 
                type="text" 
                placeholder="e.g. 6 Months" 
                required 
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})} 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><CreditCard size={18} color="var(--success)" /> Base Fee (₹)</label>
              <input 
                style={inputStyle} 
                type="number" 
                placeholder="0.00" 
                required 
                value={formData.baseFee} 
                onChange={e => setFormData({...formData, baseFee: e.target.value})} 
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}><AlignLeft size={18} color="var(--text-muted)" /> Course Description (Optional)</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
              placeholder="Provide a brief overview of what students will learn..." 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => navigate('/courses')} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.8rem 2rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
              <Save size={18} /> Save & Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
