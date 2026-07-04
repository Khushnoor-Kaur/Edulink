const express = require('express');
const cors = require('cors');
const app = express();

// Allow connections from everywhere so Vercel doesn't get blocked
app.use(cors());
app.use(express.json());

let announcements = [
  { id: 1, title: "🚀 Welcome to the New Semester!", content: "Make sure to check your class schedules and bring your laptops.", tag: "Info", date: "Just Now" },
  { id: 2, title: "🚨 Math Quiz on Friday", content: "Chapters 1 to 3 will be covered. Don't forget your calculators!", tag: "Urgent", date: "1 hour ago" }
];

let resources = [
  { id: 1, title: "Physics Unit 1 Notes", link: "https://example.com/physics1", subject: "Physics" },
  { id: 2, title: "Math Formula Cheat-Sheet", link: "https://example.com/math-formulas", subject: "Math" }
];

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
    subject: req.body.subject || "General"
  };
  resources.unshift(newRes);
  res.status(201).json(newRes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Brain running on port ${PORT}`));