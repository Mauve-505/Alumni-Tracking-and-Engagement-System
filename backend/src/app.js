const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const alumniRoutes = require('./routes/alumni');
const recordRoutes = require('./routes/records');



const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api', recordRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;