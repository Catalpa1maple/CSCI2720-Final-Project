import React, { createContext } from 'react';
import { BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import HomePage from './components/HomePage';
import PublicHomePage from './components/PublicHomePage';
import venues from './components/Locations';
import Favourites from './components/Favourites';
import VenueComments from './components/VenueComments';
import Map from "./components/map"
import './style.css';

// Theme Context
export const ThemeContext = createContext();

class App extends React.Component {
    state = {
        isDarkMode: localStorage.getItem('theme') === 'dark'
    };

    componentDidMount() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.state.isDarkMode ? 'dark' : 'light');
    }


    toggleTheme = () => {
        this.setState(prevState => {
            const newMode = !prevState.isDarkMode;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
            return { isDarkMode: newMode };
        });
    };

    render() {
        return (
            <ThemeContext.Provider value={{ 
                isDarkMode: this.state.isDarkMode, 
                toggleTheme: this.toggleTheme 
            }}>
                <BrowserRouter>
                    <div className="app-container">
                        <Navigation />
                        <main className="main-content">
                            <Switch>
                                <Route exact path="/" component={PublicHomePage} />
                                <Route path="/login" component={Login} />
                                <Route path="/home" component={HomePage} />
                                <PrivateRoute path="/locations" component={venues} />
                                <PrivateRoute path="/map" component={Map} />
                                <PrivateRoute
                                    path="/admin"
                                    component={AdminDashboard}
                                    adminRequired
                                />
                                <PrivateRoute
                                    path="/venues/:id/comments"
                                    component={VenueComments}
                                />
                                <PrivateRoute
                                    path="/favourites"
                                    component={Favourites}
                                />
                            </Switch>
                        </main>
                    </div>
                </BrowserRouter>
            </ThemeContext.Provider>
        );
    }
}

// PrivateRoute for admin and authenticated-only features
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
                        return <Redirect to={{
                            pathname: "/login",
                            state: { from: props.location }
                        }} />;
                    }

                    if (adminRequired && !isAdmin) {
                        return <Redirect to="/home" />;
                    }

                    return <Component {...props} />;
                }}
            />
        );
    }
}

// Navigation component
class Navigation extends React.Component {
    static contextType = ThemeContext;

    handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    }

    render() {
        const { isDarkMode, toggleTheme } = this.context;
        const isAuthenticated = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isadmin') === '1';
        const username = localStorage.getItem('username');

        return (
            <nav className="navbar">
                <div className="nav-brand">LOCATIONS APP</div>
                <div className="nav-links">
                    <Link className="nav-link" to="/home">HOME</Link>
                    
                    {isAuthenticated && (
                        <>
                            <Link className="nav-link" to="/locations">LOCATIONS</Link>
                            <Link className="nav-link" to="/map">MAP</Link>
                            <Link className="nav-link" to="/favourites">FAVOURITE</Link>
                            {isAdmin && (
                                <Link className="nav-link" to="/admin">ADMIN PANEL</Link>
                            )}
                        </>
                    )}
                    <button onClick={toggleTheme} className="theme-toggle">
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    <div className="user-controls">
                        
                        {isAuthenticated ? (
                            <div className="user-info">
                                <span>Hi, {username}</span>
                                <button onClick={this.handleLogout} className="logout-button">
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="login-nav-button">LOGIN</Link>
                        )}
                    </div>
                </div>
            </nav>
        );
    }
}

export default App;