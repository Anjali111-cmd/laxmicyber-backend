const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  priority: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Registered' 
  },
  date: { 
    type: String, 
    required: true 
  },
  updatedAt: { 
    type: String, 
    required: true 
  },
  evidence: [{ 
    name: String, 
    type: String, 
    size: Number 
  }],
  screenshots: [{ 
    name: String, 
    type: String, 
    size: Number, 
    data: String 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);