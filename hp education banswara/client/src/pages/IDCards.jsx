import React, { useState, useEffect } from 'react';
import { Search, User, Download, CreditCard, ArrowLeft, Mail, Phone, Calendar, BookOpen, ShieldCheck, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import API_URL from '../config';

const IDCards = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, courseRes] = await Promise.all([
          fetch(`${API_URL}/students`),
          fetch(`${API_URL}/academic/courses`)
        ]);
        const studData = await studRes.json();
        const courseData = await courseRes.json();
        setStudents(studData);
        setCourses(courseData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = searchTerm && (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact.includes(searchTerm)
    );
    
    const matchesCourse = selectedCourse && s.courses?.some(c => c.courseId?._id === selectedCourse);
    
    return matchesSearch || matchesCourse;
  });

  const downloadIDCard = (student) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 86]
    });

    doc.setFillColor(255, 252, 243);
    doc.rect(0, 0, 54, 86, 'F');
    doc.setFillColor(249, 115, 22);
    doc.ellipse(0, 43, 6, 12, 'F');
    doc.ellipse(54, 43, 6, 12, 'F');
    doc.rect(0, 83, 54, 3, 'F');
    doc.addImage('/hp%20logo.png', 'PNG', 17, 2, 20, 15);
    doc.setDrawColor(154, 52, 18);
    doc.setLineWidth(0.3);
    doc.roundedRect(4, 17.5, 46, 5, 1, 1, 'D');
    doc.setTextColor(154, 52, 18); 
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('HP GROUP OF EDUCATION', 27, 21, { align: 'center' });
    doc.setFillColor(234, 179, 8); 
    doc.roundedRect(12, 23.5, 30, 4.5, 2.25, 2.25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5.5);
    doc.text('STUDENT ID CARD', 27, 26.7, { align: 'center' });
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 29, 24, 30, 1, 1, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, 29, 24, 30, 1, 1, 'D');
    doc.setTextColor(154, 52, 18);
    doc.setFontSize(7);
    const startY = 64;
    const lineHeight = 3.2;
    const labelX = 6;
    const valueX = 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Name', labelX, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(`:  ${student.name.toUpperCase()}`, valueX, startY);
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile', labelX, startY + lineHeight);
    doc.setFont('helvetica', 'normal');
    doc.text(`:  ${student.contact}`, valueX, startY + lineHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('ID No.', labelX, startY + (lineHeight * 2));
    doc.setFont('helvetica', 'normal');
    doc.text(`:  ${student.studentId}`, valueX, startY + (lineHeight * 2));
    doc.setFont('helvetica', 'bold');
    doc.text('Course', labelX, startY + (lineHeight * 3));
    doc.setFont('helvetica', 'normal');
    const courseName = student.courses?.[0]?.courseId?.name || 'N/A';
    doc.text(`:  ${courseName.substring(0, 20)}`, valueX, startY + (lineHeight * 3));
    doc.setFont('helvetica', 'bold');
    doc.text('Address', labelX, startY + (lineHeight * 4));
    doc.setFont('helvetica', 'normal');
    const address = student.address || 'Banswara, Rajasthan';
    doc.text(`:  ${address.substring(0, 25)}`, valueX, startY + (lineHeight * 4));
    doc.save(`${student.studentId}_ID_Card.pdf`);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 80px)', padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/')} className="btn" style={{ padding: '0.6rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <ArrowLeft size={22} color="#475569" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Student ID Cards</h1>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Filter & List Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 0 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select 
                  style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', appearance: 'none', backgroundColor: 'white' }}
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Filter by Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {!searchTerm && !selectedCourse ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.8rem' }}>Search name or course</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <p style={{ fontSize: '0.8rem' }}>No results</p>
              </div>
            ) : (
              <div>
                {filteredStudents.map(student => (
                  <div 
                    key={student._id} 
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.6rem',
                      border: '1px solid #f1f5f9',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: selectedStudent?._id === student._id ? '#fff7ed' : 'transparent',
                      borderColor: selectedStudent?._id === student._id ? '#f97316' : '#f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{student.studentId}</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadIDCard(student); }}
                      style={{ padding: '0.4rem', backgroundColor: '#fff7ed', color: '#f97316', border: 'none', borderRadius: '0.4rem', cursor: 'pointer' }}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Section - Always Visible */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'hidden' }}>
          {selectedStudent ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {/* DOWNLOAD BUTTON AT TOP */}
              <button 
                onClick={() => downloadIDCard(selectedStudent)}
                style={{ width: '320px', backgroundColor: '#f97316', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)', flexShrink: 0 }}
              >
                <Download size={18} /> Download ID Card (PDF)
              </button>

              <div style={{
                width: '320px',
                height: '480px',
                backgroundColor: '#fffdf3',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #fed7aa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ position: 'absolute', left: '-12px', top: '45%', width: '24px', height: '60px', backgroundColor: '#f97316', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', right: '-12px', top: '45%', width: '24px', height: '60px', backgroundColor: '#f97316', borderRadius: '50%' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <img src="/hp%20logo.png" alt="Logo" style={{ width: '100px', height: 'auto', marginBottom: '0.1rem', position: 'relative', top: '-10px' }} />
                  <div style={{ border: '1.5px solid #9a3412', padding: '0.25rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.95rem', fontWeight: 900, color: '#9a3412', backgroundColor: 'rgba(154, 52, 18, 0.05)', marginTop: '-5px' }}>
                    HP GROUP OF EDUCATION
                  </div>
                </div>

                <div style={{ backgroundColor: '#eab308', padding: '0.3rem 1.25rem', borderRadius: '2rem', color: 'white', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                   STUDENT ID CARD
                </div>

                <div style={{ width: '130px', height: '160px', backgroundColor: '#ffffff', border: '3px solid #f97316', borderRadius: '0.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={70} color="#fed7aa" />
                </div>

                <div style={{ width: '100%', padding: '0 0.5rem', color: '#9a3412' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '65px 10px 1fr', gap: '5px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 800 }}>Name</span><span>:</span><span style={{ fontWeight: 600 }}>{selectedStudent.name.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '65px 10px 1fr', gap: '5px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 800 }}>Mobile</span><span>:</span><span style={{ fontWeight: 600 }}>{selectedStudent.contact}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '65px 10px 1fr', gap: '5px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 800 }}>ID No.</span><span>:</span><span style={{ fontWeight: 600 }}>{selectedStudent.studentId}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '65px 10px 1fr', gap: '5px', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 800 }}>Course</span><span>:</span><span style={{ fontWeight: 600 }}>{selectedStudent.courses?.[0]?.courseId?.name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '65px 10px 1fr', gap: '5px', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 800 }}>Address</span><span>:</span><span style={{ fontWeight: 600, lineHeight: 1.1 }}>{selectedStudent.address || 'Banswara, Rajasthan'}</span>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10px', backgroundColor: '#f97316' }}></div>
              </div>
            </div>
          ) : (
            <div style={{ width: '320px', height: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '1.25rem', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
              <CreditCard size={48} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>Search or filter to<br/>preview ID card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IDCards;
