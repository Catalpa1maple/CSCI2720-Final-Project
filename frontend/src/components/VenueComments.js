import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { Loader } from "@googlemaps/js-api-loader";

const VenueComments = () => {
    const { id } = useParams();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isFavourited, setIsFavourited] = useState(false);
    const username = localStorage.getItem('username');
    const [venueName, setVenueName] = useState('');
    const [venueLocation, setVenueLocation] = useState(null);

    useEffect(() => {
        fetchComments();
        checkFavouriteStatus();
        fetchVenueDetails();
    }, [id]);


    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/venues/${id}/comments`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    const fetchVenueDetails = async () => {
        try {
            const response = await fetch('http://localhost:5001/map');
            const venues = await response.json();
            const venue = venues.find(v => v.id === id);
            if (venue) {
                setVenueName(venue.name);
                setVenueLocation(venue);
                initializeMap(venue);
            }
        } catch (error) {
            console.error('Error fetching venue details:', error);
        }
    };

    const initializeMap = async (venue) => {
        const loader = new Loader({
            apiKey: "AIzaSyChCTwugUIVZHdJICzzg-NdQ2F0WN46Mf8",
            version: "weekly",
        });

        loader.load().then(async () => {
            const { Map } = await google.maps.importLibrary("maps");
            const map = new Map(document.querySelector("#canva"), {
                center: { lat: parseFloat(venue.latitude), lng: parseFloat(venue.longitude) },
                zoom: 15,
            });

            new google.maps.Marker({
                position: { lat: parseFloat(venue.latitude), lng: parseFloat(venue.longitude) },
                map: map,
                title: venue.name,
            });
        });
    };

    const checkFavouriteStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/favourites/check/${username}/${id}`);
            const data = await response.json();
            setIsFavourited(data.isFavourited);
        } catch (error) {
            console.error('Error checking favourite status:', error);
        }
    };

    const toggleFavourite = async () => {
        try {
            const endpoint = isFavourited ? 'remove' : 'add';
            const response = await fetch(`http://localhost:5001/api/favourites/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    locationId: id
                })
            });

            if (response.ok) {
                setIsFavourited(!isFavourited);
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5001/api/venues/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment,
                    username: username
                })
            });

            if (response.ok) {
                setNewComment('');
                fetchComments();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    return (
        <div className="content">
            <div id="canva" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
            <div className="event-management">
                <div className="venue-header">
                    <h3>Comments for Venue {id} - {venueName}</h3>
                    <Button
                        onClick={toggleFavourite}
                        variant={isFavourited ? "danger" : "primary"}
                        className="favourite-button"
                    >
                        {isFavourited ? "Remove from Favourites" : "Add to Favourites"}
                    </Button>
                </div>
                
                <Form onSubmit={handleSubmitComment} className="create-form">
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this venue..."
                            className="input"
                            required
                        />
                    </Form.Group>
                    <Button type="submit" className="crud-button create-button mt-2">
                        Add Comment
                    </Button>
                </Form>
    
                <div className="event-details">
                    <ListGroup>
                        {comments.map((comment) => (
                            <ListGroup.Item key={comment._id} className="mb-3">
                                <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                                    <span style={{ fontWeight: '500' }}>@{comment.user}: </span>
                                    <p className="mt-1 mb-1">{comment.content}</p>
                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {new Date(comment.timestamp).toLocaleString()}
                                    </small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </div>
        </div>
    );
    
    
};

export default VenueComments;
