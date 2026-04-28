import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const CustomAlert = ({ isOpen, onClose, type = 'info', title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="text-emerald-500" size={48} />,
          color: '#10b981',
          bg: '#ecfdf5'
        };
      case 'error':
        return {
          icon: <XCircle className="text-rose-500" size={48} />,
          color: '#f43f5e',
          bg: '#fff1f2'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="text-amber-500" size={48} />,
          color: '#f59e0b',
          bg: '#fffbeb'
        };
      case 'confirm':
        return {
          icon: <Info className="text-blue-500" size={48} />,
          color: '#3b82f6',
          bg: '#eff6ff'
        };
      default:
        return {
          icon: <Info className="text-slate-500" size={48} />,
          color: '#64748b',
          bg: '#f8fafc'
        };
    }
  };

  const config = getConfig();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        position: 'relative',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '1.5rem',
          color: config.color
        }}>
          {config.icon}
        </div>

        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.75rem'
        }}>
          {title || (type === 'success' ? 'Success!' : type === 'error' ? 'Oops!' : 'Notice')}
        </h2>

        <p style={{ 
          color: '#64748b', 
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {type === 'confirm' && (
            <button 
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
                flex: 1
              }}
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm || onClose}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: config.color,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1,
              boxShadow: `0 4px 14px 0 ${config.color}40`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CustomAlert;
