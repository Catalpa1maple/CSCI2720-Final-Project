import React from 'react';

// Component handling user authentication, registration and email verification
class Login extends React.Component {
    // Initial state including email verification fields
    state = {
        username: '',
        password: '',
        email: '',
        error: '',
        showRegister: false,
        showEmailVerification: false,
        showRegistrationOTP: false,
        showForgotPassword: false,
        otp: ''
    }

    // Handle user login with email verification check
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
                window.location.href = '/home';
            } else if (data.requiresVerification) {
                this.setState({ 
                    showEmailVerification: true,
                    error: 'Please verify your email'
                });
            } else {
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to connect to server' });
        }
    }

    // Handle new user registration with email
    handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.state.username, 
                    password: this.state.password,
                    email: this.state.email 
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.setState({ 
                    showRegistrationOTP: true,
                    error: 'Registration successful! Please enter the OTP sent to your email.'
                });
            } else {
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to connect to server' });
        }
    }

    // Email verification handlers
    handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.state.username,
                    email: this.state.email 
                }),
            });
            
            if (response.ok) {
                this.setState({ 
                    error: 'OTP sent to your email',
                    showOTPInput: true 
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to send OTP' });
        }
    }

    handleOTPVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.state.username,
                    otp: this.state.otp 
                }),
            });
            
            if (response.ok) {
                this.setState({ 
                    showEmailVerification: false,
                    showRegistrationOTP: false,
                    error: 'Email verified successfully! Please login.'
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to verify OTP' });
        }
    }

    // Password reset handlers
    handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.state.username }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.setState({ 
                    showOTPInput: true,
                    error: 'OTP sent to your registered email'
                });
            } else {
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to process request' });
        }
    }

    handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.state.username,
                    otp: this.state.otp,
                    newPassword: this.state.password
                }),
            });
            
            if (response.ok) {
                this.setState({
                    showForgotPassword: false,
                    showOTPInput: false,
                    error: 'Password reset successful! Please login.'
                });
            } else {
                const data = await response.json();
                this.setState({ error: data.message });
            }
        } catch (err) {
            this.setState({ error: 'Failed to reset password' });
        }
    }

    // Render different views based on state
    render() {
        if (this.state.showRegistrationOTP || this.state.showEmailVerification) {
            return (
                <div className="login-container">
                    <h2 className="login-header">Verify Email</h2>
                    {this.state.error && (
                        <div className={this.state.error.includes('successful') ? 'success-message' : 'error-message'}>
                            {this.state.error}
                        </div>
                    )}
                    {!this.state.showOTPInput ? (
                        <form onSubmit={this.handleEmailSubmit}>
                            <div className="form-group">
                                <label>Enter Your Email:</label>
                                <input
                                    type="email"
                                    value={this.state.email}
                                    onChange={(e) => this.setState({ email: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>
                            <button type="submit" className="submit-button">
                                Send OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={this.handleOTPVerify}>
                            <div className="form-group">
                                <label>Enter OTP:</label>
                                <input
                                    type="text"
                                    value={this.state.otp}
                                    onChange={(e) => this.setState({ otp: e.target.value })}
                                    required
                                    className="input"
                                    maxLength="6"
                                />
                            </div>
                            <button type="submit" className="submit-button">
                                Verify OTP
                            </button>
                        </form>
                    )}
                </div>
            );
        }

        // Main login/register form
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
                    {this.state.showRegister && (
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={this.state.email}
                                onChange={(e) => this.setState({ email: e.target.value })}
                                required
                                className="input"
                            />
                        </div>
                    )}
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
                {!this.state.showRegister && (
                    <button 
                        onClick={() => this.setState({ showForgotPassword: true })}
                        className="submit-button secondary"
                    >
                        Forgot Password?
                    </button>
                )}
            </div>
        );
    }
}

export default Login;
