import { useState, useRef } from 'react';
import { startNewTrip, sendTelemetryData } from './api.ts';

function App() {
  const [location, setLocation] = useState<{ lat: number; lng: number, alt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const [currentTripId, setCurrentTripId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Create a ref to store the tracking loop ID without causing re-renders
  const watchIdRef = useRef<number | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    // --- STOP TRACKING LOGIC ---
    if (isTracking) {
      // 1. Tell the browser to kill the active GPS tracking loop
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // 2. Reset the UI state
      setLocation(null);
      setIsTracking(false);
      setIsLoading(false);
      setCurrentTripId(null);
      return;
    } 
    
    // --- START TRACKING LOGIC ---
    const tripId = await startNewTrip();
    
    if (tripId) {
      setCurrentTripId(tripId);
      setIsTracking(true);
    } else {
      alert("Could not connect to the server to start the trip.");
      setIsLoading(false);
      return;
    }

    // 3. Request the current position and save the loop ID to our ref
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        
        // FIX: Use the local `tripId` variable directly, NOT `currentTripId!`
        sendTelemetryData({
          trip_id: tripId, 
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude_meters: position.coords.altitude,
          speed_mps: position.coords.speed
        });
        
        // Success callback updating the UI
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          alt: position.coords.altitude || 0 
        });
        setTimestamp(new Date(position.timestamp).toLocaleString());
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true, 
        timeout: 10000,           
        maximumAge: 0             
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Location Tracker</h1>

        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className={`font-semibold py-2 px-6 rounded-lg transition-colors mb-6 disabled:opacity-50 ${
            isTracking ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : isTracking ? 'Stop Tracking' : 'Start Driving'}
        </button>

        {error && (
          <div className="text-red-400 bg-red-900/30 p-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {location && (
          <div className="text-left bg-gray-700 p-4 rounded-lg">
            <p><span className="font-semibold text-gray-300">Active Trip ID:</span> {currentTripId}</p>
            <p><span className="font-semibold text-gray-300">Latitude:</span> {location.lat}</p>
            <p><span className="font-semibold text-gray-300">Longitude:</span> {location.lng}</p>
            <p><span className="font-semibold text-gray-300">Altitude:</span> {location.alt} meters</p>
            <p><span className="font-semibold text-gray-300">Timestamp:</span> {timestamp}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App;