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

  // Application Data States
  const [resources, setResources] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [aiSuite, setAiSuite] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [bounties, setBounties] = useState([]);
  
  // Active Creation Controls
  const [activeLayer, setActiveLayer] = useState('discussion'); // private, discussion, hint
  const [selectedText, setSelectedText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [ocrUrl, setOcrUrl] = useState('');
  const [bountyTitle, setBountyTitle] = useState('');
  const [loading, setLoading] = useState(false);

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
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  };

  const fetchBounties = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bounties`);
      setBounties(res.data);
    } catch (err) {
      console.error("Error fetching bounties:", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? 'signup' : 'login';
    try {
      const res = await axios.post(`${API_BASE}/api/auth/${endpoint}`, { email, password, role });
      if (isSignup) {
        alert(res.data.message || "Registration verified! Please log in.");
        setIsSignup(false);
      } else {
        setToken(res.data.token || "mock-token-xyz");
        
        // Solid validation fallback path if your backend sends a bare token signature back
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          setUser({
            email: email,
            role: role,
            tier: 'free',
            bounty_points: 0
          });
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Auth procedure failure.");
    }
  };

  const openDocumentHub = async (res) => {
    setSelectedRes(res);
    setAiSuite(null);
    setLoading(true);
    try {
      // Fetch annotations for this file
      const annRes = await axios.get(`${API_BASE}/api/annotations/${res.id}`);
      setAnnotations(annRes.data);
    } catch (err) {
      console.error("Error fetching annotations:", err);
    }
    setLoading(false);
  };

  const generateAISuite = async () => {
    if (!selectedRes) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/ai/process-material`, {
        resourceId: selectedRes.id,
        content: selectedRes.raw_content
      });
      setAiSuite(res.data);
    } catch (err) {
      alert("Error compiling AI engine components.");
    }
    setLoading(false);
  };

  const submitAnnotation = async (e) => {
    e.preventDefault();
    if (!commentText || !selectedText) return alert("Highlight text and add a comment description first!");
    
    try {
      const res = await axios.post(`${API_BASE}/api/annotations`, {
        resource_id: selectedRes.id,
        user_id: user.id || "manual-test-user-id",
        selected_text: selectedText,
        comment_text: commentText,
        layer: activeLayer
      });
      
      setAnnotations([...annotations, { ...res.data, profiles: { email: user.email } }]);
      setCommentText('');
      setSelectedText('');
    } catch (err) {
      alert("Failed to submit annotation layer entry.");
    }
  };

  const handleOcrUpload = async (e) => {
    e.preventDefault();
    if (!ocrUrl) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/resources/ocr-upload`, {
        imageUrl: ocrUrl,
        title: "OCR Compiled Tablet Document",
        subject: "General",
        userId: user.id || "manual-test-user-id"
      });
      setOcrUrl('');
      fetchResources();
      alert("Handwriting OCR scanned successfully!");
    } catch (err) {
      alert("OCR scanning system failed.");
    }
    setLoading(false);
  };

  // Capture selected text inside our document viewport window simulation
  const captureHighlight = () => {
    const text = window.getSelection().toString();
    if (text.trim()) setSelectedText(text);
  };

  // Gateway View Controller (Logged Out)
  if (!user) {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#fff', width: '400px', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>{isSignup ? "Join EduLink Suite" : "Login to EduLink"}</h2>
          
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: role === 'student' ? '#fff' : 'transparent', fontWeight: 'bold' }}>Student</button>
            <button type="button" onClick={() => setRole('teacher')} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: role === 'teacher' ? '#fff' : 'transparent', fontWeight: 'bold' }}>Teacher</button>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Campus Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
            <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isSignup ? "Register Profile" : "Login Workspace"}
            </button>
          </form>
          <p onClick={() => setIsSignup(!isSignup)} style={{ textAlign: 'center', color: '#4f46e5', cursor: 'pointer', marginTop: '16px', fontSize: '0.9rem' }}>
            {isSignup ? "Already have an account? Login" : "Create a new commercial enterprise profile"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* GLOBAL APPLICATION HEADER */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>EduLink <span style={{ color: '#4f46e5' }}>Pro</span></h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ backgroundColor: '#eff6ff', padding: '6px 16px', borderRadius: '20px', color: '#1e40af', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🏆 {user.bounty_points || 0} Bounty Points
          </span>
          <span style={{ backgroundColor: '#fef3c7', padding: '6px 16px', borderRadius: '20px', color: '#b45309', fontSize: '0.85rem', fontWeight: 'bold' }}>
            👑 Tier: {(user.tier || 'free').toUpperCase()}
          </span>
          <button onClick={() => { setUser(null); setToken(null); }} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      {/* CORE FRAMEWORK WORKSPACE DASHBOARD */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', padding: '40px' }}>
        
        {/* LEFT COMPILER NAVIGATION INTERFACE FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* SAAS TIERS PROMO CONTAINER CARD */}
          {(user.tier === 'free' || !user.tier) && (
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '20px', borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Upgrade to Premium Tier</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', opacity: 0.9 }}>Get access to unlimited file storage slots and prioritized OCR translation engines.</p>
              <button onClick={() => alert("Redirecting securely to Stripe Payment Gateway integration node...")} style={{ width: '100%', backgroundColor: '#fff', color: '#4f46e5', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Unlock for $9.99/mo</button>
            </div>
          )}

          {/* OCR SCATTERED IMAGE UPLOAD PORTAL CARD */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>📷 Scan iPad / Whiteboard Notes</h4>
            <form onSubmit={handleOcrUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="url" placeholder="Paste Note Image URL" value={ocrUrl} onChange={e => setOcrUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
              <button type="submit" disabled={loading} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? "Scanning..." : "Run Optical OCR Scan"}
              </button>
            </form>
          </div>

          {/* SHARED FILE MATERIALS CATALOG RESOURCE VIEW */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
            <h4 style={{ margin: '0 0 16px 0' }}>📂 Class Syllabus Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resources.length > 0 ? resources.map(res => (
                <div key={res.id} onClick={() => openDocumentHub(res)} style={{ padding: '14px', borderRadius: '10px', border: selectedRes?.id === res.id ? '2px solid #4f46e5' : '1px solid #e2e8f0', backgroundColor: selectedRes?.id === res.id ? '#f5f3ff' : '#fff', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{res.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Version v{res.version || 1} • {res.subject}</div>
                </div>
              )) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No shared materials available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE CONTENT MANAGER COMPONENT CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {selectedRes ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
              
              {/* PRIMARY DOCUMENT CONTEXT READING LAYERS ENGINE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{selectedRes.title}</h3>
                      {selectedRes.changelog && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>🔄 Changelog: {selectedRes.changelog}</span>}
                    </div>
                    <button onClick={generateAISuite} disabled={loading} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {loading ? "Compiling AI..." : "🤖 Compile AI Study Suite"}
                    </button>
                  </div>

                  {/* SIMULATED CONTEXT LAYER READ VIEW CONTAINER FOR TEXT SELECTION */}
                  <div onMouseUp={captureHighlight} style={{ lineHeight: '1.8', color: '#334155', backgroundColor: '#fafafa', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', cursor: 'text' }}>
                    {selectedRes.raw_content || "No raw context data embedded on this syllabus document structure node."}
                  </div>

                  {selectedText && (
                    <div style={{ marginTop: '20px', backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #2563eb', fontSize: '0.9rem' }}>
                      <strong>Selected Core Target Text:</strong> "{selectedText}"
                    </div>
                  )}
                </div>

                {/* AI COMPILATION RESPONSE PANELS INTERFACE LAYER */}
                {aiSuite && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#4f46e5' }}>📝 AI Smart Abstract Summary</h4>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>{aiSuite.summary}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#059669' }}>📖 Key Concept Terms Glossary</h4>
                        {aiSuite.glossary?.map((g, i) => (
                          <div key={i} style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                            <strong>{g.term}:</strong> {g.definition}
                          </div>
                        ))}
                      </div>
                      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#d97706' }}>🔥 Active Recall Study Flashcards</h4>
                        {aiSuite.flashcards?.map((f, i) => (
                          <div key={i} style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>
                            <div><strong>Q: {f.question}</strong></div>
                            <div style={{ marginTop: '4px', color: '#b45309' }}>A: {f.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLLABORATIVE LAYER ANNOTATIONS FEEDBAR */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ margin: 0 }}>💬 Layer-Based Document Notes</h4>
                
                {/* FILTER TOGGLE ACTION LAYER CONTROLS */}
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  {['private', 'discussion', 'hint'].map(layer => (
                    <button key={layer} type="button" onClick={() => setActiveLayer(layer)} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: activeLayer === layer ? '#4f46e5' : 'transparent', color: activeLayer === layer ? '#fff' : '#475569', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {layer}
                    </button>
                  ))}
                </div>

                {/* ANNOTATIONS CHANNELS STREAM FEED CONTENT LISTING */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {annotations.filter(a => a.layer === activeLayer).length > 0 ? (
                    annotations.filter(a => a.layer === activeLayer).map(ann => (
                      <div key={ann.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                        <div style={{ fontStyle: 'italic', color: '#64748b', marginBottom: '4px' }}>"{ann.selected_text}"</div>
                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{ann.comment_text}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>By: {ann.profiles?.email || 'Anonymous'}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>No annotations in this view layer layer.</p>
                  )}
                </div>

                {/* NOTE ADDITION BOX SUBMIT FORM LAYOUT */}
                <form onSubmit={submitAnnotation} style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <textarea placeholder="Type your context layer note or question description response..." value={commentText} onChange={e => setCommentText(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Post Note to {activeLayer.toUpperCase()} view
                  </button>
                </form>
              </div>

            </div>
          ) : (
            /* DEFAULT DASHBOARD: DISPLAY GAMIFIED P2P NOTE REQUEST BOARD */
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 6px 0' }}>🏆 Peer-to-Peer Note Verification & Bounty Center</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 24px 0' }}>Request missing notes from peers or fulfill open requests to earn bounty points toward certification badges.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bounties.length > 0 ? bounties.map(b => (
                  <div key={b.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0' }}>{b.topic_title}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: <strong>{b.status.toUpperCase()}</strong> • Requested By: {b.profiles?.email || 'System'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {b.status === 'open' && (
                        <button onClick={() => alert("Drop your drive link to claim this bounty verification sequence...")} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          Fulfill Request (+50 pts)
                        </button>
                      )}
                      {b.status === 'filled' && role === 'teacher' && (
                        <button onClick={async () => {
                          try {
                            await axios.post(`${API_BASE}/api/bounties/verify`, { bountyId: b.id, contributorId: b.filled_by });
                            fetchBounties();
                          } catch(err) {
                            alert("Failed to endorse bounty.");
                          }
                        }} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          Approve & Endorse
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No active bounty requests pending.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;