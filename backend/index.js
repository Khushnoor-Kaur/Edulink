const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the free Gemini client
// Replace 'YOUR_GEMINI_API_KEY' with the key you generated from Google AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let users = [
  { email: "teacher@school.edu", password: "password123", role: "teacher" },
  { email: "student@school.edu", password: "password123", role: "student" }
];

let announcements = [
  { id: 1, title: "🚀 Welcome to the New Semester!", content: "Make sure to check your class schedules and bring your laptops.", tag: "Info", date: "Just Now" },
  { id: 2, title: "🚨 Math Quiz on Friday", content: "Chapters 1 to 3 will be covered. Don't forget your calculators!", tag: "Urgent", date: "1 hour ago" }
];

// Added mock document content directly inside the resources to simulate text file content
let resources = [
  { 
    id: 1, 
    title: "Physics Unit 1 Notes", 
    link: "https://example.com/physics1", 
    subject: "Physics",
    content: "Newton's First Law states that an object remains at rest or in uniform motion unless acted upon by a force. Newton's Second Law defines force as mass times acceleration (F=ma). Newton's Third Law states that for every action, there is an equal and opposite reaction. Kinetic energy is calculated using 0.5 * m * v^2."
  },
  { 
    id: 2, 
    title: "Math Formula Cheat-Sheet", 
    link: "https://example.com/math-formulas", 
    subject: "Math",
    content: "The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. The area of a circle is πr². The Pythagorean theorem states that a² + b² = c² for a right-angled triangle. Derivative of x² is 2x."
  }
];

const studentPerformance = {
  metrics: { classAverage: "84.5%", attendanceRate: "92.1%", submissions: "96.4%" },
  roster: [
    { id: "S101", name: "Aarav Sharma", grade: "A", attendance: "95%", status: "Excellent" },
    { id: "S102", name: "Diya Patel", grade: "B+", attendance: "89%", status: "On Track" },
    { id: "S103", name: "Kabir Singh", grade: "A-", attendance: "94%", status: "Excellent" },
    { id: "S104", name: "Meera Reddy", grade: "C", attendance: "81%", status: "Needs Review" }
  ]
};

// ================= RAG AI CHAT ENDPOINT =================
app.post('/api/ai/chat', async (req, res) => {
  const { question, resourceId } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  // Look up the targeted study document
  const resource = resources.find(r => r.id === parseInt(resourceId));
  const referenceContext = resource ? resource.content : "No specific document selected.";

  try {
    // Structured engineering prompt passing the context dynamically (RAG)
    const prompt = `
      You are an expert, supportive AI Study Tutor helper inside the EduLink application. 
      Your task is to answer the student's question accurately based ONLY on the provided reference study material text below.
      If the answer cannot be found or inferred from the reference material, state that explicitly and offer general assistance.

      ---
      REFERENCE MATERIAL:
      ${referenceContext}
      ---

      STUDENT QUESTION: 
      ${question}

      AI TUTOR ANSWER:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error("Gemini RAG API Error:", error);
    res.status(500).json({ error: "AI Tutor had trouble parsing that. Please check your API key config." });
  }
});

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, role } = req.body;
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Account already exists!" });
  }
  const newUser = { email: email.toLowerCase(), password, role };
  users.push(newUser);
  res.status(201).json({ message: "Registration successful!", role: newUser.role });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials!" });
  res.status(200).json({ message: "Login successful!", role: user.role });
});

// App content management routes
app.get('/api/announcements', (req, res) => res.json(announcements));
app.post('/api/announcements', (req, res) => {
  const newAnn = { id: announcements.length + 1, title: req.body.title, content: req.body.content, tag: req.body.tag || "Info", date: "Just Now" };
  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

app.get('/api/resources', (req, res) => res.json(resources));
app.post('/api/resources', (req, res) => {
  const newRes = { 
    id: resources.length + 1, 
    title: req.body.title, 
    link: req.body.link, 
    subject: req.body.subject || "General",
    content: `Custom reference material notes for ${req.body.title}. Ensure to review core formulas.`
  };
  resources.unshift(newRes);
  res.status(201).json(newRes);
});

app.delete('/api/resources/:id', (req, res) => {
  resources = resources.filter(item => item.id !== parseInt(req.params.id));
  res.status(200).json({ message: "Removed" });
});

app.get('/api/teacher/analytics', (req, res) => res.json(studentPerformance));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Brain running on port ${PORT}`));