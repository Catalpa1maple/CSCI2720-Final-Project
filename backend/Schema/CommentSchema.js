const mongoose = require('mongoose');

class CommentSchema extends mongoose.Schema {
    constructor() {
        super({
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            },
            location: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Venue'  // Change from 'Location' to 'Venue'
            },
            content: String,
            timestamp: { 
                type: Date, 
                default: Date.now 
            }
        });
    }
}

module.exports = mongoose.model('Comment', new CommentSchema());
