import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, User, Eye, EyeOff } from 'lucide-react';
import API_URL from '../config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        if (data.requiresOtp) {
          setShowOtp(true);
          setMessage(data.message);
          // Show OTP Sent popup
          setPopupContent({ title: 'OTP Sent Successfully!', message: 'Please check your registered email.' });
          setShowSuccessPopup(true);
          setTimeout(() => setShowSuccessPopup(false), 3000);
        } else {
          loginSuccess(data.user);
        }
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection Error: Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
      });
      const data = await response.json();
      
      if (response.ok) {
        loginSuccess(data.user);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  const loginSuccess = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Show Login Successful popup
    setPopupContent({ title: 'Login Successful!', message: 'Welcome back to HP Education Admin Panel.' });
    setShowSuccessPopup(true);
    
    // Delay navigation and state update so user can see the popup
    setTimeout(() => {
      setShowSuccessPopup(false);
      onLogin(); // Update parent state after delay
      navigate('/');
    }, 2000);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => setIsForgot(false), 3000);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: '#f1f5f9'
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="/hp logo.png" alt="HP Education" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
          {isForgot ? 'Recover Password' : showOtp ? 'Verify OTP' : 'HP Education Admin'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {isForgot ? 'Enter your details to reset' : showOtp ? 'Enter the OTP sent to your email' : 'Please sign in to your account'}
        </p>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#b91c1c', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            border: '1px solid #fee2e2'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            color: '#15803d', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            border: '1px solid #dcfce7'
          }}>
            {message}
          </div>
        )}

        {!isForgot && !showOtp ? (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  required
                  placeholder="Username"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    color: '#1e293b',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    color: '#1e293b',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setIsForgot(true)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#2563eb' }}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>
        ) : showOtp ? (
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569', textAlign: 'center' }}>Enter 6-Digit OTP</label>
              <input 
                type="text" 
                required
                maxLength="6"
                placeholder="------"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  color: '#2563eb',
                  outline: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.5rem',
                  textAlign: 'center'
                }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#2563eb' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setShowOtp(false)}
              style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Username or Email</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  required
                  placeholder="Username or email"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    color: '#1e293b',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#2563eb' }}
            >
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setIsForgot(false)}
              style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Back to Login
            </button>
          </form>
        )}
        <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
          &copy; {new Date().getFullYear()} HP Group of Education. Secure Access Panel.
        </div>
      </div>

      {/* Stunning Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: 'slideDown 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1rem 2rem',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '2px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 800 }}>{popupContent.title}</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{popupContent.message}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -100%); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
