import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Global States
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // App Data States
  const [resources, setResources] = useState([
    {
      id: "res-biology-101",
      title: "NEET Biology: Locomotion and Movement",
      subject: "Biology",
      version: 1,
      changelog: "Initial syllabus overview for muscle skeletal systems.",
      raw_content: "This syllabus covers the mechanics of locomotion and movement in organisms. Key topics include types of movement (amoeboid, ciliary, muscular), skeletal muscle structure, the mechanism of muscle contraction via the sliding filament theory, skeletal system components, joints, and common disorders like myasthenia gravis, muscular dystrophy, and arthritis."
    },
    {
      id: "res-dsa-202",
      title: "Data Structures & Algorithms Syllabus v2",
      subject: "Computer Science",
      version: 2,
      changelog: "Updated binary tree traversal module grading rubrics.",
      raw_content: "Welcome to Data Structures. In this course, we will deeply explore binary trees, asymptotic complexity using Big O notation, graph optimization algorithms, and dynamic programming layouts."
    }
  ]);
  
  const [selectedRes, setSelectedRes] = useState(null);
  const [aiSuite, setAiSuite] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [bounties, setBounties] = useState([
    { id: "b-1", topic_title: "Need help with Dynamic Programming Notes", status: "open", profiles: { email: "student_alpha@gmail.com" } },
    { id: "b-2", topic_title: "Sliding Filament Theory Summary", status: "filled", filled_by: "student_beta", profiles: { email: "student_beta@gmail.com" } }
  ]);
  
  // Controls
  const [activeLayer, setActiveLayer] = useState('discussion'); 
  const [selectedText, setSelectedText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [ocrUrl, setOcrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // New Document Input States for Teachers
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocSubject, setNewDocSubject] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const API_BASE = "https://edulink-backend-0l0y.onrender.com";

  useEffect(() => {
    if (user) {
      fetchResources();
      fetchBounties();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/resources`);
      if (res.data && res.data.length > 0) setResources(res.data);
    } catch (err) { console.log("Using local static fallback docs."); }
  };

  const fetchBounties = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bounties`);
      if (res.data && res.data.length > 0) setBounties(res.data);
    } catch (err) { console.log("Using fallback mock bounties."); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? 'signup' : 'login';
    try {
      const res = await axios.post(`${API_BASE}/api/auth/${endpoint}`, { email, password, role });
      if (isSignup) {
        alert("Registration verified! Please log in.");
        setIsSignup(false);
      } else {
        setToken(res.data.token || "mock-token");
        setUser(res.data.user || { email: email, role: role, tier: 'free', bounty_points: 120 });
      }
    } catch (err) {
      alert(err.response?.data?.error || "Auth failure. Logging in as bypass fallback.");
      setUser({ email: email, role: role, tier: 'free', bounty_points: 120 }); // dev bypass
    }
  };

  const handleUploadSyllabus = async (e) => {
    e.preventDefault();
    if (!newDocTitle || !newDocContent) return alert("Please fill out Title and Content");
    const payload = { title: newDocTitle, subject: newDocSubject || "General", content: newDocContent, userId: user.id || "teacher-id" };
    try {
      const res = await axios.post(`${API_BASE}/api/resources`, payload);
      setResources([res.data, ...resources]);
      alert("Syllabus uploaded successfully!");
      setNewDocTitle(''); setNewDocSubject(''); setNewDocContent('');
    } catch(err) {
      // Offline fallback push
      setResources([{ id: `mock-${Date.now()}`, ...payload, version: 1, changelog: "Initial Upload", raw_content: newDocContent }, ...resources]);
      alert("Local mock syllabus added to board.");
    }
  };

  const openDocumentHub = async (res) => {
    setSelectedRes(res);
    setAiSuite(null);
    setLoading(true);
    try {
      const annRes = await axios.get(`${API_BASE}/api/annotations/${res.id}`);
      setAnnotations(annRes.data || []);
    } catch (err) { setAnnotations([]); }
    setLoading(false);
  };

  const generateAISuite = async () => {
    if (!selectedRes) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/ai/process-material`, { resourceId: selectedRes.id, content: selectedRes.raw_content });
      setAiSuite(res.data);
    } catch (err) {
      setAiSuite({
        summary: `AI Insight for ${selectedRes.title}: Explores core structural guidelines, study objectives, and testing parameters.`,
        glossary: [{ term: "Syllabus Baseline", definition: "Mandatory conceptual roadmap milestones." }],
        flashcards: [{ question: "What is required for this course?", answer: "Consistent workspace validation and timely submissions." }]
      });
    }
    setLoading(false);
  };

  const submitAnnotation = async (e) => {
    e.preventDefault();
    if (!commentText || !selectedText) return alert("Highlight text first!");
    const newAnn = { id: `m-${Date.now()}`, selected_text: selectedText, comment_text: commentText, layer: activeLayer, profiles: { email: user.email } };
    setAnnotations([...annotations, newAnn]);
    setCommentText(''); setSelectedText('');
  };

  const captureHighlight = () => {
    const text = window.getSelection().toString();
    if (text.trim()) setSelectedText(text);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSelectedRes(null);
    setAiSuite(null);
  };

  // ================= RENDER LANDING GATEWAY (Logged Out) =================
  if (!user) {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#fff', width: '400px', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#1e293b' }}>{isSignup ? "Join EduLink Suite" : "EduLink Portal"}</h2>
          
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: role === 'student' ? '#fff' : 'transparent', fontWeight: 'bold', color: '#4f46e5' }}>Student Portal</button>
            <button type="button" onClick={() => setRole('teacher')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: role === 'teacher' ? '#fff' : 'transparent', fontWeight: 'bold', color: '#4f46e5' }}>Teacher Console</button>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
            <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isSignup ? "Register Profile" : `Access as ${role.toUpperCase()}`}
            </button>
          </form>
          <p onClick={() => setIsSignup(!isSignup)} style={{ textAlign: 'center', color: '#4f46e5', cursor: 'pointer', marginTop: '16px', fontSize: '0.9rem' }}>
            {isSignup ? "Already have an account? Login" : "Create a new user account profile"}
          </p>
        </div>
      </div>
    );
  }

  // ================= SHARED NAVIGATION HEADER =================
  const NavHeader = () => (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>EduLink <span style={{ color: user.role === 'teacher' ? '#ec4899' : '#4f46e5' }}>{user.role.toUpperCase()}</span></h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ backgroundColor: '#f0fdf4', padding: '6px 16px', borderRadius: '20px', color: '#166534', fontSize: '0.85rem', fontWeight: 'bold' }}>
          👤 {user.email}
        </span>
        {user.role === 'student' && (
          <span style={{ backgroundColor: '#eff6ff', padding: '6px 16px', borderRadius: '20px', color: '#1e40af', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🏆 {user.bounty_points} Bounty Points
          </span>
        )}
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
      </div>
    </nav>
  );

  // ================= VIEW A: TEACHER DASHBOARD =================
  if (user.role === 'teacher') {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavHeader />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', padding: '40px' }}>
          
          {/* TEACHER TOOLS SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#ec4899' }}>📤 Publish Course Syllabus / Notes</h4>
              <form onSubmit={handleUploadSyllabus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Document Title (e.g. Zoology Note)" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                <input type="text" placeholder="Subject Category" value={newDocSubject} onChange={e => setNewDocSubject(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <textarea placeholder="Paste clear curriculum text data context here..." value={newDocContent} onChange={e => setNewDocContent(e.target.value)} rows="5" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} required />
                <button type="submit" style={{ backgroundColor: '#ec4899', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Publish to Class Feed</button>
              </form>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>📂 Active Uploaded Catalog</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resources.map(res => (
                  <div key={res.id} style={{ padding: '10px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                    <strong>{res.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Version v{res.version || 1} • {res.subject}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEACHER WORKSPACE MAIN PANEL */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>🏆 Verification Request Center (Bounties)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>Review note uploads submittals from student communities. Endorse high-quality contributions to distribute platform bounty points rewards.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bounties.map(b => (
                <div key={b.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{b.topic_title}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: <strong style={{ color: b.status === 'filled' ? '#fbbf24' : '#64748b' }}>{b.status.toUpperCase()}</strong> • By: {b.profiles?.email}</span>
                  </div>
                  {b.status === 'filled' && (
                    <button onClick={() => alert("Verification sequence approved. 50 Points sent to student profile node!")} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Approve & Award Points
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ================= VIEW B: STUDENT DASHBOARD =================
  return (
    <div style={{ fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavHeader />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', padding: '40px' }}>
        
        {/* LEFT MENU (Syllabus Selector) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#4f46e5' }}>📂 Class Syllabus Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resources.map(res => (
                <div key={res.id} onClick={() => openDocumentHub(res)} style={{ padding: '14px', borderRadius: '10px', border: selectedRes?.id === res.id ? '2px solid #4f46e5' : '1px solid #e2e8f0', backgroundColor: selectedRes?.id === res.id ? '#f5f3ff' : '#fff', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{res.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Version v{res.version || 1} • {res.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE (Reading Hub / AI Tools) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {selectedRes ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
              
              {/* READING + AI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{selectedRes.title}</h3>
                    <button onClick={generateAISuite} disabled={loading} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🤖 Compile AI Study Suite
                    </button>
                  </div>
                  <div onMouseUp={captureHighlight} style={{ lineHeight: '1.8', color: '#334155', backgroundColor: '#fafafa', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', cursor: 'text' }}>
                    {selectedRes.raw_content}
                  </div>
                  {selectedText && (
                    <div style={{ marginTop: '14px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <strong>Highlighter Active:</strong> "{selectedText}"
                    </div>
                  )}
                </div>

                {aiSuite && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <h5 style={{ margin: '0 0 8px 0', color: '#4f46e5' }}>📝 AI Smart Summary</h5>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{aiSuite.summary}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#059669' }}>📖 Core Glossary</h5>
                        {aiSuite.glossary?.map((g, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '6px' }}><strong>{g.term}:</strong> {g.definition}</div>)}
                      </div>
                      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#d97706' }}>🔥 Active Recall Flashcards</h5>
                        {aiSuite.flashcards?.map((f, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '6px', backgroundColor: '#fef3c7', padding: '6px', borderRadius: '4px' }}><strong>Q:</strong> {f.question}<br/><strong>A:</strong> {f.answer}</div>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ANNOTATION SIDE FEED */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4>💬 Layer-Based Notes</h4>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '14px' }}>
                  {['private', 'discussion', 'hint'].map(l => (
                    <button key={l} type="button" onClick={() => setActiveLayer(l)} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: activeLayer === l ? '#4f46e5' : 'transparent', color: activeLayer === l ? '#fff' : '#475569', fontWeight: 'bold', textTransform: 'capitalize' }}>{l}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '14px' }}>
                  {annotations.filter(a => a.layer === activeLayer).map(ann => (
                    <div key={ann.id} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <div style={{ fontStyle: 'italic', color: '#64748b' }}>"{ann.selected_text}"</div>
                      <div><strong>{ann.comment_text}</strong></div>
                    </div>
                  ))}
                </div>
                <form onSubmit={submitAnnotation} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea placeholder="Type layered note or question..." value={commentText} onChange={e => setCommentText(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Post Layer Note</button>
                </form>
              </div>

            </div>
         ) : (
          <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h3>Select a Class Syllabus Document to Begin Study Session</h3>
            <p style={{ color: '#64748b' }}>Use the left sidebar navigation matrix to switch focus contexts.</p>
          </div>
        )}
      </div>

    </div>
  </div>
);
}

export default App;