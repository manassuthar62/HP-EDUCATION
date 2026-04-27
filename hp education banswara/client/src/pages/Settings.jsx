import React, { useState } from 'react';
import { Lock, Save, ShieldCheck } from 'lucide-react';
import API_URL from '../config';

const Settings = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.username) {
        alert('❌ Error: User not logged in correctly. Please Logout and Login again.');
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Password changed successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('❌ Connection Error');
    }
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem', marginTop: '0.5rem' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <h1>Settings</h1>
        <p style={{color: 'var(--text-muted)'}}>Manage your account and security preferences.</p>
      </div>

      <div style={{maxWidth: '600px', marginTop: '2rem'}}>
        <div className="stat-card" style={{padding: '2.5rem'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Lock size={20} color="var(--accent)" /> Change Admin Password
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={labelStyle}>Current Password</label>
              <input 
                type="password" 
                style={inputStyle} 
                required 
                value={formData.oldPassword} 
                onChange={e => setFormData({...formData, oldPassword: e.target.value})}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={labelStyle}>New Password</label>
              <input 
                type="password" 
                style={inputStyle} 
                required 
                value={formData.newPassword} 
                onChange={e => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={labelStyle}>Confirm New Password</label>
              <input 
                type="password" 
                style={inputStyle} 
                required 
                value={formData.confirmPassword} 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%', padding: '1rem', gap: '0.5rem'}}>
              {loading ? 'Changing...' : <><ShieldCheck size={18} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
