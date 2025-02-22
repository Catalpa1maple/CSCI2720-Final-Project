import React, { useEffect, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";

const MapComponent = () => {
    const [venues, setVenues] = useState([]);
    useEffect(() => {
        (async () => {
            await fetchVenues(); // Fetch venues first
        }) (); // Immediately invoke the async function
    }, []); // Add venues as a dependency

    useEffect(() => {
        const loader = new Loader({
            apiKey: "AIzaSyChCTwugUIVZHdJICzzg-NdQ2F0WN46Mf8", // Google Map API key
            version: "weekly",
        });
        loader.load().then(async () => {
            const { Map } = await google.maps.importLibrary("maps");
            const map = new Map(document.querySelector("#canva"), {
                center: { lat: 22.4118111, lng: 114.1231444 },
                zoom: 10.5,
            });

        venues.forEach((venue) => {
            new google.maps.Marker({
                position: { lat: venue.latitude, lng: venue.longitude },
                map: map,
                title: venue.name,
            });
        });
    });
    }, [venues]);

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:5001/venues');
            const data = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    // Adjust the height to account for navbar
    return <div> 
        <div id="canva" style={{ height: '100vh', width: '100vw'}}> </div>
    </div>;
};

export default MapComponent;
