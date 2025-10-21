require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { z } = require('zod');

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '..', 'data', 'babybloom.db');

fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });

const db = new Database(DB_PATH);

// Initialize tables
const initSql = `
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  due_date TEXT,
  trimester INTEGER,
  wellness_prefs TEXT,
  onboarding_completed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  target_week INTEGER,
  achieved_at TEXT,
  photo_path TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
`;
db.exec(initSql);

// Seed tips if empty
const tipsCount = db.prepare('SELECT COUNT(*) as c FROM tips').get().c;
if (tipsCount === 0) {
  const insertTip = db.prepare('INSERT INTO tips(stage, title, content) VALUES (?, ?, ?)');
  const seed = db.transaction((rows) => {
    for (const r of rows) insertTip.run(r.stage, r.title, r.content);
  });
  seed([
    { stage: 'pregnancy-trimester-1', title: 'First Trimester Nutrition', content: 'Small frequent meals can help ease nausea.' },
    { stage: 'pregnancy-trimester-2', title: 'Stay Active', content: 'Light exercise like walking supports health and mood.' },
    { stage: 'pregnancy-trimester-3', title: 'Sleep Support', content: 'Side sleeping with pillows can improve comfort.' },
    { stage: 'newborn-0-3', title: 'Tummy Time', content: 'A few minutes of supervised tummy time daily builds strength.' },
  ]);
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// utils
function createToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const loginSchema = registerSchema;
const quizSchema = z.object({
  dueDate: z.string().optional(),
  trimester: z.number().int().min(1).max(3).optional(),
  wellnessPrefs: z.array(z.string()).default([]),
});
const milestoneSchema = z.object({
  title: z.string().min(2),
  targetWeek: z.number().int().optional(),
  achievedAt: z.string().optional(),
});

// Auth
app.post('/auth/register', (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users(email, password_hash) VALUES (?, ?)').run(email, passwordHash);
  db.prepare('INSERT INTO profiles(user_id, onboarding_completed) VALUES (?, 0)').run(info.lastInsertRowid);
  const user = { id: info.lastInsertRowid, email };
  const token = createToken(user);
  return res.json({ token, user });
});

app.post('/auth/login', (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = createToken(user);
  return res.json({ token, user: { id: user.id, email: user.email } });
});

// Quiz
app.post('/quiz/submit', authMiddleware, (req, res) => {
  const parse = quizSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { dueDate, trimester, wellnessPrefs } = parse.data;
  db.prepare('UPDATE profiles SET due_date = ?, trimester = ?, wellness_prefs = ?, onboarding_completed = 1 WHERE user_id = ?')
    .run(dueDate || null, trimester || null, JSON.stringify(wellnessPrefs || []), req.user.userId);
  return res.json({ success: true });
});

// Milestones
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

app.get('/milestones/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  const rows = db.prepare('SELECT * FROM milestones WHERE user_id = ? ORDER BY id DESC').all(userId);
  return res.json(rows);
});

app.post('/milestones/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  const parse = milestoneSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { title, targetWeek, achievedAt } = parse.data;
  const info = db.prepare('INSERT INTO milestones(user_id, title, target_week, achieved_at) VALUES (?, ?, ?, ?)')
    .run(userId, title, targetWeek || null, achievedAt || null);
  return res.json({ id: info.lastInsertRowid, user_id: Number(userId), title, target_week: targetWeek || null, achieved_at: achievedAt || null });
});

app.post('/milestones/:userId/photo/:id', authMiddleware, upload.single('photo'), (req, res) => {
  const { userId, id } = req.params;
  if (parseInt(userId) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  const filePath = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE milestones SET photo_path = ? WHERE id = ? AND user_id = ?').run(filePath, id, userId);
  return res.json({ success: true, photo_path: filePath });
});

// Tips
app.get('/tips/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  const profile = db.prepare('SELECT due_date, trimester FROM profiles WHERE user_id = ?').get(userId);
  let stage = 'newborn-0-3';
  if (profile?.trimester) stage = `pregnancy-trimester-${profile.trimester}`;
  const rows = db.prepare('SELECT * FROM tips WHERE stage = ?').all(stage);
  return res.json(rows);
});

// PDF export of milestones
app.get('/milestones/:userId/export/pdf', authMiddleware, (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  const milestones = db.prepare('SELECT * FROM milestones WHERE user_id = ? ORDER BY achieved_at DESC, id DESC').all(userId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="babybloom-milestones.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).text('BabyBloom Milestones', { align: 'center' });
  doc.moveDown();
  milestones.forEach((m) => {
    doc.fontSize(12).text(`• ${m.title}`);
    if (m.achieved_at) doc.text(`  Achieved: ${m.achieved_at}`);
    if (m.target_week) doc.text(`  Target Week: ${m.target_week}`);
    doc.moveDown(0.5);
  });
  doc.end();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// Me endpoints
app.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.userId);
  const profile = db.prepare('SELECT due_date, trimester, wellness_prefs, onboarding_completed FROM profiles WHERE user_id = ?').get(req.user.userId);
  return res.json({ user, profile: { ...profile, wellness_prefs: profile?.wellness_prefs ? JSON.parse(profile.wellness_prefs) : [] } });
});

app.put('/me/profile', authMiddleware, (req, res) => {
  const parse = quizSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { dueDate, trimester, wellnessPrefs } = parse.data;
  db.prepare('UPDATE profiles SET due_date = ?, trimester = ?, wellness_prefs = ? WHERE user_id = ?')
    .run(dueDate || null, trimester || null, JSON.stringify(wellnessPrefs || []), req.user.userId);
  const profile = db.prepare('SELECT due_date, trimester, wellness_prefs, onboarding_completed FROM profiles WHERE user_id = ?').get(req.user.userId);
  return res.json({ profile: { ...profile, wellness_prefs: profile?.wellness_prefs ? JSON.parse(profile.wellness_prefs) : [] } });
});

app.listen(PORT, () => {
  console.log(`BabyBloom server running on http://localhost:${PORT}`);
});
