import React from 'react';

class UserDashboard extends React.Component {
    render() {
        return (
            <div className="home-content">
                <video autoPlay playsInline muted loop controls={false} className="background-video" >
                    <source src="/videos/background.mp4" type="video/mp4" />
                </video>
                <div className="overlay">
                    {/* <h2>Welcome to User Dashboard</h2> */}
                    <h3>Welcome to the Event Management System.</h3>
                    <br />
                    In this system, you can find the latest events happening in Hong Kong.
                    <br />
                    You can also find the locations of the events on the map.
                    <br />
                    After logging in, you can also add events to your favourites and comment on the events.
                </div>
            </div>
        );
    }
}

export default UserDashboard;
