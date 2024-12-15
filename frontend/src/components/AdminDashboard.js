import React from 'react';

// Admin Dashboard component for user management
class AdminDashboard extends React.Component {
    state = {
        users: [],
        selectedUser: null,
        showUserInfo: false,
        showUpdatePassword: false,
        showUpdatePasswordForm: false,
        selectedUsername: null,
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
        this.setState({ 
            showUpdatePasswordForm: true, 
            selectedUsername: username 
        });
    }
    
    handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const existingMessages = e.target.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
    
        const formData = new FormData(e.target);
        const newPassword = formData.get('newPassword');
    
        try {
            const response = await fetch(`http://localhost:5001/api/users/${this.state.selectedUsername}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            
            if (response.ok) {
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Password updated successfully';
                e.target.prepend(successDiv);
                setTimeout(() => this.setState({ showUpdatePasswordForm: false }), 2000);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Password update failed';
                e.target.prepend(errorDiv);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to update password';
            e.target.prepend(errorDiv);
        }
    }
    

    //Event Management
    handleCreateEvent = async (e) => {
        e.preventDefault();
        const existingMessages = e.target.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const formData = new FormData(e.target);
        const eventData = Object.fromEntries(formData);
        
        try {
            const checkResponse = await fetch(`http://localhost:5001/api/events/${eventData.eventID}`);
            if (checkResponse.ok) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Event ID already exists';
                e.target.prepend(errorDiv);
                return;
            }
    
            const response = await fetch('http://localhost:5001/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
    
            if (response.ok) {
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Event created successfully';
                e.target.prepend(successDiv);
                setTimeout(() => this.setState({ showCreateEventForm: false }), 2000);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to create event';
            e.target.prepend(errorDiv);
        }
    }
    
    handleReadEvent = async (e) => {
        e.preventDefault();
        const existingMessages = e.target.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`);
            const data = await response.json();
            
            if (response.ok && data) {
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Event found successfully';
                e.target.prepend(successDiv);
                this.setState({ selectedEvent: data, showReadEventForm: true });
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Event not found';
                e.target.prepend(errorDiv);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to read event';
            e.target.prepend(errorDiv);
        }
    }
    
    handleUpdateEvent = async (e) => {
        e.preventDefault();
        const existingMessages = e.target.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Event updated successfully';
                e.target.prepend(successDiv);
                setTimeout(() => this.setState({ showUpdateEventForm: false }), 2000);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Event not found or update failed';
                e.target.prepend(errorDiv);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to update event';
            e.target.prepend(errorDiv);
        }
    }
    
    handleDeleteEvent = async (e) => {
        e.preventDefault();
        const existingMessages = e.target.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const formData = new FormData(e.target);
        const eventID = formData.get('eventID');
        
        try {
            const response = await fetch(`http://localhost:5001/api/events/${eventID}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Event deleted successfully';
                e.target.prepend(successDiv);
                setTimeout(() => this.setState({ showDeleteEventForm: false }), 2000);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'Event not found or delete failed';
                e.target.prepend(errorDiv);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to delete event';
            e.target.prepend(errorDiv);
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

                {this.state.showUpdatePasswordForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Update Password</h3>
                            <form onSubmit={this.handlePasswordSubmit}>
                                <input 
                                    type="password" 
                                    name="newPassword" 
                                    placeholder="Enter new password" 
                                    required 
                                />
                                <div className="form-buttons">
                                    <button type="submit">Update</button>
                                    <button type="button" onClick={() => this.setState({ showUpdatePasswordForm: false })}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
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
