import React from 'react';

// Admin Dashboard component for user management
class AdminDashboard extends React.Component {
    state = {
        users: [],
        selectedUser: null,
        showUserInfo: false,
        showUpdatePassword: false,
        createError: ''
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
                                <p><strong>Role:</strong> {this.state.selectedUser.isadmin ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default AdminDashboard;
