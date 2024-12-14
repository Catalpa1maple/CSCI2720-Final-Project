import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';

const VenuesTable = () => {
    const [venues, setVenues] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchVenues();
        fetchFavourites();
    }, []);

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:5001/venues');
            const data = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const fetchFavourites = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/favourites/${username}`);
            const data = await response.json();
            setFavourites(data.map(fav => fav.id));
        } catch (error) {
            console.error('Error fetching favourites:', error);
        }
    };

    const toggleFavourite = async (locationId) => {
        try {
            const isFavourited = favourites.includes(locationId);
            const endpoint = isFavourited ? 'remove' : 'add';
            
            const response = await fetch(`http://localhost:5001/api/favourites/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    locationId
                })
            });

            if (response.ok) {
                if (isFavourited) {
                    setFavourites(favourites.filter(id => id !== locationId));
                } else {
                    setFavourites([...favourites, locationId]);
                }
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
        }
    };

    return (
        <div>
            <h1>Venues and Events</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Venue ID</th>
                        <th>Venue Name</th>
                        <th>Number of Events</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {venues.map((venue) => (
                        <tr key={venue.id}>
                            <td>{venue.id}</td>
                            <td>{venue.name}</td>
                            <td>{venue.eventCount}</td>
                            <td>
                                <Button
                                    variant={favourites.includes(venue.id) ? "danger" : "primary"}
                                    onClick={() => toggleFavourite(venue.id)}
                                >
                                    {favourites.includes(venue.id) ? "Remove from Favourites" : "Add to Favourites"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default VenuesTable;
