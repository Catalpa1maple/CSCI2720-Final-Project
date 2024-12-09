// === AUTHENTICATION SYSTEM BACKEND ===
// This file handles all authentication and user management endpoints
// Core dependencies for authentication system
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Server setup - Required for both authentication and future features
const app = express();
app.use(cors());  // Enables frontend to communicate with backend
app.use(express.json());  // Parses incoming JSON requests

// MongoDB connection - Shared database connection for all features
mongoose.connect('mongodb://localhost:27017/cs2720', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/* 
=== INTEGRATION POINT FOR LOCATION TEAM ===
Add your schemas here:
const LocationSchema = new mongoose.Schema({
    name: String,
    coordinates: { lat: Number, lng: Number },
    description: String,
    category: String,
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

=== INTEGRATION POINT FOR COMMENTS TEAM ===
const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    content: String,
    timestamp: { type: Date, default: Date.now }
});
*/

// User Schema - Core authentication data structure
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,  // Stores hashed passwords only
  isadmin: Number   // 1 for admin, 0 for regular users
  /* 
  === INTEGRATION POINT FOR FAVORITES TEAM ===
  Add this field:
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
  */
});

const User = mongoose.model('User', UserSchema, 'loginsystem');

// === AUTHENTICATION ENDPOINTS ===
// Login endpoint - Validates credentials and returns JWT token
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
          // Generate JWT token for authenticated session
          const token = jwt.sign(
              { userId: user._id, username, isadmin: user.isadmin },
              'your_jwt_secret',
              { expiresIn: '1h' }
          );
          return res.json({ token, isadmin: user.isadmin, username });
      }
      res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// Registration endpoint - Creates new regular user accounts
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
          username,
          password: hashedPassword,
          isadmin: 0  // Default to regular user
      });
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// === ADMIN USER MANAGEMENT ENDPOINTS ===
// Get all users - Admin only endpoint
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user - Admin only endpoint
app.delete('/api/users/:username', async (req, res) => {
  try {
    await User.deleteOne({ username: req.params.username });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user - Admin only endpoint
app.post('/api/users', async (req, res) => {
  const { username, password, isadmin } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
          username,
          password: hashedPassword,
          isadmin: isadmin ? 1 : 0
      });
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

/* 
=== INTEGRATION POINTS FOR OTHER TEAMS ===

LOCATION ENDPOINTS:
app.get('/api/locations', async (req, res) => {...})
app.post('/api/locations', async (req, res) => {...})
app.get('/api/locations/:id', async (req, res) => {...})
app.put('/api/locations/:id', async (req, res) => {...})
app.delete('/api/locations/:id', async (req, res) => {...})

FAVORITES ENDPOINTS:
app.post('/api/users/:username/favorites', async (req, res) => {...})
app.get('/api/users/:username/favorites', async (req, res) => {...})
app.delete('/api/users/:username/favorites/:locationId', async (req, res) => {...})

COMMENTS ENDPOINTS:
app.post('/api/locations/:id/comments', async (req, res) => {...})
app.get('/api/locations/:id/comments', async (req, res) => {...})
*/

// Start the server
app.listen(5001, () => console.log('Server running on port 5001'));
