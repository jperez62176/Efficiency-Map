import { useTracking } from "../TrackingContext";

export default function ActiveTrackingDisplay() {
    const { currentTripId, location, timestamp } = useTracking();
    if (!location) return null;

    return (
        <div className="text-left bg-gray-700 p-4 rounded-lg w-full mb-6 shadow-inner animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-600 pb-2 mb-3">
                <h2 className="text-lg font-bold text-green-400">Live Telemetry</h2>
                <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>

            <div className="space-y-1">
                <p><span className="font-semibold text-gray-400">Active Trip ID:</span> <span className="text-white">{currentTripId}</span></p>
                <p><span className="font-semibold text-gray-400">Latitude:</span> <span className="text-white">{location.lat.toFixed(6)}°</span></p>
                <p><span className="font-semibold text-gray-400">Longitude:</span> <span className="text-white">{location.lng.toFixed(6)}°</span></p>
                <p><span className="font-semibold text-gray-400">Altitude:</span> <span className="text-white">{location.alt.toFixed(2)} m</span></p>
                <p><span className="font-semibold text-gray-400">Last Ping:</span> <span className="text-white">{timestamp}</span></p>
            </div>
        </div>
    );
}