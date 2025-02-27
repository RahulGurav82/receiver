import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, X, Map, AlertTriangle, Navigation, ArrowRight } from 'lucide-react';

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
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex items-center justify-center mb-6">
          <Navigation className="text-blue-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-blue-900">Ambulance Tracker</h1>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border border-blue-100 mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <AlertTriangle className={status === 'ON' ? "text-green-600" : "text-red-600"} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <p className={`text-lg font-bold ${status === 'ON' ? "text-green-600" : "text-red-600"}`}>
                  {status}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex-1">
                <div className="flex items-center mb-2">
                  <MapPin className="text-green-600 mr-2" size={20} />
                  <p className="text-sm text-gray-500 font-medium">Latitude</p>
                </div>
                <p className="text-lg font-bold text-green-800">
                  {latitude ? latitude.toFixed(6) : "N/A"}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex-1">
                <div className="flex items-center mb-2">
                  <MapPin className="text-green-600 mr-2" size={20} />
                  <p className="text-sm text-gray-500 font-medium">Longitude</p>
                </div>
                <p className="text-lg font-bold text-green-800">
                  {longitude ? longitude.toFixed(6) : "N/A"}
                </p>
              </div>
            </div>
            
            <button
              onClick={getUserLocation}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            >
              <Map className="mr-2" size={20} />
              <span className="font-medium">View on Map</span>
            </button>
          </div>
        </div>

        {/* Map Container */}
        {showMap && userLocation && latitude && longitude && (
          <div className="w-full max-w-4xl h-96 bg-white p-4 rounded-xl shadow-lg border border-blue-100 relative mb-6">
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={closeMap}
                className="bg-white text-red-600 p-2 rounded-full shadow-md hover:bg-red-50 transition duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Your location to ambulance:</p>
                <div className="flex items-center mt-1">
                  <div className="h-3 w-3 rounded-full bg-blue-600 mr-2"></div>
                  <ArrowRight className="text-gray-400 mx-2" size={16} />
                  <div className="h-3 w-3 rounded-full bg-red-600 mr-2"></div>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg shadow border border-blue-100">
                <p className="font-bold text-blue-800">2.4 km</p>
              </div>
            </div>
            
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              className="w-full h-72 rounded-lg shadow-inner overflow-hidden"
              style={{ height: "calc(100% - 60px)" }}
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

      {/* Alert Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-3" size={28} />
              <h3 className="text-xl font-bold text-gray-800">Proximity Alert</h3>
            </div>
            <p className="text-gray-700 mb-6 pl-10">
              An ambulance is within 1km of your location. Please proceed with caution.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300 text-gray-700"
              >
                Dismiss
              </button>
              <button
                onClick={getUserLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
              >
                <Map className="mr-2" size={18} />
                <span>View Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;