const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const alumniRoutes = require('./routes/alumni');
const recordRoutes = require('./routes/records');
const adminRoutes = require('./routes/admin');
const engagementRoutes = require('./routes/engagement');
const uploadRoutes = require('./routes/uploads');
const institutionRoutes = require('./routes/institutions');
const path = require('path');



const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Public images (profile photos, post/event images). Certificates are NOT in these folders.
const uploadsDir = path.join(__dirname, '..', 'uploads');
const publicImage = (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // lets the frontend (other port) show them
  next();
};
app.use('/uploads/photos', publicImage, express.static(path.join(uploadsDir, 'photos')));
app.use('/uploads/images', publicImage, express.static(path.join(uploadsDir, 'images')));

app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api', recordRoutes);
app.use('/api', adminRoutes);
app.use('/api', engagementRoutes);
app.use('/api', uploadRoutes);
app.use('/api/institutions', institutionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Friendly errors for bad uploads / bad JSON instead of an HTML stack trace
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File is too large (max 5 MB)' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;