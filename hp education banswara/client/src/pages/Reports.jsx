import React, { useState, useEffect } from 'react';
import { PieChart, Calendar, Download, Search, Receipt } from 'lucide-react';
import API_URL from '../config';

const Reports = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${API_URL}/fees`);
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    // Filter payments based on date range
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    to.setHours(23, 59, 59, 999); // End of the day

    const filtered = payments.filter(p => {
      const pDate = new Date(p.paymentDate);
      return pDate >= from && pDate <= to;
    });
    setFilteredPayments(filtered);
  }, [payments, dateRange]);

  const totalCollection = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleExport = () => {
    const headers = ['Receipt ID', 'Date', 'Student Name', 'Course', 'Amount', 'Method'];
    const csvData = filteredPayments.map(p => [
      p.receiptId,
      new Date(p.paymentDate).toLocaleDateString(),
      p.studentId?.name || 'N/A',
      p.courseId?.name || 'N/A',
      p.amount,
      p.paymentMethod
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Collection_Report_${dateRange.from}_to_${dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading Reports...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1>Reports & Analytics</h1>
          <p style={{color: 'var(--text-muted)'}}>Analyze collection and student data by date range.</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="stat-card" style={{padding: '1.5rem', marginBottom: '2rem'}}>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-end', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '200px'}}>
            <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
              <Calendar size={14} style={{marginRight: '5px'}} /> From Date
            </label>
            <input 
              type="date" 
              className="btn" 
              style={{width: '100%', textAlign: 'left', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)'}}
              value={dateRange.from}
              onChange={e => setDateRange({...dateRange, from: e.target.value})}
            />
          </div>
          <div style={{flex: 1, minWidth: '200px'}}>
            <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
              <Calendar size={14} style={{marginRight: '5px'}} /> To Date
            </label>
            <input 
              type="date" 
              className="btn" 
              style={{width: '100%', textAlign: 'left', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)'}}
              value={dateRange.to}
              onChange={e => setDateRange({...dateRange, to: e.target.value})}
            />
          </div>
          <div className="stat-card" style={{flex: 1, minWidth: '200px', padding: '1rem', backgroundColor: 'var(--primary-light)', border: 'none', textAlign: 'center'}}>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>Total Collection in Period</span>
            <span style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)'}}>₹{totalCollection.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {filteredPayments.length > 0 ? (
        <div className="data-table-container">
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Date</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p._id}>
                  <td style={{fontWeight: 600}}>{p.receiptId}</td>
                  <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td>{p.studentId?.name || 'N/A'}</td>
                  <td>{p.courseId?.name || 'N/A'}</td>
                  <td style={{fontWeight: 700}}>₹{p.amount.toLocaleString()}</td>
                  <td>
                    <span style={{backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem'}}>
                      {p.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stat-card" style={{padding: '4rem', textAlign: 'center'}}>
          <Search size={48} style={{margin: '0 auto 1rem', color: 'var(--text-muted)'}} />
          <h3>No transactions found for this period</h3>
          <p style={{color: 'var(--text-muted)'}}>Try selecting a wider date range.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
