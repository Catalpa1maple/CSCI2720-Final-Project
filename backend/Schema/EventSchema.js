const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventID: String,
  title: String,
  venue: Number,
  date: String,
  description: String,
  presenter: String,
  price: String
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
