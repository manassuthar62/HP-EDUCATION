import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Reminders = () => {
  const navigate = useNavigate();
  const [upcomingFees, setUpcomingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(data => {
        setUpcomingFees(data.upcomingFees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Reminders...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button onClick={() => navigate(-1)} className="btn" style={{padding: '0.5rem', backgroundColor: 'var(--primary-light)'}}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>All Fee Reminders</h1>
            <p style={{color: 'var(--text-muted)'}}>Complete list of upcoming fee due dates.</p>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Contact</th>
              <th>Amount Due</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {upcomingFees.map(student => (
              <tr key={student._id}>
                <td style={{fontWeight: 600}}>{student.name}</td>
                <td>{student.courseName}</td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Phone size={14} color="var(--text-muted)" /> {student.contact}
                  </div>
                </td>
                <td style={{color: 'var(--error)', fontWeight: 700}}>
                  ₹{(student.nextEmi || 0).toLocaleString()}
                </td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Calendar size={14} color="var(--text-muted)" /> 
                    {student.dueDate ? new Date(student.dueDate).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                  <td>
                    <button 
                      onClick={() => navigate('/record-payment')}
                      className="btn btn-primary" 
                      style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}
                    >
                      Collect Fees
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reminders;
