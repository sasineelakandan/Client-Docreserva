'use client';

import { OlaMaps } from '../../public/olamap/OlaMapsWebSDK/dist/olamaps-js-sdk.es';
import { useEffect, useRef, useState } from 'react';
import Icon from '../../public/png-transparent-computer-icons-map-map-cdr-map-vector-map.png'
import '../../public/olamap/OlaMapsWebSDK/dist/style.css';
import Image from 'next/image';
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

interface Props {
    onLocationSelect: (locationData: { latitude: number; longitude: number; address: string }) => void;
}

const MapComponent: React.FC<Props> = ({ onLocationSelect }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [query, setQuery] = useState('');
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });

    useEffect(() => {
        if (mapContainerRef.current) {
            const olaMaps = new OlaMaps({
                apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
            });

            const map = olaMaps.init({
                style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
                container: mapContainerRef.current,
                center: [coordinates.lng, coordinates.lat],
                zoom: 12,
            });

            mapRef.current = map;

            markerRef.current = olaMaps
                .addMarker({
                    color: '#FF0000',
                    draggable: true,
                })
                .setLngLat([coordinates.lng, coordinates.lat])
                .addTo(map);

            const onDragEnd = () => {
                const lngLat = markerRef.current?.getLngLat();
                if (lngLat) {
                    const { lat, lng } = lngLat;
                    setCoordinates({ lat, lng });
                    fetchAddress(lat, lng);
                }
            };

            markerRef.current?.on('dragend', onDragEnd);

            return () => {
                map?.remove();
                if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            };
        }
    }, [coordinates]);

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
                {
                    headers: {
                        'X-Request-Id': 'unique-request-id',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data?.results?.length > 0) {
                    const formattedAddress = data.results[0]?.formatted_address || 'Address not found';
                    setAddress(formattedAddress);
                    onLocationSelect({ latitude: lat, longitude: lng, address: formattedAddress });
                } else {
                    setErrorMessage('No address found for the given coordinates.');
                }
            } else {
                setErrorMessage('Failed to fetch address.');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred.');
        }
    };

    const searchPlaces = async (searchQuery: string) => {
        if (!searchQuery) {
            setSearchResults([]);
            setDropdownVisible(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(searchQuery)}&api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
                { headers: { 'X-Request-Id': 'request-123' } }
            );

            if (response.ok) {
                const data = await response.json();
                if (data?.predictions?.length > 0) {
                    setSearchResults(data.predictions);
                    setDropdownVisible(true);
                    setErrorMessage('');
                } else {
                    setErrorMessage('No results found.');
                    setDropdownVisible(false);
                }
            } else {
                setErrorMessage('Failed to fetch data.');
                setDropdownVisible(false);
            }
        } catch (error) {
            setErrorMessage('An error occurred while fetching data.');
            setDropdownVisible(false);
        }
    };

    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
                { headers: { 'X-Request-Id': 'request-123' } }
            );

            if (response.ok) {
                const data = await response.json();
                return data?.result?.geometry?.location || null;
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
        return null;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            searchPlaces(value);
        }, 500);
    };

    const handleLocationSelect = async (place: PlacePrediction) => {
        setQuery(place.description);
        setDropdownVisible(false);

        const location = await fetchPlaceDetails(place.place_id);
        if (location) {
            mapRef.current?.flyTo({
                center: [location.lng, location.lat],
                zoom: 15,
            });

            markerRef.current?.setLngLat([location.lng, location.lat]);
            setSelectedCoordinates(location);
            fetchAddress(location.lat, location.lng);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '10px', position: 'relative' }}>
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
                {isDropdownVisible && searchResults.length > 0 && (
                    <ul
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                            zIndex: 10,
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            width: '100%',
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
                                    (e.currentTarget.style.backgroundColor = '#f5f5f5')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = 'white')
                                }
                            >
                                {place.description}
                            </li>
                        ))}
                    </ul>
                )}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>

            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '500px', borderRadius: '8px' }}
            />

<div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
{address && (
  <>
    <Image 
      src={Icon} 
      alt="Map Icon" 
      style={{ width: '24px', height: '24px', cursor: 'pointer' }} 
    />
    <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#555' }}>
      Selected Location: {address}
    </p>
  </>
)}
</div>

        </div>
    );
};

export default MapComponent;
