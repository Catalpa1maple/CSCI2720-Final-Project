import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import Event from './Schema/eventSchema.js';
import Venue from './Schema/venueSchema.js';

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); // Update with your database URI

app.use(cors());
app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async function () {
   console.log("Connection is open...");

   

   try {
       // Fetch and parse venues
       const venueResponse = await fetch("https://www.lcsd.gov.hk/datagovhk/event/venues.xml");
       const venueData = await venueResponse.text();
       const venueParser = new xml2js.Parser();
       const venueResult = await venueParser.parseStringPromise(venueData);
       const venues = venueResult.venues.venue;
       const validVenues = [];

       venues.forEach(venue => {
           const latitude = venue.latitude ? venue.latitude[0] : 'N/A';
           const longitude = venue.longitude ? venue.longitude[0] : 'N/A';

           if (latitude !== '' && longitude !== '') {
               validVenues.push({
                   id: venue.$.id,
                   name: venue.venuee ? venue.venuee[0] : 'N/A',
                   latitude: latitude,
                   longitude: longitude
               });
           }
       });

       // Fetch and parse events
       const eventResponse = await fetch("https://www.lcsd.gov.hk/datagovhk/event/events.xml");
       const eventData = await eventResponse.text();
       const eventParser = new xml2js.Parser();
       const eventResult = await eventParser.parseStringPromise(eventData);
       const events = eventResult.events.event;
       const eventArray = Array.isArray(events) ? events : [events];

       // Count events per venue
       const venueEventCount = {};
       eventArray.forEach(event => {
           const venueId = event.venueid ? event.venueid[0] : null;
           if (venueId) {
               if (!venueEventCount[venueId]) {
                   venueEventCount[venueId] = 0;
               }
               venueEventCount[venueId]++;
           }
       });

       const venuesWithAtLeastThreeEvents = validVenues.filter(venue => 
           venueEventCount[venue.id] >= 3
       );

       // Get the first 10 venues
       const firstTenVenues = venuesWithAtLeastThreeEvents.slice(0, 10);
       console.log('First 10 venues with at least 3 events:', firstTenVenues);

       // Insert venues into MongoDB
       try {
           const venueDocs = await Venue.insertMany(firstTenVenues);
           console.log('First 10 venues saved to MongoDB:', venueDocs);
       } catch (err) {
           console.error('Error saving venues to MongoDB:', err);
       }

       //Prepare events for these venues
       const eventsForVenue = firstTenVenues.flatMap(venue => {
           const eventsForThisVenue = eventArray.filter(event => event.venueid[0] == venue.id);
           return eventsForThisVenue.map(event => ({
               eventID: event.$.id,
               title: event.titlee ? event.titlee[0] : 'N/A',
               venue: parseInt(event.venueid[0]),
               date: event.predateE ? event.predateE[0] : 'N/A',
               description: event.desce ? event.desce[0] : 'N/A',
               presenter: event.presenterorge ? event.presenterorge[0] : 'N/A',
               price: event.pricee ? event.pricee[0] : 'N/A'
           }));
       });

       // Insert events into MongoDB
       try {
           const eventDocs = await Event.insertMany(eventsForVenue);
           console.log('Events saved to MongoDB:', eventDocs);
       } catch (error) {
           console.error('Error inserting events:', error);
       }
   } catch (error) {
       console.error('Error during processing:', error);
   }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.get('/venues', async (req, res) => {
   try {
       // Retrieve the first 10 venues with at least 3 events
       const venues = await Venue.find().limit(10);
       
       // Count the number of events for each venue
       const venueEventCounts = await Promise.all(venues.map(async venue => {
           const eventCount = await Event.countDocuments({ venue: venue.id });
           return {
               id: venue.id,
               name: venue.name,
               eventCount: eventCount
           };
       }));

       res.json(venueEventCounts);
   } catch (error) {
       console.error('Error fetching venues:', error);
       res.status(500).json({ error: 'Internal Server Error' });
   }
});
