import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [tag, setTag] = useState('Info');

  const [resources, setResources] = useState([]);
  const [resTitle, setResTitle] = useState('');
  const [resLink, setResLink] = useState('');
  const [subject, setSubject] = useState('Math');
  
  const [loading, setLoading] = useState(false);

  // YOUR LIVE RENDER URL
  const API_BASE = "https://edulink-backend-0l0y.onrender.com";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(`${API_BASE}/api/announcements`).then((res) => setAnnouncements(res.data)).catch(err => console.log(err));
    axios.get(`${API_BASE}/api/resources`).then((res) => setResources(res.data)).catch(err => console.log(err));
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

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Modern Sleek Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.75rem' }}>🎓</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', tracking: '-0.05em', color: '#0f172a' }}>EduLink<span style={{ color: '#6366f1' }}>.</span></span>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>🌐 Live Workspace</span>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Main Grid System */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* ================= LEFT SIDE: MANAGEMENT TOOLS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Announcement Form Component */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700' }}>📢 Create Announcement</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#64748b' }}>Broadcast notes or notices to the live student feed.</p>
              
              <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Notice Title</label>
                  <input type="text" placeholder="e.g., Midterm Examination Schedule" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                
                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Detailed Content</label>
                  <textarea placeholder="Type details here..." rows="3" value={annContent} onChange={(e) => setAnnContent(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'none' }} />
                </div>

                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Priority Tag</label>
                  <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                    <option value="Info">ℹ️ General Info</option>
                    <option value="Urgent">🚨 High Priority / Urgent</option>
                    <option value="Event">📅 Event Announcement</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
                  {loading ? 'Publishing Link...' : 'Publish Notice'}
                </button>
              </form>
            </div>

            {/* Resources Form Component */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '700' }}>📚 Share Study Material</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#64748b' }}>Instantly link course notes, drives, or formula guidelines.</p>
              
              <form onSubmit={handlePostResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Resource Name</label>
                  <input type="text" placeholder="e.g., Organic Chemistry Equations" value={resTitle} onChange={(e) => setResTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Resource Access URL</label>
                  <input type="url" placeholder="https://drive.google.com/..." value={resLink} onChange={(e) => setResLink(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ block: 'inline-block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Subject Track</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                    <option value="Math">📐 Mathematics</option>
                    <option value="Physics">⚛️ Physics Core</option>
                    <option value="Chemistry">🧪 Chemistry Lab</option>
                    <option value="General">📝 General Elective</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                  {loading ? 'Uploading...' : 'Upload Study Material'}
                </button>
              </form>
            </div>
          </div>

          {/* ================= RIGHT SIDE: LIVE FEED COLLABORATION ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', gridColumn: 'span 2' }}>
            
            {/* Notice Board Module */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>📌 Institutional Notice Board</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {announcements.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', borderLeft: `5px solid ${item.tag === 'Urgent' ? '#ef4444' : item.tag === 'Event' ? '#f59e0b' : '#3b82f6'}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)' }}>
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

            {/* Resource Repository Section */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 20px 0' }}>📂 Shared Class Materials</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {resources.map((res) => (
                  <div key={res.id} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>{res.subject}</span>
                      <h4 style={{ margin: '14px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{res.title}</h4>
                    </div>
                    <a href={res.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem', marginTop: '16px' }}>
                      Access Material ↗
                    </a>
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