import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';

const VenuesTable = () => {
    const [venues, setVenues] = useState([]);

    useEffect(() => {
        fetchVenues();
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

    return (
        <div>
            <h1>Venues and Events</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Venue ID</th>
                        <th>Venue Name</th>
                        <th>Number of Events</th>
                    </tr>
                </thead>
                <tbody>
                    {venues.map((venue) => (
                        <tr key={venue.id}>
                            <td>{venue.id}</td>
                            <td>{venue.name}</td>
                            <td>{venue.eventCount}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default VenuesTable;
