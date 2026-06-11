const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

module.exports = app;
