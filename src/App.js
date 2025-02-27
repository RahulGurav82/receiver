import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const App = () => {
  const [status, setStatus] = useState('OFF');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch data from the API every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://esp-server-c5yc.onrender.com/fetch');
        const { status, latitude, longitude } = response.data;
        setStatus(status);
        setLatitude(latitude);
        setLongitude(longitude);

        if (status === 'ON') {
          setShowPopup(true); // Show custom popup instead of alert
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowMap(true);
          setShowPopup(false); // Close the popup after fetching location
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Close the map
  const closeMap = () => {
    setShowMap(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Ambulance Tracker</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <p className="text-lg">
          <span className="font-semibold">Status:</span> {status}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Latitude:</span> {latitude}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Longitude:</span> {longitude}
        </p>
      </div>

      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-4">
              Ambulance is within 1km area.
            </p>
            <div className="flex gap-4">
              <button
                onClick={getUserLocation}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Compare Location
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {showMap && userLocation && latitude && longitude && (
        <div className="mt-8 w-full max-w-4xl h-96 relative">
          <button
            onClick={closeMap}
            className="absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-10"
          >
            Close Map
          </button>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            className="w-full h-full rounded-lg shadow-md"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your Location</Popup>
            </Marker>
            <Marker position={[latitude, longitude]}>
              <Popup>Ambulance Location</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default App;