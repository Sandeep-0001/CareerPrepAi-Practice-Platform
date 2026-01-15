const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const interviewRoutes = require('./routes/interviews');
const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const mcqRoutes = require('./routes/mcq');

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;

  // Explicitly allow configured / common dev origins
  if (allowedOrigins.includes(origin)) return true;

  // In development, allow localhost / 127.0.0.1 on any port
  if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;

  return false;
};

// Define allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  // In development, allow more requests (dashboard/progress polling + sockets)
  max: isProduction
    ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100)
    : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // When mounted at /api/, req.path is relative to that mount.
    return req.path === '/health';
  },
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prepiq', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mcq', require('./middleware/auth').authenticateToken, mcqRoutes);
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/ai-interview', require('./routes/aiInterview'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/admin/coding-questions', require('./routes/adminCodingQuestions'));
app.use('/api/quick-practice', require('./routes/quickPractice'));
app.use('/api/admin/quick-practice-questions', require('./routes/adminQuickPracticeQuestions'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PrepIQ API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Socket.IO real-time features
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join interview room
  socket.on('join-interview', (sessionId) => {
    socket.join(`interview-${sessionId}`);
    console.log(`👤 User ${socket.id} joined interview ${sessionId}`);
  });

  // Real-time code sharing
  socket.on('code-update', (data) => {
    socket.to(`interview-${data.sessionId}`).emit('code-update', data);
  });

  // Real-time interview progress
  socket.on('interview-progress', (data) => {
    socket.to(`interview-${data.sessionId}`).emit('interview-progress', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('   Stop the other process using it, or start this server with a different PORT.');
    console.error('   Example (PowerShell): $env:PORT=5001; npm start');
    process.exit(1);
  }

  console.error('❌ Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 PrepIQ Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO enabled for real-time features`);
});
