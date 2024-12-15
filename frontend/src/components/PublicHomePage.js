import React from 'react';
import { Link } from 'react-router-dom';

class PublicHomePage extends React.Component {
    render() {
        return (
            <>
                {/* <nav className="public-navbar">
                    <div className="public-nav-brand">Location App</div>
                    <Link to="/login" className="login-nav-button">Login</Link>
                </nav> */}
                <main className="content">
                    <h1>Welcome to Our Application</h1>
                    {/* Your public content here */}
                </main>
            </>
        );
    }
}

export default PublicHomePage;
