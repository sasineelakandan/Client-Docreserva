'use client'



import { OlaMaps } from '../../public/olamap/OlaMapsWebSDK/dist/olamaps-js-sdk.es';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import polyline from 'polyline';
import logo from '../../public/PngItem_93782.png'
import Swal from 'sweetalert2';
import '../../public/olamap/OlaMapsWebSDK/dist/style.css';



interface MapComponentProps {
    location?: { latitude: number, longitude: number }
    company: { profilePic:string, name: string, phone: number | string };
    toggleview: () => void;
}

interface RouteDetails {
    duration: string;  // Assuming duration is a string (e.g., "10 mins")
    distance: number;  // Assuming distance is a number (e.g., 10)
}
const MapComponent: React.FC<MapComponentProps> = ({ location, company, toggleview }) => {
    
  
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [mapView, setMapView] = useState<boolean>(false)
    const mapRef = useRef<any | null>(null);
    const [routeDets, setRouteDets] = useState<RouteDetails | null>(null)
    const geoLocateRef = useRef<any | null>(null); // Store the geoLocate instance
    const [polyLine, setPolyLine] = useState<number[][] | null>(null)



    const handleGeoLocateError = useCallback((error: { PERMISSION_DENIED: number }) => {
        if (error.PERMISSION_DENIED) {
            Swal.fire({
                icon: 'info',
                title: 'Location Services Required',
                text: 'Please enable your location services to set your current location.',
                showConfirmButton: false,
                timer: 3000, // Auto-close after 3 seconds
                toast: true, // Makes it look more like a toast notification
                position: 'top-end', // Position the toast
            });

        }
        console.log('An error event has occurred.', error)
    }, [])

    // console.log("GEOLocale inside CallBAck :", event);
    const handleGeoLocateSuccess = useCallback(async (event: { coords: { latitude: number, longitude: number } }) => {
        const lat = event.coords.latitude
        const lng = event.coords.longitude
        try {
            // location ? [location.longitude, location.latitude]
            const response = await fetch(
                `https://api.olamaps.io/routing/v1/directions?origin=${lat},${lng}&destination=${location?.latitude},${location?.longitude}&api_key=${'BGnfCGHD0Ouoj1Dm4YKKoSc2liM9tlI9JlRZFrKb'}`,
                {
                    method: 'POST',
                    headers: { 'X-Request-Id': 'XXX' }
                }
            );
            const data = await response.json();
            // console.log(data);

            // console.log("route dets:", data.routes[0].legs[0].readable_distance, data.routes[0].legs[0].readable_duration);
            const routeDets = { distance: data.routes[0].legs[0].readable_distance, duration: data.routes[0].legs[0].readable_duration }
            setRouteDets(routeDets)
            const polyglonStr = data.routes[0].overview_polyline
            const decodedPolyglon = polyline.decode(polyglonStr)
            const swappedPolyline = decodedPolyglon.map(([lat, lng]) => [lng, lat]);

            setPolyLine(swappedPolyline)
        } catch (error) {
            console.log("Error while attempt to routing :", error);
        }
    }, [location?.latitude, location?.longitude])

    const drawPolyline = (map:any, coordinates: number[][]) => {
        if (map && map.getSource('route')) {
            console.log("Source 'route' already exists. Updating the source.");
            // Update the existing source
            const source = map.getSource('route');
            if (source) {
                source.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates,
                    },
                });
            }
        } else if (map) {
            console.log("Adding new source 'route'.");
            // Add the new source and layer
            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates,
                    },
                },
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#f00',
                    'line-width': 4,
                },
            });
        }
    };

    useEffect(() => {
        if (polyLine && mapRef.current) {
            console.log("IAM cAllinG to Dreow");
            drawPolyline(mapRef.current, polyLine);
        }
    }, [polyLine]);

    useEffect(() => {
        if (mapView) {
            const olaMaps = new OlaMaps({
                apiKey:'BGnfCGHD0Ouoj1Dm4YKKoSc2liM9tlI9JlRZFrKb'!,
            });

            const map = olaMaps.init({
                style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
                container: mapContainerRef.current, // Map container ID
                center: location ? [location.longitude, location.latitude] : [77.5946, 12.9716], // Bengaluru coordinates
                zoom: 12,
            });

            map.flyTo({
                center: location ? [location.longitude, location.latitude] : [77.5946, 12.9716],
                zoom: 15, // Zoom level
            });

            if (!mapRef.current) {
                mapRef.current = map; // Store map instance
            }

            // Create a custom marker element
            const customMarker = document.createElement('div');
            customMarker.classList.add('customMarkerClass');
            console.log("Company IMage :", company?.profilePic);


            // Add the background image directly using JavaScript
            if (false) {
                customMarker.style.backgroundImage = `url(${company?.profilePic})`; // Replace with your image URL
            } else {
                customMarker.style.backgroundImage = `url(${logo})`; // Replace with your image URL
            }
            // customMarker.style.backgroundImage = `url(${company?.images?.[0] === undefined} ? "/logo.jpeg" || ${company?.images?.[0]})`; // Replace with your image URL
            customMarker.style.backgroundSize = "cover"; // Ensures the image covers the element
            customMarker.style.backgroundPosition = "center"; // Centers the image
            customMarker.style.height = "60px"; // Adjust height as needed
            customMarker.style.width = "60px"; // Adjust width as needed
            customMarker.style.borderRadius = "50%"; // For a circular marker
            customMarker.style.border = "2px solid #FF0000"; // Optional: Add border styling

            const popup = olaMaps.addPopup({ offset: [0, -30], anchor: 'bottom' }).setHTML(`<div><strong>${company?.name}</strong><br>Contact : <strong>${company?.phone}</strong></div>`)

            const geoLocate = olaMaps.addGeolocateControls({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
            })

            geoLocate.on('geolocate', (event: Event) => handleGeoLocateSuccess(event as unknown as { coords: { latitude: number, longitude: number } }))
            geoLocate.on('error', handleGeoLocateError)
            geoLocateRef.current = geoLocate; // Save geoLocate instance to ref
            map.addControl(geoLocate);

            olaMaps
                .addMarker({
                    element: customMarker,
                    color: '#FF0000', // Red marker
                    draggable: false, // Enable dragging
                })
                .setLngLat(location ? [location.longitude, location.latitude] : [77.5946, 12.9716]) // Coordinates for the company
                .setPopup(popup)
                .addTo(map);


            return () => {
                geoLocate.off("error", handleGeoLocateError)
                geoLocate.off("geolocate", handleGeoLocateSuccess)
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null; // Reset map reference
                }
            };
        }

    }, [mapView, company?.name, company?.profilePic, company?.phone, handleGeoLocateSuccess, location?.latitude, location?.longitude, handleGeoLocateError, location]);

    const setCurrentLocation = () => {
        // console.log("HEELLOO");

        if (geoLocateRef.current) {
            geoLocateRef.current.trigger();
            return
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Location Services Required',
                text: 'Please enable your location services to set your current location.',
                showConfirmButton: false,
                timer: 3000, // Auto-close after 3 seconds
                toast: true, // Makes it look more like a toast notification
                position: 'top-end', // Position the toast
            });
            console.log('GeoLocate control is not initialized.');
            return
        }
    }

    return (
        <div>
            {/* Company Registration Form */}
            <div>
                {/* Existing form fields */}
                <button
                    type="button"
                    onClick={() => {
                        setMapView(true)
                        toggleview()
                    }
                    }
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Clinic Location
                </button>
            </div>
            <div className="flex flex-col">
                <div>
                    {mapView && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 9999, // Add a high z-index value
                            }}
                        >

                            <div
                                style={{
                                    width: '80%',
                                    maxWidth: '800px',
                                    height: '450px',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Map Container */}
                                <div
                                    ref={mapContainerRef}
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                    }}
                                />

                                {/* Route Details Section */}
                                {routeDets && (
                                    <div
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#f9f9f9',
                                            borderTop: '1px solid #ddd',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        <strong>Route Details :</strong>
                                        <p style={{ margin: '5px 0', color: '#333' }}>Duration : {routeDets.duration}</p>
                                        <p style={{ margin: '5px 0', color: '#333' }}>Distance : {routeDets.distance} Km</p>
                                    </div>
                                )}

                                {/* Buttons Section */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        display: 'flex',
                                        gap: '10px',
                                    }}
                                >
                                    <button
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px 24px',
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: 'background-color 0.3s',
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor = '#45A049')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = '#4CAF50')
                                        }
                                        type="button"
                                        onClick={() => setCurrentLocation()} // Replace with your handler
                                    >
                                        <FaMapMarkerAlt size={16} style={{ marginRight: '8px' }} />
                                        Get Directions
                                        <FaArrowRight size={16} />
                                    </button>

                                    <button
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#f44336',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: 'background-color 0.3s',
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor = '#d32f2f')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = '#f44336')
                                        }
                                        onClick={() => {
                                            setMapView(false);
                                            setRouteDets(null);
                                            toggleview();
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MapComponent;
