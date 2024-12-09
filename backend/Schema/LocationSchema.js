const mongoose = require('mongoose');

class LocationSchema extends mongoose.Schema {
    constructor() {
        super({
            name: String,
            coordinates: { 
                lat: Number, 
                lng: Number 
            },
            description: String,
            category: String,
            events: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Event' 
            }]
        });
    }
}

module.exports = mongoose.model('Location', new LocationSchema());
