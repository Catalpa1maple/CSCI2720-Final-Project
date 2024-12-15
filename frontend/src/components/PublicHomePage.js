import React from 'react';
import { Link } from 'react-router-dom';

class PublicHomePage extends React.Component {
    render() {
        return (
            <div className="content">
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
                <style>{`.content {
                        position: relative;
                        width: 100%;
                        height: 100vh;
                        overflow: hidden;
                        scroll-ban: yes;
                    }

                    .background-video {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transform: translate(-50%, -50%);
                        z-index: 100;
                    }

                    .overlay {
                        padding: 95px;
                        height: 60%;
                        background-color: rgba(255, 255, 255, 0.6);
                        position: relative;
                        color: black;
                        letter-spacing: 2px;
                        font-size: 25px;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        lefe: 50%;
                        top: 25%;
                        z-index: 200;
                        border-radius: 10px;
                        backdrop-filter:blur(25px);
                    }`
                }</style>
            </div>
        );
    }
}

export default PublicHomePage;
