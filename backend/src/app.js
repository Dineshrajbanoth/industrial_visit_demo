const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const visitRoutes = require('./routes/visitRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Industrial Visit API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
