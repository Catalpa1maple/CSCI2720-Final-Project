const mongoose = require('mongoose');

class AccountSchema extends mongoose.Schema {
    constructor() {
        super({
            username: String,
            password: String,
            email: String,
            isEmailVerified: { type: Boolean, default: false },
            isadmin: Number,
            otp: {
                code: String,
                expiry: Date
            }
        });
    }
}

module.exports = mongoose.model('User', new AccountSchema());