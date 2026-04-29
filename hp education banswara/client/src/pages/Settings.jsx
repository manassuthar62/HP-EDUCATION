import React, { useState } from 'react';
import { Lock, Save, ShieldCheck } from 'lucide-react';
import API_URL from '../config';

const Settings = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

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
        alert('❌ Error: User not logged in correctly.');
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          oldPassword: formData.oldPassword
        })
      });

      const result = await response.json();
      if (response.ok && result.requiresOtp) {
        setShowOtp(true);
        alert('📩 OTP sent to your emails! Please verify.');
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (err) {
      console.error('Error initiating password change:', err);
      alert('❌ Connection Error');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/auth/verify-change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Password changed successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setShowOtp(false);
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
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

          <form onSubmit={showOtp ? handleVerifyOtp : handleSubmit}>
            {!showOtp ? (
              <>
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
                  {loading ? 'Processing...' : <><ShieldCheck size={18} /> Get OTP to Change</>}
                </button>
              </>
            ) : (
              <>
                <div style={{marginBottom: '2rem', textAlign: 'center'}}>
                  <p style={{color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem'}}>Check your emails for the 6-digit code.</p>
                  <label style={{...labelStyle, justifyContent: 'center'}}>Enter OTP</label>
                  <input 
                    type="text" 
                    style={{...inputStyle, textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem'}} 
                    required 
                    maxLength="6"
                    value={formData.otp} 
                    onChange={e => setFormData({...formData, otp: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%', padding: '1rem', gap: '0.5rem', marginBottom: '1rem'}}>
                  {loading ? 'Verifying...' : <><ShieldCheck size={18} /> Confirm & Update Password</>}
                </button>
                
                <button type="button" onClick={() => setShowOtp(false)} style={{width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer'}}>
                  Back
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
