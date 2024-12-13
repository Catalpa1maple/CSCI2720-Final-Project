// venueSchema.js
const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  id: String,
  name: String,
  latitude: String,
  longitude: String
});

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;