import React, { useEffect, useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const VenuesTable = () => {
    const [venues, setVenues] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All categories');
    const [categories, setCategories] = useState(['All categories']);
    const username = localStorage.getItem('username');
    const [distanceFilter, setDistanceFilter] = useState(50);
    const [userLocation, setUserLocation] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchVenues();
        fetchFavourites();
    }, []);

    useEffect(() => {
        if (venues.length > 0) {
            const extractCategories = () => {
                const categorySet = new Set();
                venues.forEach(venue => {
                    const match = venue.name.match(/\((.*?)\)/);
                    if (match && match[1]) {
                        const category = match[1].replace(/\d+$/, '').trim();
                        categorySet.add(category);
                    }
                });
                return ['All categories', ...Array.from(categorySet)];
            };
            setCategories(extractCategories());
        }
    }, [venues]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setUserLocation({ lat: 22.3193, lng: 114.1694 }); // Default HK coordinates
                }
            );
        }
    }, []);

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:5001/venues');
            const data = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const fetchFavourites = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/favourites/${username}`);
            const data = await response.json();
            setFavourites(data.map(fav => fav.id));
        } catch (error) {
            console.error('Error fetching favourites:', error);
        }
    };

    const toggleFavourite = async (locationId) => {
        try {
            const isFavourited = favourites.includes(locationId);
            const endpoint = isFavourited ? 'remove' : 'add';
            
            const response = await fetch(`http://localhost:5001/api/favourites/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    locationId
                })
            });

            if (response.ok) {
                if (isFavourited) {
                    setFavourites(favourites.filter(id => id !== locationId));
                } else {
                    setFavourites([...favourites, locationId]);
                }
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const searchVenues = (venues, searchTerm) => {
        let filteredResults = venues;

        // Apply distance filter
        if (userLocation && distanceFilter < 50) { // Only filter if less than max distance
            filteredResults = filteredResults.filter(venue => {
                if (!venue.latitude || !venue.longitude) return true; // Skip venues without coordinates
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    venue.latitude,
                    venue.longitude
                );
                return distance <= distanceFilter;
            });
        }

        // Apply category filter first
        if (selectedCategory !== 'All categories') {
            filteredResults = filteredResults.filter(venue => 
                venue.name.includes(`(${selectedCategory}`)
            );
        }

        // If no search term, return category-filtered results
        if (!searchTerm.trim()) return filteredResults;

        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return filteredResults.filter(venue => {
            const venueName = venue.name.toLowerCase();
            const venueId = venue.id.toString();

            // Search strategies
            const strategies = [
                // Exact match
                () => venueName === searchTerm.toLowerCase(),
                
                // ID match
                () => venueId.includes(searchTerm),
                
                // All search terms must be present (in any order)
                () => searchTerms.every(term => venueName.includes(term)),
                
                // Matches start of venue name or any word in venue name
                () => venueName.startsWith(searchTerm.toLowerCase()) ||
                      venueName.split(' ').some(word => word.startsWith(searchTerm.toLowerCase())),
                
                // Partial match anywhere in the name
                () => venueName.includes(searchTerm.toLowerCase()),
                
                // Fuzzy matching (allows for minor typos)
                () => {
                    const maxDistance = Math.floor(searchTerm.length * 0.3); // Allow 30% difference
                    return levenshteinDistance(venueName, searchTerm.toLowerCase()) <= maxDistance;
                }
            ];

            return strategies.some(strategy => strategy());
        });
    };

    // Levenshtein distance calculation for fuzzy matching
    const levenshteinDistance = (str1, str2) => {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));
        
        for(let i = 0; i <= str1.length; i++) track[0][i] = i;
        for(let j = 0; j <= str2.length; j++) track[j][0] = j;

        for(let j = 1; j <= str2.length; j++) {
            for(let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1,
                    track[j - 1][i] + 1,
                    track[j - 1][i - 1] + indicator
                );
            }
        }

        return track[str2.length][str1.length];
    };

    // Handle search input change with debouncing
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const filteredVenues = searchVenues(venues, debouncedSearchTerm);

    // Sorting Number of Events
    const sortVenues = (venuesToSort) => {
        return [...venuesToSort].sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.eventCount - a.eventCount;
            } else {
                return a.eventCount - b.eventCount;
            }
        });
    };

    return (
        <div className="venues-container">
            <div className="venues-header">
                <h2>Venue List</h2>
                <div className="filters-container">
                    <div className="distance-filter">
                        <label>Filter by Distance</label>
                        <div className="slider-container">
                            <Slider
                                min={0}
                                max={50}
                                value={distanceFilter}
                                onChange={setDistanceFilter}
                                railStyle={{ backgroundColor: '#e0e0e0' }}
                                trackStyle={{ backgroundColor: '#3498db' }}
                                handleStyle={{
                                    borderColor: '#3498db',
                                    backgroundColor: '#3498db'
                                }}
                            />
                            <div className="distance-value">{distanceFilter} km</div>
                        </div>
                    </div>
                    <Form.Select
                        className="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </Form.Select>
                    <div className="search-container">
                        <Form.Control
                            type="text"
                            placeholder="Search by venue name or ID..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredVenues.length === 0 && (searchTerm || selectedCategory !== 'All categories') && (
                            <div className="no-results">No venues found</div>
                        )}
                    </div>
                </div>
            </div>
            
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Venue ID</th>
                        <th>Venue Name</th>
                        <th 
                            className="sortable-header"
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            style={{ cursor: 'pointer' }}
                        >
                            Number of Events 
                            <span style={{ marginLeft: '5px' }}>
                                {sortOrder === 'desc' ? '▼' : '▲'}
                            </span>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortVenues(filteredVenues).map((venue) => (
                        <tr key={venue.id}>
                            <td>{venue.id}</td>
                            <td>
                                <Link to={`/venues/${venue.id}/comments`}>
                                    {venue.name}
                                </Link>
                            </td>
                            <td>{venue.eventCount}</td>
                            <td>
                                <Button
                                    variant={favourites.includes(venue.id) ? "danger" : "primary"}
                                    onClick={() => toggleFavourite(venue.id)}
                                >
                                    {favourites.includes(venue.id) ? "Remove from Favourites" : "Add to Favourites"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}; //

export default VenuesTable;
