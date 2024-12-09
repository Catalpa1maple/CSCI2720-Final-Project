import React from 'react';

// Component handling user authentication and registration
class Login extends React.Component {
    state = {
        username: '',
        password: '',
        error: '',
        showRegister: false
    }

    // Handle user login
    handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.state.username, 
                    password: this.state.password 
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('isadmin', data.isadmin);
                window.location.href = data.isadmin === 1 ? '/admin' : '/dashboard';
            } else {
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to connect to server' });
        }
    }

    // Handle new user registration
    handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.state.username, 
                    password: this.state.password 
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.setState({ 
                    showRegister: false,
                    error: 'Registration successful! Please login.'
                });
            } else {
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to connect to server' });
        }
    }

    render() {
        return (
            <div className="login-container">
                <h2 className="login-header">
                    {this.state.showRegister ? 'Register' : 'Login'}
                </h2>
                {this.state.error && (
                    <div className={this.state.error.includes('successful') ? 'success-message' : 'error-message'}>
                        {this.state.error}
                    </div>
                )}
                <form onSubmit={this.state.showRegister ? this.handleRegister : this.handleLogin}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={this.state.username}
                            onChange={(e) => this.setState({ username: e.target.value })}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={this.state.password}
                            onChange={(e) => this.setState({ password: e.target.value })}
                            required
                            className="input"
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        {this.state.showRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                <button 
                    onClick={() => this.setState(prev => ({ showRegister: !prev.showRegister }))}
                    className="submit-button secondary"
                >
                    {this.state.showRegister ? 'Back to Login' : 'Register New Account'}
                </button>
            </div>
        );
    }
}

export default Login;
