const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/cs2720', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    isEmailVerified: Boolean,
    isadmin: Number,
    otp: {
        code: String,
        expiry: Date
    }
});

const User = mongoose.model('User', UserSchema);

const initializeDatabase = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});

        // Create default admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            username: 'admin',
            password: adminPassword,
            email: 'admin@cs2720.com',
            isEmailVerified: true,
            isadmin: 1,
            otp: {
                code: null,
                expiry: null
            }
        });
        await admin.save();

        // Create default user
        const userPassword = await bcrypt.hash('user123', 10);
        const user = new User({
            username: 'user',
            password: userPassword,
            email: '',
            isEmailVerified: false,
            isadmin: 0,
            otp: {
                code: null,
                expiry: null
            }
        });
        await user.save();

        console.log('Database initialized successfully!');
        console.log('Default Admin - username: admin, password: admin123');
        console.log('Default User - username: user, password: user123');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

initializeDatabase();