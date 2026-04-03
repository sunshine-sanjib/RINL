require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const maintenanceRoutes = require('./routes/maintenance');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const chatbotRoutes = require('./routes/chatbot');
const announcementRoutes = require('./routes/announcements');

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: 'Too many requests from this IP.'
});
app.use('/api/', limiter);

// Static Files (uploaded attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RINL CMS Server Running', timestamp: new Date() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rinl_cms')
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    // Seed initial admin user
    const { seedAdmin } = require('./utils/seed');
    seedAdmin();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RINL CMS Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
