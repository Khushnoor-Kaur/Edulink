import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // States for Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [tag, setTag] = useState('Info');

  // States for Resources
  const [resources, setResources] = useState([]);
  const [resTitle, setResTitle] = useState('');
  const [resLink, setResLink] = useState('');
  const [subject, setSubject] = useState('Math');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://edulink-backend-0l0y.onrender.com').then((res) => setAnnouncements(res.data));
    axios.get('https://edulink-backend-0l0y.onrender.com').then((res) => setResources(res.data));
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return alert("Fill all notice fields!");
    axios.post('https://edulink-backend-0l0y.onrender.com', { title: annTitle, content: annContent, tag })
      .then(() => { fetchData(); setAnnTitle(''); setAnnContent(''); });
  };

  const handlePostResource = (e) => {
    e.preventDefault();
    if (!resTitle || !resLink) return alert("Fill all resource fields!");
    axios.post('https://edulink-backend-0l0y.onrender.com', { title: resTitle, link: resLink, subject })
      .then(() => { fetchData(); setResTitle(''); setResLink(''); });
  };

  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '30px 20px', boxSizing: 'border-box' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1e3a8a', margin: '0 0 5px 0' }}>EduLink 🎓</h1>
        <p style={{ color: '#475569', margin: 0 }}>Student & Teacher Collaboration Dashboard</p>
      </header>

      {/* Main Responsive Grid Layout */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
        
        {/* ================= LEFT SIDE: TEACHER FORMS ================= */}
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '25px', boxSizing: 'border-box' }}>
          
          {/* Post Notice Form */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>📢 New Announcement</h3>
            <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Notice Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Details..." rows="3" value={annContent} onChange={(e) => setAnnContent(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', resize: 'none' }} />
              <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                <option value="Info">ℹ️ Info</option>
                <option value="Urgent">🚨 Urgent</option>
                <option value="Event">📅 Event</option>
              </select>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Publish Notice</button>
            </form>
          </section>

          {/* Share Material Form */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>📚 Share Study Material</h3>
            <form onSubmit={handlePostResource} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Document Name (e.g., Chemistry Notes)" value={resTitle} onChange={(e) => setResTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="url" placeholder="Resource Link (URL)" value={resLink} onChange={(e) => setResLink(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                <option value="Math">📐 Math</option>
                <option value="Physics">⚛️ Physics</option>
                <option value="Chemistry">🧪 Chemistry</option>
                <option value="General">📝 General</option>
              </select>
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Upload Resource</button>
            </form>
          </section>
        </div>

        {/* ================= RIGHT SIDE: LIVE CONTENT BOARDS ================= */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '30px', boxSizing: 'border-box' }}>
          
          {/* Announcement Feed */}
          <main>
            <h2 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.4rem' }}>📌 Notice Board</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {announcements.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${item.tag === 'Urgent' ? '#ef4444' : '#3b82f6'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', color: '#64748b' }}>
                    <span style={{ fontWeight: 'bold', color: item.tag === 'Urgent' ? '#ef4444' : '#2563eb' }}>{item.tag.toUpperCase()}</span>
                    <span>{item.date}</span>
                  </div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.15rem' }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{item.content}</p>
                </div>
              ))}
            </div>
          </main>

          {/* Resource Repository Grid */}
          <section>
            <h2 style={{ color: '#0f172a', fontSize: '1.4rem' }}>📂 Shared Study Resources</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {resources.map((res) => (
                <div key={res.id} style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>{res.subject}</span>
                    <h4 style={{ margin: '10px 0', fontSize: '1.05rem', color: '#1e293b' }}>{res.title}</h4>
                  </div>
                  <a href={res.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', textDecoration: 'none', color: '#10b981', fontWeight: '600', fontSize: '0.9rem', marginTop: '10px' }}>
                    View Material ↗
                  </a>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

export default App;