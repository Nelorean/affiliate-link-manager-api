const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const linkController = require('./controllers/linkController');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/r/:slug', linkController.publicRedirect);
app.use('/auth', authRoutes);
app.use('/links', linkRoutes);

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

module.exports = app;
