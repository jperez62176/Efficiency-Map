import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import { startNewTrip, sendTelemetryData, endTrip } from './api';

// Define the data shapes
export interface LocationData {
    lat: number;
    lng: number;
    alt: number;
}

interface TrackingContextType {
    location: LocationData | null;
    error: string | null;
    isLoading: boolean;
    timestamp: string | null;
    currentTripId: number | null;
    isTracking: boolean;
    finishedTripId: number | null;
    efficiencyScore: number | null;
    handleGetLocation: () => Promise<void>;
}

// Initialize the Context
const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

// Create the Provider Component
export function TrackingProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timestamp, setTimestamp] = useState<string | null>(null);
    const [currentTripId, setCurrentTripId] = useState<number | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [finishedTripId, setFinishedTripId] = useState<number | null>(null);
    const [efficiencyScore, setEfficiencyScore] = useState<number | null>(null);

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
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }

            if (currentTripId) {
                const score = await endTrip(currentTripId);
                setEfficiencyScore(score);
                setFinishedTripId(currentTripId);
            }

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
            setFinishedTripId(null);
        } else {
            setError("Could not connect to the server to start the trip.");
            setIsLoading(false);
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                sendTelemetryData({
                    trip_id: tripId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    altitude_meters: position.coords.altitude,
                    speed_mps: position.coords.speed
                });

                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    alt: position.coords.altitude || 0
                });
                setTimestamp(new Date(position.timestamp).toLocaleTimeString());
                setIsLoading(false);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <TrackingContext.Provider value={{
            location, error, isLoading, timestamp, currentTripId, isTracking, finishedTripId, efficiencyScore, handleGetLocation
        }}>
            {children}
        </TrackingContext.Provider>
    );
}

// Custom hook to easily consume the context
export function useTracking() {
    const context = useContext(TrackingContext);
    if (context === undefined) {
        throw new Error('useTracking must be used within a TrackingProvider');
    }
    return context;
}