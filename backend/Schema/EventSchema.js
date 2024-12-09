const mongoose = require('mongoose');

class EventSchema extends mongoose.Schema {
    constructor() {
        super({
            name: String,
            date: Date,
            description: String,
            location: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Location' 
            }
        });
    }
}

module.exports = mongoose.model('Event', new EventSchema());
