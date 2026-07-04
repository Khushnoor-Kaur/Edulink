import React, { useState, useEffect } from 'react';
import axios from 'react-items'; // Note: Ensure standard axios calls compile smoothly

function App() {
  // Authentication & View States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Core App Data States
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [tag, setTag] = useState('Info');

  const [resources, setResources] = useState([]);
  const [resTitle, setResTitle] = useState('');
  const [resLink, setResLink] = useState('');
  const [subject, setSubject] = useState('Math');
  
  // Analytics State
  const [analytics, setAnalytics] = useState({ metrics: {}, roster: [] });
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://edulink-backend-0l0y.onrender.com";

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      if (role === 'teacher') {
        axios.get(`${API_BASE}/api/teacher/analytics`)
          .then(res => setAnalytics(res.data))
          .catch(err => console.log(err));
      }
    }
  }, [isLoggedIn, role]);

  const fetchData = () => {
    axios.get(`${API_BASE}/api/announcements`).then((res) => setAnnouncements(res.data)).catch(err => console.log(err));
    axios.get(`${API_BASE}/api/resources`).then((res) => setResources(res.data)).catch(err => console.log(err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill out your login details!");
    setIsLoggedIn(true); // Fast mock login session validation
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return alert("Please fill out all announcement fields!");
    setLoading(true);
    axios.post(`${API_BASE}/api/announcements`, { title: annTitle, content: annContent, tag })
      .then(() => { fetchData(); setAnnTitle(''); setAnnContent(''); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handlePostResource = (e) => {
    e.preventDefault();
    if (!resTitle || !resLink) return alert("Please fill out all resource fields!");
    setLoading(true);
    axios.post(`${API_BASE}/api/resources`, { title: resTitle, link: resLink, subject })
      .then(() => { fetchData(); setResTitle(''); setResLink(''); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleDeleteResource = (id) => {
    if (!window.confirm("Are you sure you want to remove this study material?")) return;
    setLoading(true);
    axios.delete(`${API_BASE}/api/resources/${id}`)
      .then(() => { fetchData(); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // ================= 1. GORGEOUS REGISTRATION/LOGIN PORTAL VIEW =================
  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '440px', width: '100%', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3rem' }}>🎓</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '12px 0 6px 0', color: '#0f172a' }}>Welcome to EduLink</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Select your portal profile option to login</p>
          </div>

          {/* Clean Segmented Role Selector Slider Buttons */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '24px' }}>
            <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', backgroundColor: role === 'student' ? '#ffffff' : 'transparent', color: role === 'student' ? '#4f46e5' : '#64748b', boxShadow: role === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              👨‍🎓 Student
            </button>
            <button type="button" onClick={() => setRole('teacher')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', backgroundColor: role === 'teacher' ? '#ffffff' : 'transparent', color: role === 'teacher' ? '#4f46e5' : '#64748b', boxShadow: role === 'teacher' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              👩‍🏫 Teacher
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Security Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} required />
            </div>

            <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginTop: '10px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
              Sign In to {role === 'teacher' ? 'Faculty Suite' : 'Student Hub'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= 2. PREMIUM APP WORKSPACE VIEW (LOGGED IN) =================
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Dynamic Header Workspace Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.75rem' }}>🎓</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>EduLink<span style={{ color: '#6366f1' }}>.</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: role === 'teacher' ? '#047857' : '#1d4ed8', backgroundColor: role === 'teacher' ? '#d1fae5' : '#eff6ff', padding: '6px 14px', borderRadius: '20px' }}>
            {role === 'teacher' ? '👩‍🏫 Faculty Member' : '👨‍🎓 Student Mode'}
          </span>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* ================= TEACHER ANALYTICS & INSIGHTS PANEL (TEACHER ONLY) ================= */}
        {role === 'teacher' && (
          <div style={{ marginBottom: '40px', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 4px 0' }}>📈 Real-Time Class Insights</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>Review up-to-date grades and activity logs across active rosters.</p>
            
            {/* KPI Metric Layout Stat Grid Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Class Grade Average</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>{analytics.metrics.classAverage}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Daily Attendance Rate</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{analytics.metrics.attendanceRate}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Assignment Submissions</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>{analytics.metrics.submissions}</div>
              </div>
            </div>

            {/* Performance Roster List Presentation Table Container */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '1.05rem' }}>Active Student Performance Breakdown</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600' }}>Student Name</th>
                      <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600' }}>ID Code</th>
                      <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600' }}>Current Grade</th>
                      <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600' }}>Attendance Record</th>
                      <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600' }}>Standing Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.roster.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 24px', fontWeight: '600', color: '#1e293b' }}>{student.name}</td>
                        <td style={{ padding: '14px 24px', color: '#64748b' }}>{student.id}</td>
                        <td style={{ padding: '14px 24px', fontWeight: '700', color: '#4f46e5' }}>{student.grade}</td>
                        <td style={{ padding: '14px 24px', color: '#334155' }}>{student.attendance}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ backgroundColor: student.status === 'Excellent' ? '#d1fae5' : student.status === 'On Track' ? '#eff6ff' : '#fef2f2', color: student.status === 'Excellent' ? '#065f46' : student.status === 'On Track' ? '#1e40af' : '#991b1b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SYSTEM APP GRID SYSTEM ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: role === 'teacher' ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* MANAGEMENT CONTROLS SIDEBAR COLUMN (TEACHERS ONLY VIEW) */}
          {role === 'teacher' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700' }}>📢 Create Announcement</h3>
                <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <input type="text" placeholder="Notice Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  <textarea placeholder="Type details here..." rows="3" value={annContent} onChange={(e) => setAnnContent(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'none' }} />
                  <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                    <option value="Info">ℹ️ General Info</option>
                    <option value="Urgent">🚨 High Priority / Urgent</option>
                    <option value="Event">📅 Event Announcement</option>
                  </select>
                  <button type="submit" disabled={loading} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Publish Notice
                  </button>
                </form>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700' }}>📚 Share Study Material</h3>
                <form onSubmit={handlePostResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <input type="text" placeholder="Resource Name" value={resTitle} onChange={(e) => setResTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  <input type="url" placeholder="https://drive.google.com/..." value={resLink} onChange={(e) => setResLink(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                    <option value="Math">📐 Mathematics</option>
                    <option value="Physics">⚛️ Physics Core</option>
                    <option value="Chemistry">🧪 Chemistry Lab</option>
                    <option value="General">📝 General Elective</option>
                  </select>
                  <button type="submit" disabled={loading} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Upload Material
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SHARED COLLABORATION CLASS FEEDS COLUMN (VISIBLE TO ALL USERS ROLE TYPES) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', gridColumn: role === 'teacher' ? 'span 2' : 'span 3' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 20px 0' }}>📌 Institutional Notice Board</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {announcements.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: `5px solid ${item.tag === 'Urgent' ? '#ef4444' : item.tag === 'Event' ? '#f59e0b' : '#3b82f6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: item.tag === 'Urgent' ? '#ef4444' : item.tag === 'Event' ? '#b45309' : '#1d4ed8', backgroundColor: item.tag === 'Urgent' ? '#fef2f2' : item.tag === 'Event' ? '#fef3c7' : '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>
                        {item.tag}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 20px 0' }}>📂 Shared Class Materials</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {resources.map((res) => (
                  <div key={res.id} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>{res.subject}</span>
                      <h4 style={{ margin: '14px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{res.title}</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <a href={res.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem' }}>
                        Access Material ↗
                      </a>
                      {role === 'teacher' && (
                        <button onClick={() => handleDeleteResource(res.id)} disabled={loading} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;