const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
require('dotenv').config();

const app = express();

// Add logging middleware
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Client IP:', clientIp);
  console.log('Headers:', req.headers);
  next();
});

// CORS configuration
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  exposedHeaders: '*',
  credentials: true,
  maxAge: 86400
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const tvShowRoutes = require('./routes/tvShowRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Basic health check endpoint
app.get('/health', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    clientIp: clientIp,
    headers: req.headers,
    server: {
      hostname: os.hostname(),
      networkInterfaces: os.networkInterfaces()
    }
  });
});

// Test endpoint
app.get('/ping', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.json({ 
    message: 'pong',
    clientIp: clientIp,
    timestamp: new Date().toISOString()
  });
});

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/tv-shows', tvShowRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5555;
const HOST = '0.0.0.0';  // Listen on all available network interfaces

// Function to log all available network interfaces
function logNetworkInfo() {
  const interfaces = os.networkInterfaces();
  console.log('\nAvailable Network Interfaces:');
  Object.entries(interfaces).forEach(([name, nets]) => {
    nets.forEach(net => {
      if (net.family === 'IPv4') {
        console.log(`${name}: ${net.address} (${net.internal ? 'internal' : 'external'})`);
      }
    });
  });
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury-hotel')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Create server with explicit error handling
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log('Server address:', server.address());
      logNetworkInfo();
      
      console.log('\nTest these endpoints:');
      console.log(`1. Health check: http://${HOST}:${PORT}/health`);
      console.log(`2. Quick ping: http://${HOST}:${PORT}/ping`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM. Performing graceful shutdown...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
