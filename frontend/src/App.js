import React, { useState, useEffect } from 'react';
import './loginpage.css';

function App() {
    // === AUTHENTICATION SYSTEM STATE MANAGEMENT ===
    // Core authentication states used for login/register functionality
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [showRegister, setShowRegister] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    /* 
    === INTEGRATION POINT FOR LOCATION TEAM ===
    Add these states for location features:
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterDistance, setFilterDistance] = useState(0);

    === INTEGRATION POINT FOR FAVORITES TEAM ===
    const [userFavorites, setUserFavorites] = useState([]);
    */

    // Check authentication status on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminStatus = localStorage.getItem('isadmin') === '1';
        if (token) {
            setIsLoggedIn(true);
            setIsAdmin(adminStatus);
            if (adminStatus) {
                fetchUsers();
            }
            /* 
            === INTEGRATION POINT FOR OTHER TEAMS ===
            Add your data fetching here:
            fetchLocations();
            fetchUserFavorites();
            */
        }
    }, []);

    // === ADMIN PANEL FUNCTIONS ===
    // Fetch all users for admin management
    const fetchUsers = async () => {
        const response = await fetch('http://localhost:5001/api/users');
        const data = await response.json();
        setUsers(data);
    };

    // === AUTHENTICATION HANDLERS ===
    // Handle user login process
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store authentication data in localStorage for persistence
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('isadmin', data.isadmin);
                setIsLoggedIn(true);
                setIsAdmin(data.isadmin === 1);
                if (data.isadmin === 1) {
                    fetchUsers();
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    // Handle new user registration
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setShowRegister(false);
                setError('Registration successful! Please login.');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    // Handle admin creating new user/admin accounts
    const handleCreateUser = async (e) => {
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
                fetchUsers();
                // Reset form after successful creation
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('isAdminCheck').checked = false;
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to create user');
        }
    };

    // Handle admin deleting users
    const handleDeleteUser = async (username) => {
        try {
            await fetch(`http://localhost:5001/api/users/${username}`, {
                method: 'DELETE'
            });
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('isadmin');
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsers([]);
    };

    /* 
    === INTEGRATION POINTS FOR OTHER TEAMS ===
    Add your handlers here:

    Location handlers:
    const handleLocationSelect = (location) => {...}
    const handleLocationSearch = (term) => {...}
    const handleCategoryFilter = (category) => {...}
    const handleDistanceFilter = (distance) => {...}

    Favorites handlers:
    const handleAddFavorite = async (locationId) => {...}
    const handleRemoveFavorite = async (locationId) => {...}

    Comments handlers:
    const handleAddComment = async (locationId, comment) => {...}
    const handleDeleteComment = async (commentId) => {...}
    */

    // === RENDER LOGIC ===
    if (isLoggedIn) {
        return (
            <div className="container">
                {/* Navigation Bar */}
                <nav className="navbar">
                    <div className="nav-brand">Location App</div>
                    <div className="nav-links">
                        {/* 
                        === INTEGRATION POINT FOR NAVIGATION ===
                        Add your navigation links here:
                        <button className="nav-link">Locations</button>
                        <button className="nav-link">Map</button>
                        <button className="nav-link">Favorites</button>
                        */}
                    <button className="nav-link">Locations</button>
                    <button className="nav-link">Map</button>
                    <button className="nav-link">Favorites</button>
                        {/* Admin Panel Navigation */}
                        {isAdmin && (
                            <button 
                                className="nav-link"
                                onClick={() => setShowAdminPanel(!showAdminPanel)}
                            >
                                Admin Panel
                            </button>
                        )}
                        
                        {/* User Info and Logout */}
                        <div className="user-info">
                            <span>Welcome, {localStorage.getItem('username')}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="content">
                    {/* 
                    === INTEGRATION POINT FOR COMPONENTS ===
                    Add your components here:
                    {currentView === 'locations' && <LocationList />}
                    {currentView === 'map' && <MapView />}
                    {currentView === 'favorites' && <FavoritesList />}
                    */}

                    {/* Admin Panel Content */}
                    {isAdmin && showAdminPanel && (
                        <div>
                            <h3>User Management</h3>
                            <div className="create-form">
                                <h4>Create New Account</h4>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreateUser(e);
                                }}>
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
                                            />
                                            Create as Admin
                                        </label>
                                    </div>
                                    <button type="submit" className="submit-button">
                                        Create Account
                                    </button>
                                </form>
                            </div>

                            {/* User List Table */}
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="th">Username</th>
                                        <th className="th">Admin Status</th>
                                        <th className="th">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.username}>
                                            <td className="td">{user.username}</td>
                                            <td className="td">
                                                <span className={user.isadmin ? 'admin-badge' : 'user-badge'}>
                                                    {user.isadmin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="td">
                                                <button 
                                                    onClick={() => handleDeleteUser(user.username)}
                                                    className="delete-button"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Login/Register Form Render
    return (
        <div className="login-container">
            <h2 className="login-header">{showRegister ? 'Register' : 'Login'}</h2>
            {error && <div className={error.includes('successful') ? 'success-message' : 'error-message'}>
                {error}
            </div>}
            <form onSubmit={showRegister ? handleRegister : handleLogin}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="submit-button">
                    {showRegister ? 'Register' : 'Login'}
                </button>
            </form>
            <button 
                onClick={() => setShowRegister(!showRegister)}
                className="submit-button secondary"
            >
                {showRegister ? 'Back to Login' : 'Register New Account'}
            </button>
        </div>
    );
}

export default App;
