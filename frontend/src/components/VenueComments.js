import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, ListGroup } from 'react-bootstrap';

const VenueComments = () => {
    const { id } = useParams();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchComments();
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
                fetchComments(); // Refresh comments after posting
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    return (
        <div className="content">
            <div className="event-management">
                <h3>Comments for Venue {id}</h3>
                
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
                        Post Comment
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
