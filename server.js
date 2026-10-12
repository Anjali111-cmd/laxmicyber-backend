const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Complaint = require('./models/Complaint');

const app = express();

// Enable CORS and increase body limit to 50MB for file/image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI || "mongodb+srv://anjusingh01125_db_user:<db_password>@cluster0.phxthmh.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- API ENDPOINTS ---

// Get all complaints (Admin Dashboard)
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('❌ Error fetching complaints:', err.message);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Submit a new complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    console.log(`✅ Complaint Registered: ${complaint.id}`);
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    console.error('❌ Database Save Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Track complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error('❌ Error tracking complaint:', err.message);
    res.status(500).json({ error: 'Error tracking complaint' });
  }
});

// Update complaint status
app.patch('/api/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: new Date().toLocaleString() },
      { new: true }
    );
    res.json(complaint);
  } catch (err) {
    console.error('❌ Error updating status:', err.message);
    res.status(400).json({ error: 'Failed to update status' });
  }
});

// Delete a complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    await Complaint.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete Error:', err.message);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Clear all complaints
app.delete('/api/complaints', async (req, res) => {
  try {
    await Complaint.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Clear Error:', err.message);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));