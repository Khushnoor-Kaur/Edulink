require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Third-Party Secure Connectors
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ================= HEALTH CHECK ENDPOINT =================
app.get('/', (req, res) => {
  res.status(200).send("EduLink Commercial Kernel Active");
});

// ================= AUTHENTICATION SUBSYSTEM =================
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, role } = req.body;
  
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  if (data.user) {
    await supabase.from('profiles').insert([
      { id: data.user.id, email: email.toLowerCase(), role, tier: 'free', bounty_points: 0 }
    ]);
  }
  res.status(201).json({ message: "Registration verified! Please log in." });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  res.status(200).json({ token: data.session.access_token, user: profile });
});

// ================= FEATURE 1: INTERACTIVE ANNOTATIONS =================
app.get('/api/annotations/:resourceId', async (req, res) => {
  const { data, error } = await supabase
    .from('annotations')
    .select('*, profiles(email)')
    .eq('resource_id', req.params.resourceId)
    .order('created_at', { ascending: true });
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/annotations', async (req, res) => {
  const { resource_id, user_id, selected_text, comment_text, layer, parent_id } = req.body;
  const { data, error } = await supabase
    .from('annotations')
    .insert([{ resource_id, user_id, selected_text, comment_text, layer, parent_id }])
    .select();
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// ================= FEATURE 2: AI SMART SUMMARIES & FLASHCARDS =================
app.post('/api/ai/process-material', async (req, res) => {
  const { resourceId, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "No content provided to analyze." });
  }

  try {
    const prompt = `
      Analyze the following academic document material and generate an actionable study suite structure in valid raw JSON.
      Do not wrap your output in markdown text blocks or write any introductory conversational sentences. Return only the string text object parsed as structural JSON formatting matching this scheme:
      {
        "summary": "Detailed summary paragraph encapsulating core concepts...",
        "glossary": [{"term": "Name of term", "definition": "Clear breakdown"}],
        "flashcards": [{"question": "Conceptual prompt?", "answer": "Core targeted insight"}]
      }
      ---
      MATERIAL TO PROCESS:
      ${content}
    `;

    // Correct SDK v2 call using the stateless client generation syntax
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Strip markdown formatting fences if returned by the model
    let cleanJsonString = response.text.trim();
    if (cleanJsonString.startsWith('```json')) cleanJsonString = cleanJsonString.replace(/^```json/, '').replace(/```$/, '');
    if (cleanJsonString.startsWith('```')) cleanJsonString = cleanJsonString.replace(/^```/, '').replace(/```$/, '');

    const generatedData = JSON.parse(cleanJsonString.trim());

    // Save or update entries within the database asset collection
    const { data, error } = await supabase
      .from('ai_study_assets')
      .upsert({
        resource_id: resourceId,
        summary: generatedData.summary,
        glossary: generatedData.glossary,
        flashcards: generatedData.flashcards
      })
      .select();

    if (error) throw error;
    res.json(data[0] || generatedData);
  } catch (err) {
    console.error("AI Generation Error: ", err);
    res.status(500).json({ error: "Failed to compile AI study suite elements." });
  }
});

// ================= FEATURE 3: VERSION CONTROL SYSTEM =================
app.post('/api/resources/update', async (req, res) => {
  const { resourceId, title, link, content, changelog } = req.body;

  const { data: current } = await supabase.from('resources').select('version').eq('id', resourceId).single();
  const nextVersion = current ? current.version + 1 : 2;

  const { data, error } = await supabase
    .from('resources')
    .update({ title, link, raw_content: content, version: nextVersion, changelog })
    .eq('id', resourceId)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// ================= FEATURE 4: OCR HANDWRITING EXTRACTION ENGINE =================
app.post('/api/resources/ocr-upload', async (req, res) => {
  const { imageUrl, title, subject, userId } = req.body;

  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
    
    const { data, error } = await supabase
      .from('resources')
      .insert([{ title, link: imageUrl, subject, raw_content: text, uploaded_by: userId }])
      .select();

    if (error) throw error;
    res.status(201).json({ resource: data[0], extractedText: text });
  } catch (err) {
    res.status(500).json({ error: "OCR processing failure during handwriting scanning." });
  }
});

// ================= FEATURE 5: GAMIFIED PEER STUDY BOUNTIES =================
app.get('/api/bounties', async (req, res) => {
  const { data } = await supabase.from('peer_notes').select('*, profiles(email)').order('upvotes', { ascending: false });
  res.json(data || []);
});

app.post('/api/bounties/claim', async (req, res) => {
  const { bountyId, noteLink, contributorId } = req.body;

  const { data, error } = await supabase
    .from('peer_notes')
    .update({ note_link: noteLink, filled_by: contributorId, status: 'filled' })
    .eq('id', bountyId)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

app.post('/api/bounties/verify', async (req, res) => {
  const { bountyId, contributorId } = req.body;

  await supabase.from('peer_notes').update({ status: 'verified' }).eq('id', bountyId);
  
  // Award 50 Bounty Points to the student contributor
  const { data: currentProfile } = await supabase.from('profiles').select('bounty_points').eq('id', contributorId).single();
  const currentPoints = currentProfile?.bounty_points || 0;

  await supabase.from('profiles').update({ bounty_points: currentPoints + 50 }).eq('id', contributorId);
  res.json({ message: "Note verified! 50 points awarded to contributor." });
});

// Core Dynamic Global Fetch Endpoints
app.get('/api/resources', async (req, res) => {
  const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post('/api/resources', async (req, res) => {
  const { title, link, subject, content, userId } = req.body;
  const { data } = await supabase.from('resources').insert([{ title, link, subject, raw_content: content, uploaded_by: userId }]).select();
  res.status(201).json(data[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EduLink Commercial Kernel active on port ${PORT}`));