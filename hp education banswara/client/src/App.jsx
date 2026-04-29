import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Layers, Receipt, PieChart, Settings as SettingsIcon, Plus, Menu, X, Download, LogOut, CreditCard as IDIcon } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Reminders from './pages/Reminders';
import Login from './pages/Login';
import AddStudent from './pages/AddStudent';
import Courses from './pages/Courses';
import AddCourse from './pages/AddCourse';
import ManageBatches from './pages/ManageBatches';
import RecordPayment from './pages/RecordPayment';
import EditStudent from './pages/EditStudent';
import EditCourse from './pages/EditCourse';
import StudentDetails from './pages/StudentDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import IDCards from './pages/IDCards';



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className={`app-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <button 
          className="sidebar-toggle" 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Sidebar"
          style={{ left: isSidebarOpen ? '290px' : '1.5rem' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-logo-container">
            <img src="/hp logo.png" alt="HP Education" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} />
          </div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} end>
              <LayoutDashboard size={20} color="#3b82f6" strokeWidth={2.5} /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <Users size={20} color="#10b981" strokeWidth={2.5} /> <span>Students</span>
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <BookOpen size={20} color="#8b5cf6" strokeWidth={2.5} /> <span>Courses & Batches</span>
            </NavLink>
            <NavLink to="/fees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <Receipt size={20} color="#f59e0b" strokeWidth={2.5} /> <span>Fee Management</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <PieChart size={20} color="#ef4444" strokeWidth={2.5} /> <span>Reports</span>
            </NavLink>
            <NavLink to="/id-cards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <IDIcon size={20} color="#06b6d4" strokeWidth={2.5} /> <span>ID Cards</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
              <SettingsIcon size={20} color="#64748b" strokeWidth={2.5} /> <span>Settings</span>
            </NavLink>
          </nav>

          <div className="logout-btn-container">
            <button 
              onClick={handleLogout} 
              className="nav-link logout-link" 
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
            >
              <LogOut size={20} color="#dc2626" strokeWidth={2.5} /> <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content" style={{ marginLeft: isSidebarOpen ? '280px' : '0' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/edit-student/:id" element={<EditStudent />} />
            <Route path="/student-details/:id" element={<StudentDetails />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/add-course" element={<AddCourse />} />
            <Route path="/edit-course/:id" element={<EditCourse />} />
            <Route path="/manage-batches/:courseId" element={<ManageBatches />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/record-payment" element={<RecordPayment />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/id-cards" element={<IDCards />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
