'use client'

import { useEffect, useRef, useState } from 'react';
import { OlaMaps } from '../../public/olamap/OlaMapsWebSDK/dist/olamaps-js-sdk.es';
import '../../public/olamap/OlaMapsWebSDK/dist/style.css';

const MapComponent = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
    const [query, setQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null); // To store selected lat/lng
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Interface for Place Prediction from Ola Maps API
    interface PlacePrediction {
        place_id: string;
        description: string;
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }

    // Search for places using Ola Maps Autocomplete API
    const searchPlaces = async (searchQuery: string) => {
        if (!searchQuery) {
            setSearchResults([]);
            setDropdownVisible(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
                    searchQuery
                )}&api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
                { headers: { 'X-Request-Id': 'request-123' } }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.predictions.length > 0) {
                    setSearchResults(data.predictions);
                    setDropdownVisible(true);
                    setErrorMessage('');
                } else {
                    setSearchResults([]);
                    setDropdownVisible(false);
                    setErrorMessage('No results found.');
                }
            } else {
                setErrorMessage('Failed to fetch data.');
                setDropdownVisible(false);
            }
        } catch (error) {
            console.error('Error during fetch operation:', error);
            setErrorMessage('An error occurred while fetching data.');
            setDropdownVisible(false);
        }
    };

    // Fetch Place Details to get the location (lat/lng)
    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
                { headers: { 'X-Request-Id': 'request-123' } }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.result.geometry) {
                    const { lat, lng } = data.result.geometry.location;
                    return { lat, lng };
                }
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
        return null;
    };

    // Initialize OlaMaps on component mount
    useEffect(() => {
        const olaMaps = new OlaMaps({
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
        });

        mapRef.current = olaMaps.init({
            style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
            container: mapContainerRef.current?.id || '',
            center: [77.5946, 12.9716], // Default center: Bengaluru
            zoom: 12,
        });

        return () => {
            if (mapRef.current) mapRef.current.remove();
        };
    }, []);

    // Debounced search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            searchPlaces(value);
        }, 500);
    };

    // Handle location selection
    const handleLocationSelect = async (place: PlacePrediction) => {
        setQuery(place.description);
        setDropdownVisible(false);

        const location = await fetchPlaceDetails(place.place_id);
        if (location) {
            // Update the map with the selected location
            mapRef.current?.setCenter([location.lng, location.lat]);
            mapRef.current?.setZoom(15);

            // Store the coordinates in state
            setSelectedCoordinates(location);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Search Input */}
            <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search places..."
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => setDropdownVisible(true)}
                    style={{
                        padding: '10px',
                        width: '300px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                        outline: 'none',
                    }}
                />

                {/* Dropdown Suggestions */}
                {isDropdownVisible && searchResults.length > 0 && (
                    <ul
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '300px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderTop: 'none',
                            borderRadius: '0 0 5px 5px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                            zIndex: 10,
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {searchResults.map((place) => (
                            <li
                                key={place.place_id}
                                onClick={() => handleLocationSelect(place)}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = '#f8f8f8')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = 'white')
                                }
                            >
                                <strong>{place.description}</strong>
                                <br />
                                <span style={{ fontSize: '12px', color: '#555' }}>
                                    {place.formatted_address}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </form>

            {/* Map Container */}
            <div
                id="ola-map"
                ref={mapContainerRef}
                style={{ width: '100%', height: '500px', borderRadius: '5px' }}
            />

            {/* Error Message */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {/* Display selected coordinates */}
            {selectedCoordinates && (
                <div style={{ marginTop: '10px' }}>
                    <strong>Selected Coordinates:</strong>
                    <p>Latitude: {selectedCoordinates.lat}</p>
                    <p>Longitude: {selectedCoordinates.lng}</p>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
