// auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const client = require('../db'); // Import the client from db.js

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key

// Middleware to verify JWT token and get user info
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to the request object
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, username, password, confirmPassword } = req.body;

  if (!name || !email || !username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Check if the email or username already exists in the "users" table
  const query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
  try {
    const { rows } = await client.query(query, [email, username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, username, password) VALUES ($1, $2, $3, $4)';
    await client.query(insertQuery, [name, email, username, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await client.query(query, [email]);
    const user = rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example Protected Route (using verifyToken middleware)
router.get('/profile', verifyToken, async (req, res) => {
  // The user is authenticated, and their info is available in req.user
  const email = req.user.email;

  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await client.query(query, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {router,verifyToken};
