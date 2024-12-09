const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import Account Schema for user management
const User = require('./Schema/AccountSchema');

/* DEMO CODE - NOT ACCOUNT RELATED
const Location = require('./Schema/LocationSchema');
const Comment = require('./Schema/CommentSchema');
const Event = require('./Schema/EventSchema');
const FavouriteLocation = require('./Schema/FavouriteLocationSchema');
*/

class Server {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.connectDatabase();
        this.setupRoutes();
        this.startServer();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    connectDatabase() {
        mongoose.connect('mongodb://localhost:27017/cs2720', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    setupRoutes() {
        // Account Management Routes
        this.app.post('/api/login', this.handleLogin);           // User authentication
        this.app.post('/api/register', this.handleRegister);     // New user registration
        this.app.get('/api/users', this.getUsers);              // List all users
        this.app.post('/api/users', this.createUser);           // Create new user (admin only)
        this.app.delete('/api/users/:username', this.deleteUser); // Delete user
        this.app.get('/api/users/:username/info', this.getUserInfo); // Get user details
        this.app.put('/api/users/:username/password', this.updateUserPassword); // Update password

        /* DEMO CODE - NOT ACCOUNT RELATED
        // Location Routes
        this.app.get('/api/locations', this.getLocations);
        this.app.post('/api/locations', this.createLocation);
        this.app.get('/api/locations/:id', this.getLocationById);
        this.app.put('/api/locations/:id', this.updateLocation);
        this.app.delete('/api/locations/:id', this.deleteLocation);

        // Favorites Routes
        this.app.post('/api/users/:username/favorites', this.addFavorite);
        this.app.get('/api/users/:username/favorites', this.getFavorites);
        this.app.delete('/api/users/:username/favorites/:locationId', this.removeFavorite);

        // Comments Routes
        this.app.post('/api/locations/:id/comments', this.addComment);
        this.app.get('/api/locations/:id/comments', this.getComments);
        */
    }

    // User Authentication Handlers
    async handleLogin(req, res) {
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
    }

    async handleRegister(req, res) {
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
                isadmin: 0
            });
            await user.save();
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    // User Management Handlers
    async getUsers(req, res) {
        try {
            const users = await User.find({}, { password: 0 });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async createUser(req, res) {
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
    }

    async deleteUser(req, res) {
        try {
            await User.deleteOne({ username: req.params.username });
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async getUserInfo(req, res) {
        try {
            const user = await User.findOne({ username: req.params.username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                username: user.username,
                password: user.password,
                isadmin: user.isadmin
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async updateUserPassword(req, res) {
        try {
            const { newPassword } = req.body;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const user = await User.findOneAndUpdate(
                { username: req.params.username },
                { password: hashedPassword },
                { new: true }
            );
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    /* DEMO CODE - NOT ACCOUNT RELATED
    // Location Handlers
    async getLocations(req, res) {}
    async createLocation(req, res) {}
    async getLocationById(req, res) {}
    async updateLocation(req, res) {}
    async deleteLocation(req, res) {}

    // Favorites Handlers
    async addFavorite(req, res) {}
    async getFavorites(req, res) {}
    async removeFavorite(req, res) {}

    // Comments Handlers
    async addComment(req, res) {}
    async getComments(req, res) {}
    */

    startServer() {
        this.app.listen(5001, () => console.log('Server running on port 5001'));
    }
}

// Initialize server
new Server();
