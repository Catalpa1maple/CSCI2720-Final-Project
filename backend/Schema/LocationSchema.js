// venueSchema.js
const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  id: String,
  name: String,
  latitude: Number,
  longitude: Number
});

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;