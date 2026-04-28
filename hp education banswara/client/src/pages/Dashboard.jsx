import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Clock, Users, Receipt, Layers, Bell, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import API_URL from '../config';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCollection: 0,
    pendingFees: 0,
    totalBatches: 0,
    recentTransactions: [],
    upcomingFees: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Dashboard Data...</div>;

  const chartData = [
    { name: 'Collected', value: stats.totalCollection, color: '#10b981' },
    { name: 'Pending', value: stats.pendingFees, color: '#ef4444' }
  ];

  const monthlyData = (stats.monthlyCollection && stats.monthlyCollection.length > 0) 
    ? stats.monthlyCollection 
    : [
        { name: 'Jan', collected: 0 },
        { name: 'Feb', collected: 0 },
        { name: 'Mar', collected: 0 },
        { name: 'Apr', collected: 0 },
      ];

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1>Welcome, Admin</h1>
          <p style={{color: 'var(--text-muted)'}}>Here's what's happening at HP Education today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-student')}>
          <Plus size={18} /> New Student
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card card-blue">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span className="stat-label">Total Students</span>
            <Users size={24} color="white" />
          </div>
          <span className="stat-value">{stats.totalStudents}</span>
          <span className="stat-trend"><TrendingUp size={14} /> 12% increase</span>
        </div>
        <div className="stat-card card-green">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span className="stat-label">Total Collection</span>
            <Receipt size={24} color="white" />
          </div>
          <span className="stat-value">₹{(stats.totalCollection || 0).toLocaleString()}</span>
          <span className="stat-trend"><TrendingUp size={14} /> 8.5% increase</span>
        </div>
        <div className="stat-card card-red">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span className="stat-label">Pending Fees</span>
            <Clock size={24} color="white" />
          </div>
          <span className="stat-value">₹{(stats.pendingFees || 0).toLocaleString()}</span>
          <span className="stat-trend"><TrendingDown size={14} /> 3.2% decrease</span>
        </div>
        <div className="stat-card card-purple">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span className="stat-label">Active Batches</span>
            <Layers size={24} color="white" />
          </div>
          <span className="stat-value">{stats.totalBatches}</span>
          <span className="stat-trend">Manage Batches & Courses</span>
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2.5rem'}}>
        <div className="stat-card" style={{borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer'}} onClick={() => navigate('/reminders')}>
          <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem'}}>
            <Bell size={20} color="var(--error)" />
            <h3 style={{fontSize: '1rem', color: 'var(--error)'}}>Fee Reminders (Due in 2 days)</h3>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {(stats.upcomingFees || []).slice(0, 2).map(fee => (
              <div key={fee.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)'}}>
                <div>
                  <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{fee.name}</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{fee.contact}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{color: 'var(--error)', fontWeight: 700, fontSize: '0.875rem'}}>{fee.amount}</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <Calendar size={12} /> {fee.dueDate}
                  </div>
                </div>
              </div>
            ))}
            {(stats.upcomingFees || []).length > 2 && (
              <button 
                className="btn" 
                onClick={(e) => { e.stopPropagation(); navigate('/reminders'); }}
                style={{backgroundColor: 'transparent', color: 'var(--accent)', fontSize: '0.875rem', padding: '0.5rem', justifyContent: 'center'}}
              >
                View {(stats.upcomingFees || []).length - 2} More Reminders...
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem'}}>
        <div className="stat-card" style={{height: '350px', cursor: 'pointer'}} onClick={() => navigate('/fees')}>
          <h3>Fee Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card" style={{height: '350px'}}>
          <h3>Monthly Collection</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)'}}
                itemStyle={{color: 'var(--text-main)'}}
              />
              <Bar dataKey="collected" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="rgba(239, 68, 68, 0.3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>Recent Transactions</h3>
          <button className="btn" style={{backgroundColor: 'var(--primary-light)'}} onClick={() => navigate('/fees')}>View All</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(stats.recentTransactions || []).length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No recent transactions found.</td></tr>
            ) : (
              (stats.recentTransactions || []).map(tx => (
                <tr key={tx._id}>
                  <td style={{fontWeight: 600}}>#{tx.receiptId || tx._id.slice(-6)}</td>
                  <td>{tx.studentId?.name || 'N/A'}</td>
                  <td>{tx.courseId?.name || 'N/A'}</td>
                  <td style={{fontWeight: 600}}>₹{tx.amount.toLocaleString()}</td>
                  <td>{tx.paymentDate ? new Date(tx.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem'}}>
                      {tx.status || 'Completed'}
                    </span>
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

export default Dashboard;
