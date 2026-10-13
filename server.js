const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // 1. Imported JWT at the top
require('dotenv').config();

const Complaint = require('./models/Complaint');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// 2. ADMIN AUTHENTICATION & MIDDLEWARE
// ==========================================

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === envUsername && password === envPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '2h' });
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Auth Middleware to protect sensitive admin actions
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secretkey');
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// ==========================================
// COMPLAINT ROUTES
// ==========================================

// Submit a complaint (Public)
app.post('/api/complaints', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    console.error('Error saving complaint:', err.message);
    res.status(500).json({ error: 'Failed to save complaint' });
  }
});

// Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get single complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching complaint' });
  }
});

// Delete a single complaint (Protected with verifyAdmin)
app.delete('/api/complaints/:id', verifyAdmin, async (req, res) => {
  try {
    await Complaint.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Clear all complaints (Protected with verifyAdmin)
app.delete('/api/complaints', verifyAdmin, async (req, res) => {
  try {
    await Complaint.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error('Clear Error:', err.message);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));