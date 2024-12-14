import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';

const Favourites = () => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchFavourites();
    }, []);

    const fetchFavourites = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/favourites/${username}`);
            const data = await response.json();
            setFavourites(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching favourites:', error);
            setLoading(false);
        }
    };

    const removeFavourite = async (locationId) => {
        try {
            const response = await fetch('http://localhost:5001/api/favourites/remove', {
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
                setFavourites(favourites.filter(fav => fav.id !== locationId));
            }
        } catch (error) {
            console.error('Error removing favourite:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="favourites-container">
            <h2>My Favourite Locations</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Venue Name</th>
                        <th>Number of Events</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {favourites.map(location => (
                        <tr key={location.id}>
                            <td>{location.name}</td>
                            <td>{location.eventCount}</td>
                            <td>{new Date(location.dateAdded).toLocaleDateString()}</td>
                            <td>
                                <Button 
                                    variant="danger"
                                    onClick={() => removeFavourite(location.id)}
                                >
                                    Remove
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Favourites;
