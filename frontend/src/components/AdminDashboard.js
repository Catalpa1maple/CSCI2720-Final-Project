import React from 'react';

// Admin Dashboard component for user management
class AdminDashboard extends React.Component {
    state = {
        users: [],
        selectedUser: null,
        showUserInfo: false,
        showUpdatePassword: false,
        createError: '',

        //Event Management
        events: [],
        showCreateEventForm: false,
        showReadEventForm: false,
        showUpdateEventForm: false,
        showDeleteEventForm: false,
        selectedEvent: null,
        eventError: ''
    }

    componentDidMount() {
        this.fetchUsers();
    }

    // Fetch all users from database
    fetchUsers = async () => {
        const response = await fetch('http://localhost:5001/api/users');
        const data = await response.json();
        this.setState({ users: data });
    }

    // Create new user with admin privileges option
    handleCreateUser = async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const isAdminCheck = document.getElementById('isAdminCheck').checked;

        try {
            const response = await fetch('http://localhost:5001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    isadmin: isAdminCheck
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.fetchUsers();
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('isAdminCheck').checked = false;
                this.setState({ createError: '' });
            } else {
                this.setState({ createError: data.message });
                throw new Error(data.message);
            }
        } catch (err) {
            this.setState({ createError: err.message || 'Failed to create user' });
        }
    }

    // Delete user from database
    handleDeleteUser = async (username) => {
        try {
            await fetch(`http://localhost:5001/api/users/${username}`, {
                method: 'DELETE'
            });
            this.fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    }

    // Read user information
    handleReadUser = async (username) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${username}/info`);
            const data = await response.json();
            if (response.ok) {
                this.setState({ 
                    selectedUser: data,
                    showUserInfo: true 
                });
            }
        } catch (err) {
            alert('Failed to read user info');
        }
    }

    // Update user password
    handleUpdatePassword = async (username) => {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;

        try {
            const response = await fetch(`http://localhost:5001/api/users/${username}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            
            if (response.ok) {
                alert('Password updated successfully');
            }
        } catch (err) {
            alert('Failed to update password');
        }
    }

    //Event Management
    handleCreateEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await fetch('http://localhost:5001/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            if (response.ok) {
                alert('Event created successfully');
                this.setState({ showCreateEventForm: false });
            }
        } catch (error) {
            alert('Failed to create event');
        }
    }
    
    handleReadEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`);
            const data = await response.json();
            
            if (response.ok && data) {
                this.setState({ 
                    selectedEvent: data,
                    eventError: '',
                    showReadEventForm: true
                });
            } else {
                this.setState({ 
                    eventError: 'Event not found', 
                    selectedEvent: null,
                    showReadEventForm: true
                });
            }
        } catch (error) {
            this.setState({ 
                eventError: 'Failed to read event',
                selectedEvent: null,
                showReadEventForm: true
            });
        }
    }
    
    
    handleUpdateEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.setState({ 
                    eventError: '',
                    showUpdateEventForm: false
                });
                alert('Event updated successfully');
            } else {
                this.setState({ 
                    eventError: 'Event not found or update failed',
                    showUpdateEventForm: true
                });
            }
        } catch (error) {
            this.setState({ 
                eventError: 'Failed to update event',
                showUpdateEventForm: true
            });
        }
    }
    
    handleDeleteEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.setState({ 
                    eventError: '',
                    showDeleteEventForm: false
                });
                alert('Event deleted successfully');
            } else {
                this.setState({ 
                    eventError: 'Event not found or delete failed',
                    showDeleteEventForm: true
                });
            }
        } catch (error) {
            this.setState({ 
                eventError: 'Failed to delete event',
                showDeleteEventForm: true
            });
        }
    }

    render() {
        return (
            <div className="content">
                <h3>User Management</h3>
                <div className="create-form">
                    <h4>Create New Account</h4>
                    {this.state.createError && (
                        <div className="error-message-create">
                            {this.state.createError}
                        </div>
                    )}
                    <form onSubmit={this.handleCreateUser}>
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                id="newUsername"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    id="isAdminCheck"
                                    className="admin-checkbox"
                                />
                                Create as Admin
                            </label>
                        </div>
                        <button type="submit" className="submit-button">
                            Create Account
                        </button>
                    </form>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Admin Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.users.map(user => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>{user.isadmin ? 'Admin' : 'User'}</td>
                                <td>
                                    <button 
                                        className="read-button"
                                        onClick={() => this.handleReadUser(user.username)}
                                    >
                                        Read
                                    </button>
                                    <button 
                                        className="update-button"
                                        onClick={() => this.handleUpdatePassword(user.username)}
                                    >
                                        Update
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => this.handleDeleteUser(user.username)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
    
                {this.state.showUserInfo && this.state.selectedUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>User Information</h3>
                                <button 
                                    className="modal-close"
                                    onClick={() => this.setState({ showUserInfo: false })}
                                >
                                    ×
                                </button>
                            </div>
                            <div>
                                <p><strong>Username:</strong> {this.state.selectedUser.username}</p>
                                <p><strong>Password:</strong> {this.state.selectedUser.password}</p>
                                <p><strong>Email:</strong> {this.state.selectedUser.email}</p>
                                <p><strong>Role:</strong> {this.state.selectedUser.isadmin ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                    </div>
                )}
    
                <div className="event-management">
                    <h3>Event Management</h3>
                    <div className="event-buttons">
                        <button onClick={() => this.setState({ showCreateEventForm: true })} className="crud-button create-button">
                            Create Event
                        </button>
                        <button onClick={() => this.setState({ showReadEventForm: true })} className="crud-button read-button">
                            Read Event
                        </button>
                        <button onClick={() => this.setState({ showUpdateEventForm: true })} className="crud-button update-button">
                            Update Event
                        </button>
                        <button onClick={() => this.setState({ showDeleteEventForm: true })} className="crud-button delete-button">
                            Delete Event
                        </button>
                    </div>
    
                    {this.state.showCreateEventForm && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Create New Event</h3>
                                <form onSubmit={this.handleCreateEvent}>
                                    <input type="text" placeholder="Event ID" name="eventID" required />
                                    <input type="text" placeholder="Event Title" name="title" required />
                                    <input type="text" placeholder="Venue ID" name="venue" required />
                                    <input type="text" placeholder="Date" name="date" required />
                                    <textarea placeholder="Description" name="description" required />
                                    <input type="text" placeholder="Presenter" name="presenter" required />
                                    <input type="text" placeholder="Price" name="price" required />
                                    <div className="form-buttons">
                                        <button type="submit">Create</button>
                                        <button type="button" onClick={() => this.setState({ showCreateEventForm: false })}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
    
                    {this.state.showReadEventForm && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Search Event</h3>
                                    <button 
                                        className="modal-close"
                                        onClick={() => this.setState({ 
                                            showReadEventForm: false,
                                            eventError: '',
                                            selectedEvent: null 
                                        })}
                                    >
                                        ×
                                    </button>
                                </div>
                                {this.state.eventError && (
                                    <div className="event-error-message">
                                        {this.state.eventError}
                                    </div>
                                )}
                                <form onSubmit={this.handleReadEvent}>
                                    <div className="form-group">
                                        <input 
                                            type="text" 
                                            placeholder="Event ID" 
                                            name="eventID" 
                                            className="input"
                                            required 
                                        />
                                    </div>
                                    <div className="form-buttons">
                                        <button type="submit" className="submit-button">Search</button>
                                    </div>
                                </form>
                                {this.state.selectedEvent && (
                                    <div className="event-details">
                                        <h4>Event Details</h4>
                                        <p><strong>Event ID:</strong> {this.state.selectedEvent.eventID}</p>
                                        <p><strong>Title:</strong> {this.state.selectedEvent.title}</p>
                                        <p><strong>Venue:</strong> {this.state.selectedEvent.venue}</p>
                                        <p><strong>Date:</strong> {this.state.selectedEvent.date}</p>
                                        <p><strong>Description:</strong> {this.state.selectedEvent.description}</p>
                                        <p><strong>Presenter:</strong> {this.state.selectedEvent.presenter}</p>
                                        <p><strong>Price:</strong> {this.state.selectedEvent.price}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
    
                    {this.state.showUpdateEventForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Update Event</h3>
                            {this.state.eventError && (
                                <div className="event-error-message">
                                    {this.state.eventError}
                                </div>
                            )}
                            <form onSubmit={this.handleUpdateEvent}>
                                <input type="text" placeholder="Event ID" name="eventID" required />
                                <input type="text" placeholder="New Title" name="title" />
                                <input type="text" placeholder="New Venue ID" name="venue" />
                                <input type="text" placeholder="New Date" name="date" />
                                <textarea placeholder="New Description" name="description" />
                                <input type="text" placeholder="New Presenter" name="presenter" />
                                <input type="text" placeholder="New Price" name="price" />
                                <div className="form-buttons">
                                    <button type="submit">Update</button>
                                    <button type="button" onClick={() => this.setState({ showUpdateEventForm: false })}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                    
                {this.state.showDeleteEventForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Delete Event</h3>
                            {this.state.eventError && (
                                <div className="event-error-message">
                                    {this.state.eventError}
                                </div>
                            )}
                            <form onSubmit={this.handleDeleteEvent}>
                                <input type="text" placeholder="Event ID" name="eventID" required />
                                <div className="form-buttons">
                                    <button type="submit">Delete</button>
                                    <button type="button" onClick={() => this.setState({ showDeleteEventForm: false })}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            )}
                </div>
            </div>
        );
    }

}

export default AdminDashboard;
