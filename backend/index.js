//index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Authentication routes
const groupRoutes = require('./routes/groups'); // Group-related routes
const transactionRoutes = require('./routes/transactions'); // Transactions routes
const dashboardRoutes = require('./routes/dashboard');
const userRoutes=require('./routes/user');
const financeRoutes=require('./routes/finance');
const databaseRoutes =require('./routes/database');

const app = express();
const PORT = 5000;
const allowedOrigins=['http://localhost:3000','https://splitwise-wine.vercel.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request from allowed origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable sending credentials (cookies) with the request
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization'], // Ensure headers are allowed
};

app.use(cors(corsOptions)); // Apply CORS middleware


// Middleware
app.use(cors(corsOptions));  // Use CORS with options
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('API is running. Navigate to /api for endpoints.');
});

// API Endpoints
app.use('/api/auth', authRoutes.router); // Authentication endpoints
app.use('/api/groups', groupRoutes); // Group endpoints

// Ensure transactions route is correctly handled for specific group transactions
app.use('/api/groups', transactionRoutes); // Mount transactions under /api/groups

app.use('/api/dashboard', dashboardRoutes);  // Register dashboard route
app.use('/api/user', userRoutes);
app.use('/api/finance',financeRoutes);
app.use('/api/database',databaseRoutes);
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
