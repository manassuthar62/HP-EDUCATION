import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, User, Save, Trash2, BookOpen } from 'lucide-react';
import API_URL from '../config';

const ManageBatches = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBatch, setNewBatch] = useState({ name: '', time: '', faculty: '' });

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/academic/courses`);
      const data = await response.json();
      const currentCourse = data.find(c => c._id === courseId);
      setCourse(currentCourse);
      fetchBatchDetails(); // Fetch batches separately
    } catch (err) {
      console.error('Error fetching course:', err);
      setLoading(false);
    }
  };

  const fetchBatchDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/academic/batches/${courseId}`);
      const data = await response.json();
      console.log('Fetched Batches:', data);
      setBatches(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending Batch Data:', { ...newBatch, courseId });
      const response = await fetch(`${API_URL}/academic/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBatch, courseId })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Batch Saved Successfully!');
        setNewBatch({ name: '', time: '', faculty: '' });
        fetchBatchDetails(); // Just refresh batches
      } else {
        alert('❌ Error: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding batch:', err);
      alert('❌ Connection Error: Backend is not responding');
    }
  };

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Batches...</div>;
  if (!course) return <div style={{padding: '2rem', textAlign: 'center'}}>Course not found!</div>;

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' };
  const inputStyle = { width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none' };

  return (
    <div className="animate-fade-in">
      <div className="header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/courses')} className="btn" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-light)', borderRadius: '0.75rem' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Batches</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Course: <span style={{color: 'var(--accent)', fontWeight: 600}}>{course.name}</span></p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Batches List */}
        <div>
          <div className="stat-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent)" /> Current Batches
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {batches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No batches created for this course yet.</p>
                </div>
              ) : (
                batches.map(batch => (
                  <div key={batch._id} style={{ padding: '1.25rem', backgroundColor: 'var(--primary-light)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{batch.name}</div>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {batch.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> {batch.faculty || 'No Faculty'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add New Batch Form */}
        <div>
          <div className="stat-card" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--success)" /> Add New Batch
            </h3>
            <form onSubmit={handleAddBatch}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Batch Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Morning Batch A" required value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Batch Timing</label>
                <input style={inputStyle} type="text" placeholder="e.g. 8:00 AM - 10:00 AM" required value={newBatch.time} onChange={e => setNewBatch({...newBatch, time: e.target.value})} />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Faculty / Teacher</label>
                <input style={inputStyle} type="text" placeholder="Assigned Teacher" value={newBatch.faculty} onChange={e => setNewBatch({...newBatch, faculty: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.75rem' }}>
                <Save size={18} /> Save & Add Batch
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBatches;
