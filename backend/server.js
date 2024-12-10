const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authService = require('./services/authService');

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
        // Core Account Management Routes
        this.app.post('/api/login', this.handleLogin);           
        this.app.post('/api/register', this.handleRegister);     
        this.app.get('/api/users', this.getUsers);              
        this.app.post('/api/users', this.createUser);           
        this.app.delete('/api/users/:username', this.deleteUser); 
        this.app.get('/api/users/:username/info', this.getUserInfo); 
        this.app.put('/api/users/:username/password', this.updateUserPassword);

        // Email Verification Routes
        this.app.post('/api/update-email', async (req, res) => {
            try {
                await authService.handleUpdateEmail(req.body.username, req.body.email);
                res.json({ message: 'OTP sent successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        this.app.post('/api/verify-email', async (req, res) => {
            try {
                await authService.handleVerifyEmail(req.body.username, req.body.otp);
                res.json({ message: 'Email verified successfully' });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.post('/api/forgot-password', async (req, res) => {
            try {
                await authService.handleForgotPassword(req.body.username);
                res.json({ message: 'OTP sent successfully' });
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        });

        this.app.post('/api/reset-password', async (req, res) => {
            try {
                await authService.handleResetPassword(req.body.username, req.body.otp, req.body.newPassword);
                res.json({ message: 'Password reset successful' });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        this.app.post('/api/resend-otp', async (req, res) => {
            try {
                await authService.handleResendOTP(req.body.username);
                res.json({ message: 'New OTP sent successfully' });
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        });
    }

    async handleLogin(req, res) {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!user.isEmailVerified) {
                return res.status(403).json({ 
                    message: 'Email verification required',
                    requiresVerification: true,
                    username: user.username
                });
            }

            const token = jwt.sign(
                { userId: user._id, username, isadmin: user.isadmin },
                'your_jwt_secret',
                { expiresIn: '1h' }
            );
            res.json({ token, isadmin: user.isadmin, username });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async handleRegister(req, res) {
        const { username, password, email } = req.body;
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                username,
                password: hashedPassword,
                email,
                isadmin: 0,
                isEmailVerified: false
            });

            await user.save();
            await authService.handleResendOTP(username);
            res.status(201).json({ 
                message: 'Registration successful. Please verify your email.',
                username 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

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
                isadmin: isadmin ? 1 : 0,
                isEmailVerified: isadmin ? true : false
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
            const user = await User.findOne(
                { username: req.params.username },
                { otp: 0 }
            );
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
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

    startServer() {
        this.app.listen(5001, () => console.log('Server running on port 5001'));
    }
}

// Initialize server
new Server();
