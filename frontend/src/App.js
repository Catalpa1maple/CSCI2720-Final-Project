import React, { useState, useEffect } from 'react';
import './loginpage.css';

function App() {
    // === AUTHENTICATION STATES ===
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [showRegister, setShowRegister] = useState(false);
    const [adminError, setAdminError] = useState('');
    
    // === FOR LOCATION FEATURE DEVELOPERS ===
    // TODO: Add these states:
    // const [locations, setLocations] = useState([]);
    // const [selectedLocation, setSelectedLocation] = useState(null);
    // const [userFavorites, setUserFavorites] = useState([]);
    // const [searchTerm, setSearchTerm] = useState('');
    // const [filterCategory, setFilterCategory] = useState('');
    // const [filterDistance, setFilterDistance] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminStatus = localStorage.getItem('isadmin') === '1';
        if (token) {
            setIsLoggedIn(true);
            setIsAdmin(adminStatus);
            if (adminStatus) {
                fetchUsers();
            }
            // TODO: Add for location features
            // fetchLocations();
            // fetchUserFavorites();
        }
    }, []);

    const fetchUsers = async () => {
        const response = await fetch('http://localhost:5001/api/users');
        const data = await response.json();
        setUsers(data);
    };

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
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('isAdminCheck').checked = false;
            } else {
                alert(data.message); // This will show a popup warning for duplicate username
            }
        } catch (err) {
            alert('Failed to create user');
        }
    };

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('isadmin');
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsers([]);
    };

    // === FOR LOCATION FEATURE DEVELOPERS ===
    // TODO: Add these handlers:
    // const handleLocationSelect = (location) => {...}
    // const handleAddFavorite = async (locationId) => {...}
    // const handleRemoveFavorite = async (locationId) => {...}
    // const handleLocationSearch = async (searchTerm) => {...}
    // const handleCategoryFilter = (category) => {...}
    // const handleDistanceFilter = (distance) => {...}

    // === FOR COMMENT FEATURE DEVELOPERS ===
    // TODO: Add these handlers:
    // const handleAddComment = async (locationId, comment) => {...}
    // const handleDeleteComment = async (commentId) => {...} // Admin only

    if (isLoggedIn) {
        return (
            <div className="container">
                <div className="header">
                    <h2 className="welcome-text">Welcome, {localStorage.getItem('username')}!</h2>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
                
                {/* === FOR LOCATION FEATURE DEVELOPERS === */}
                {/* TODO: Add these components:
                    <LocationSearch onSearch={handleLocationSearch} />
                    <CategoryFilter onFilter={handleCategoryFilter} />
                    <DistanceFilter onFilter={handleDistanceFilter} />
                    <LocationMap locations={locations} onSelect={handleLocationSelect} />
                    <LocationList 
                        locations={locations} 
                        onSelect={handleLocationSelect}
                        onAddFavorite={handleAddFavorite} 
                    />
                    <UserFavorites locations={userFavorites} onRemove={handleRemoveFavorite} />
                */}
                
                {isAdmin && (
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
        );
    }
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
