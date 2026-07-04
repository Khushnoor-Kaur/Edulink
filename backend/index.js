const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory database array for users (Resets on backend reload)
let users = [
  { email: "teacher@school.edu", password: "password123", role: "teacher" },
  { email: "student@school.edu", password: "password123", role: "student" }
];

let announcements = [
  { id: 1, title: "🚀 Welcome to the New Semester!", content: "Make sure to check your class schedules and bring your laptops.", tag: "Info", date: "Just Now" },
  { id: 2, title: "🚨 Math Quiz on Friday", content: "Chapters 1 to 3 will be covered. Don't forget your calculators!", tag: "Urgent", date: "1 hour ago" }
];

let resources = [
  { id: 1, title: "Physics Unit 1 Notes", link: "https://example.com/physics1", subject: "Physics" },
  { id: 2, title: "Math Formula Cheat-Sheet", link: "https://example.com/math-formulas", subject: "Math" }
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

// ================= AUTHENTICATION ROUTES =================

// Signup Route
app.post('/api/auth/signup', (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(400).json({ error: "An account with this email already exists!" });
  }

  const newUser = { email: email.toLowerCase(), password, role };
  users.push(newUser);
  res.status(201).json({ message: "Registration successful!", role: newUser.role });
});

// Login Route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing login details" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or security password!" });
  }

  res.status(200).json({ message: "Login successful!", role: user.role, email: user.email });
});

// Announcements
app.get('/api/announcements', (req, res) => res.json(announcements));
app.post('/api/announcements', (req, res) => {
  const newAnn = { id: announcements.length + 1, title: req.body.title, content: req.body.content, tag: req.body.tag || "Info", date: "Just Now" };
  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

// Resources
app.get('/api/resources', (req, res) => res.json(resources));
app.post('/api/resources', (req, res) => {
  const newRes = { id: resources.length + 1, title: req.body.title, link: req.body.link, subject: req.body.subject || "General" };
  resources.unshift(newRes);
  res.status(201).json(newRes);
});
app.delete('/api/resources/:id', (req, res) => {
  const resourceId = parseInt(req.params.id);
  resources = resources.filter(item => item.id !== resourceId);
  res.status(200).json({ message: "Resource successfully removed", id: resourceId });
});

app.get('/api/teacher/analytics', (req, res) => res.json(studentPerformance));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Brain running on port ${PORT}`));