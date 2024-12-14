const mongoose = require('mongoose');

const favouriteLocationSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true
    },
    locationId: { 
        type: String,
        required: true
    },
    dateAdded: { 
        type: Date, 
        default: Date.now 
    }
});

const FavouriteLocation = mongoose.model('FavouriteLocation', favouriteLocationSchema);
module.exports = FavouriteLocation;