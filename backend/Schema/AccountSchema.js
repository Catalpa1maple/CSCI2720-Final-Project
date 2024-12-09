const mongoose = require('mongoose');

// Schema for user accounts - defines the structure for both admin and regular users
class AccountSchema extends mongoose.Schema {
    constructor() {
        super({
            username: String,      // Stores unique username for each account
            password: String,      // Stores hashed password
            isadmin: Number       // 1 for admin, 0 for regular user
        });
    }
}

module.exports = mongoose.model('User', new AccountSchema());
