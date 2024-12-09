// Essential dependencies for the server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Express and middleware
const app = express();
app.use(cors());  // Enable Cross-Origin Resource Sharing
app.use(express.json());  // Parse JSON request bodies

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/cs2720', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// === FOR LOCATION FEATURE DEVELOPERS ===
// TODO: Add these schemas below:
// const LocationSchema = new mongoose.Schema({
//   name: String,
//   coordinates: { lat: Number, lng: Number },
//   description: String,
//   category: String,
//   events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
// });

// TODO: Add Comment schema for location comments:
// const CommentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
//   content: String,
//   timestamp: { type: Date, default: Date.now }
// });

// User Schema definition for MongoDB
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,  // Will store hashed passwords
  isadmin: Number   // 1 for admin, 0 for regular users
  // TODO: Add favorites field for location feature:
  // favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
});

// Create User model using the schema
const User = mongoose.model('User', UserSchema, 'loginsystem');

// === AUTHENTICATION ENDPOINTS ===
// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
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

// User Registration endpoint
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
// Get all users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user endpoint
app.delete('/api/users/:username', async (req, res) => {
  try {
    await User.deleteOne({ username: req.params.username });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user endpoint (admin only)
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

// === FOR LOCATION FEATURE DEVELOPERS ===
// TODO: Add these endpoints:
// GET /api/locations - List all locations
// POST /api/locations - Create location (admin only)
// GET /api/locations/:id - Get single location
// PUT /api/locations/:id - Update location (admin only)
// DELETE /api/locations/:id - Delete location (admin only)

// === FOR COMMENT FEATURE DEVELOPERS ===
// TODO: Add these endpoints:
// POST /api/locations/:id/comments - Add comment
// GET /api/locations/:id/comments - Get location comments

// === FOR USER FAVORITES DEVELOPERS ===
// TODO: Add these endpoints:
// POST /api/users/:id/favorites - Add to favorites
// GET /api/users/:id/favorites - Get user favorites
// DELETE /api/users/:id/favorites/:locationId - Remove from favorites

// Start server
app.listen(5001, () => console.log('Server running on port 5001'));
