const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'choices.json');

// Ensure file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper to read/write
function readChoices() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('read error', e);
    return [];
  }
}
function writeChoices(arr) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
  } catch (e) {
    console.error('write error', e);
  }
}

// POST /api/choice  -> { book: {...}, action: "like"|"dislike", timestamp: 123456789 }
app.post('/api/choice', (req, res) => {
  const { book, action, timestamp } = req.body;
  if (!book || !action) return res.status(400).json({ error: 'book and action required' });

  const choices = readChoices();
  choices.push({ book, action, timestamp: timestamp || Date.now() });
  writeChoices(choices);

  return res.json({ ok: true, saved: { bookId: book.id, action } });
});

// GET /api/choices -> returns all saved choices
app.get('/api/choices', (req, res) => {
  const choices = readChoices();
  res.json(choices);
});

// Simple aggregated summary (counts, last few)
app.get('/api/summary', (req, res) => {
  const choices = readChoices();
  const summary = { total: choices.length, liked: 0, disliked: 0, last: [] };
  summary.liked = choices.filter(c => c.action === 'like').length;
  summary.disliked = choices.filter(c => c.action === 'dislike').length;
  summary.last = choices.slice(-10).reverse();
  res.json(summary);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BookScout backend listening on http://localhost:${PORT}`));
