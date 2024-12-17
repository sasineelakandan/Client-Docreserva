import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  closeMap: () => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, closeMap }) => {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]); // Default position

  // This component will handle map events
  const MapEvents = () => {
    useMapEvents({
      click: (event) => {
        const { lat, lng } = event.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });
      },
    });
    return null; // This component does not render anything
  };

  return (
    <div className="relative w-full">
      {/* Map Container with proper height and responsiveness */}
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={L.icon({ iconUrl: '/marker-icon.png' })} />
        <MapEvents /> {/* Include the MapEvents component here */}
      </MapContainer>

      {/* Close Button */}
      <button 
        onClick={closeMap} 
        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-colors duration-200"
      >
        X
      </button>
    </div>
  );
};

export default LocationMap;
