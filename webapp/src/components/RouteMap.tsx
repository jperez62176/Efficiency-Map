import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { getTripTelemetry } from '../api';

// CRITICAL: Leaflet will break visually without this CSS import
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  tripId: number;
}

export default function RouteMap({ tripId }: RouteMapProps) {
  const [routePath, setRoutePath] = useState<LatLngExpression[]>([]);
  const [startPoint, setStartPoint] = useState<LatLngExpression | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      setIsLoading(true);
      const data = await getTripTelemetry(tripId);

      if (data.length > 0) {
        // Map the data to the [latitude, longitude] array format Leaflet expects
        const coordinates: LatLngExpression[] = data.map(point => [
          point.latitude, 
          point.longitude
        ]);

        setRoutePath(coordinates);
        // Set the map's center to the very first recorded ping
        setStartPoint([data[0].latitude, data[0].longitude]);
      }
      
      setIsLoading(false);
    }

    if (tripId) {
      loadMapData();
    }
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-800 rounded-xl animate-pulse mt-6">
        <p className="text-gray-400">Loading route data...</p>
      </div>
    );
  }

  if (routePath.length === 0 || !startPoint) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-800 rounded-xl mt-6">
        <p className="text-gray-400">No route data found for this trip.</p>
      </div>
    );
  }

  return (
    <div className="m-2 p-4 bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Trip #{tripId} Route</h2>
      
      {/* The container MUST have a defined height, here we use Tailwind's h-96 (24rem) */}
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-700">
        <MapContainer 
          center={startPoint} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* OpenStreetMap provides free, open-source map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Draws the actual driving route */}
          <Polyline 
            positions={routePath} 
            color="#3b82f6" // Tailwind Blue-500
            weight={5}
            opacity={0.8}
          />
        </MapContainer>
      </div>
    </div>
  );
}