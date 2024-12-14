const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const xml2js = require('xml2js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const bcrypt = require('bcryptjs');
const authService = require('./services/authService');
const Comment = require('./Schema/CommentSchema');
const FavouriteLocation = require('./Schema/FavouriteLocationSchema');


// Import Account Schema for user management
const User = require('./Schema/AccountSchema');

// Import Location Schema for location management
const Location = require('./Schema/LocationSchema');

//import Event Schema for event management
const Event = require('./Schema/EventSchema');

class Server {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.connectDatabase();
        this.setupRoutes();
        this.initializeData();
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
        

        // Login Page and Admin Page Setting (Section Start)
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

           // Event Management Routes
           this.app.post('/api/events', async (req, res) => {
            try {
                const { eventID, title, venue, date, description, presenter, price } = req.body;
                
                const newEvent = new Event({
                    eventID,
                    title,
                    venue: parseInt(venue),
                    date,
                    description,
                    presenter,
                    price
                });
                
                await newEvent.save();
                res.status(201).json({ message: 'Event created successfully', event: newEvent });
            } catch (error) {
                res.status(500).json({ message: 'Failed to create event', error: error.message });
            }
        });
        

        this.app.get('/api/events/:eventID', async (req, res) => {
            try {
                const event = await Event.findOne({ eventID: req.params.eventID });
                if (!event) {
                    return res.status(404).json({ message: 'Event not found' });
                }
                res.json(event);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch event', error: error.message });
            }
        });

        this.app.put('/api/events/:eventID', async (req, res) => {
            try {
                const updateData = {};
                const fields = ['title', 'venue', 'date', 'description', 'presenter', 'price'];
                
                fields.forEach(field => {
                    if (req.body[field]) {
                        updateData[field] = field === 'venue' ? parseInt(req.body[field]) : req.body[field];
                    }
                });

                const event = await Event.findOneAndUpdate(
                    { eventID: req.params.eventID },
                    updateData,
                    { new: true }
                );

                if (!event) {
                    return res.status(404).json({ message: 'Event not found' });
                }
                
                res.json({ message: 'Event updated successfully', event });
            } catch (error) {
                res.status(500).json({ message: 'Failed to update event', error: error.message });
            }
        });

        this.app.delete('/api/events/:eventID', async (req, res) => {
            try {
                const event = await Event.findOneAndDelete({ eventID: req.params.eventID });
                if (!event) {
                    return res.status(404).json({ message: 'Event not found' });
                }
                res.json({ message: 'Event deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to delete event', error: error.message });
            }
        });

        //Login Page and Admin Page (Section End)


        // Event Page Setting (Section Start)
        this.app.get('/venues', async (req, res) => {
            try {
                const venues = await Location.find().limit(10);
                
                const venueEventCounts = await Promise.all(venues.map(async venue => {
                    const eventCount = await Event.countDocuments({ venue: venue.id });
                    return {
                        id: venue.id,
                        name: venue.name,
                        eventCount: eventCount
                    };
                }));
        
                res.json(venueEventCounts);
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        // Event Page Setting (Section End)

        // Add to favourites_Section Start
        this.app.post('/api/favourites/add', async (req, res) => {
            try {
                const { username, locationId } = req.body;
                
                // Check if already favourited
                const existingFavourite = await FavouriteLocation.findOne({ 
                    username, 
                    locationId 
                });
                
                if (existingFavourite) {
                    return res.status(400).json({ 
                        message: 'Location already in favourites' 
                    });
                }
        
                // Create new favourite
                const newFavourite = new FavouriteLocation({ 
                    username, 
                    locationId 
                });
                await newFavourite.save();
                
                res.status(201).json({ 
                    message: 'Added to favourites successfully' 
                });
            } catch (error) {
                res.status(500).json({ 
                    message: 'Server error', 
                    error: error.message 
                });
            }
        });
        
        this.app.post('/api/favourites/remove', async (req, res) => {
            try {
                const { username, locationId } = req.body;
                
                await FavouriteLocation.findOneAndDelete({ 
                    username, 
                    locationId 
                });
                
                res.json({ 
                    message: 'Removed from favourites successfully' 
                });
            } catch (error) {
                res.status(500).json({ 
                    message: 'Server error', 
                    error: error.message 
                });
            }
        });
        
        this.app.get('/api/favourites/:username', async (req, res) => {
            try {
                const username = req.params.username;
                
                // Find all favourites for the user
                const favourites = await FavouriteLocation.find({ username });
                
                // Get the full location details for each favourite
                const favouriteLocations = await Promise.all(
                    favourites.map(async (fav) => {
                        const location = await Location.findOne({ id: fav.locationId });
                        if (location) {
                            const eventCount = await Event.countDocuments({ venue: location.id });
                            return {
                                id: location.id,
                                name: location.name,
                                eventCount: eventCount,
                                dateAdded: fav.dateAdded
                            };
                        }
                        return null;
                    })
                );
        
                // Filter out any null values and send response
                res.json(favouriteLocations.filter(loc => loc !== null));
            } catch (error) {
                res.status(500).json({ 
                    message: 'Server error', 
                    error: error.message 
                });
            }
        });
        // Add to favourites_Section End

        this.app.get('/api/venues/:id/comments', async (req, res) => {
            try {
            const location = await Location.findOne({ id: req.params.id });
            const comments = await Comment.find({ location: location._id })
                .populate('user', 'username')
                .sort({ timestamp: -1 });
                const formattedComments = comments.map(comment => ({
                    _id: comment._id,
                    user: comment.user.username,
                    content: comment.content,
                    timestamp: comment.timestamp
                }));
                
                res.json(formattedComments);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error fetching comments' });
            }
        });
    
        // Add a new comment to a venue
        this.app.post('/api/venues/:id/comments', async (req, res) => {
            try {
                const user = await User.findOne({ username: req.body.username });
                const location = await Location.findOne({ id: req.params.id });
        
                const newComment = new Comment({
                    user: user._id,
                    location: location._id,
                    content: req.body.content
                });
        
                await newComment.save();
                res.status(201).json({ message: 'Comment added successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error adding comment' });
            }
        }); 
        
    }
    

    
    
    // Function to handle user login and admin page (Section Start)
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
    // Function to handle login page and admin page (Section End)

    // Even and Location Page (Section Start)
    async initializeData() {
        try {
            const venueResponse = await fetch("https://www.lcsd.gov.hk/datagovhk/event/venues.xml");
            const venueData = await venueResponse.text();
            const venueParser = new xml2js.Parser();
            const venueResult = await venueParser.parseStringPromise(venueData);
            const venues = venueResult.venues.venue;
            const validVenues = [];
    
            venues.forEach(venue => {
                const latitude = venue.latitude ? venue.latitude[0] : 'N/A';
                const longitude = venue.longitude ? venue.longitude[0] : 'N/A';
    
                if (latitude !== '' && longitude !== '') {
                    validVenues.push({
                        id: venue.$.id,
                        name: venue.venuee ? venue.venuee[0] : 'N/A',
                        latitude: latitude,
                        longitude: longitude
                    });
                }
            });
    
            const eventResponse = await fetch("https://www.lcsd.gov.hk/datagovhk/event/events.xml");
            const eventData = await eventResponse.text();
            const eventParser = new xml2js.Parser();
            const eventResult = await eventParser.parseStringPromise(eventData);
            const events = eventResult.events.event;
            const eventArray = Array.isArray(events) ? events : [events];
    
            const venueEventCount = {};
            eventArray.forEach(event => {
                const venueId = event.venueid ? event.venueid[0] : null;
                if (venueId) {
                    venueEventCount[venueId] = (venueEventCount[venueId] || 0) + 1;
                }
            });
    
            const venuesWithAtLeastThreeEvents = validVenues.filter(venue =>
                venueEventCount[venue.id] >= 3
            );
            const discreteLocationSet = new Set();
            const discreteLocation = [];

            // To elimate the location with the simliar location (same building)
            venuesWithAtLeastThreeEvents.forEach(venue => {
                const latLongPair = `${venue.latitude},${venue.longitude}`;
    
                if (!discreteLocationSet.has(latLongPair)) {
                    discreteLocationSet.add(latLongPair);
                    discreteLocation.push({
                        id: venue.id,
                        name: venue.name,
                        latitude: venue.latitude,
                        longitude: venue.longitude
                    });
                }
            });

            const firstTenVenues = discreteLocation.slice(0, 10);
            await Location.insertMany(firstTenVenues);
    
            const eventsForVenue = firstTenVenues.flatMap(venue => {
                const eventsForThisVenue = eventArray.filter(event => event.venueid[0] == venue.id);
                return eventsForThisVenue.map(event => ({
                    eventID: event.$.id,
                    title: event.titlee ? event.titlee[0] : 'N/A',
                    venue: parseInt(event.venueid[0]),
                    date: event.predateE ? event.predateE[0] : 'N/A',
                    description: event.desce ? event.desce[0] : 'N/A',
                    presenter: event.presenterorge ? event.presenterorge[0] : 'N/A',
                    price: event.pricee ? event.pricee[0] : 'N/A'
                }));
            });
    
            await Event.insertMany(eventsForVenue);
        } catch (error) {
            console.error('Error during data initialization:', error);
        }
    }
    // Event and Location Page (Section End)
    startServer() {
        this.app.listen(5001, () => console.log('Server running on port 5001'));
    }
}

// Initialize server
new Server();
