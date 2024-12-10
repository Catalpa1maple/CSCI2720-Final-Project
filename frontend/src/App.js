import React from 'react';
import { BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';
import PublicHomePage from './components/PublicHomePage';
import './loginpage.css';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={PublicHomePage} /> 
                    <Route path="/login" component={Login} />
                    <PrivateRoute
                        path="/admin"
                        component={AdminDashboard}
                        adminRequired
                    />
                    <PrivateRoute
                        path="/home"
                        component={HomePage}
                    />
                </Switch>
            </BrowserRouter>
        );
    }
}
// Component to handle protected routes and authentication
class PrivateRoute extends React.Component {
    render() {
        const { component: Component, adminRequired = false, ...rest } = this.props;
        const isAuthenticated = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isadmin') === '1';

        return (
            <Route
                {...rest}
                render={props => {
                    if (!isAuthenticated) {
                        return <Redirect to="/" />;
                    }

                    return (
                        <>
                            <Navigation />
                            <Component {...props} />
                        </>
                    );
                }}
            />
        );
    }
}

// Navigation bar component with user info and logout
class Navigation extends React.Component {
    handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    }

    render() {
        const isAdmin = localStorage.getItem('isadmin') === '1';
        const username = localStorage.getItem('username');

        return (
            <nav className="navbar">
                <div className="nav-brand">Location App</div>
                <div className="nav-links">
                    {/*Demo */}
                    <Link className="nav-link" to="/home">Home</Link>
                    <Link className="nav-link" to="/locations">Locations</Link>
                    <Link className="nav-link" to="/map">Map</Link>
                    <Link className="nav-link" to="/favorites">Favorites</Link>
                    
                    {isAdmin && (
                        <Link className="nav-link" to="/admin">Admin Panel</Link>
                    )}
                    <div className="user-info">
                        <span>Welcome, {username}</span>
                        <button onClick={this.handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        );
    }
}

export default App;
