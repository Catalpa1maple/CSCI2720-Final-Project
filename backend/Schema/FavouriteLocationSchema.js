const mongoose = require('mongoose');

class FavouriteLocationSchema extends mongoose.Schema {
    constructor() {
        super({
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            },
            locations: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Location' 
            }],
            dateAdded: { 
                type: Date, 
                default: Date.now 
            }
        });
    }
}

module.exports = mongoose.model('FavouriteLocation', new FavouriteLocationSchema());
