import { useTracking } from './TrackingContext';
import ActiveTrackingDisplay from './components/ActiveTrackingDisplay';
import SpeedChart from './components/SpeedChart';
import RouteMap from './components/RouteMap';
import AltitudeChart from './components/AltitudeChart';
import EfficiencyScoreCard from './components/EfficiencyScoreCard';

export default function App() {
  // We grab finishedTripId from the context now!
  const { error, isLoading, isTracking, handleGetLocation, finishedTripId, efficiencyScore } = useTracking();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">

      {/* Control Panel */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center mt-4 z-10">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Efficiency Tracker</h1>

        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className={`w-full font-bold py-3 px-6 rounded-lg transition-colors mb-6 shadow-md text-lg disabled:opacity-50 ${isTracking
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
        >
          {isLoading ? 'Processing...' : isTracking ? 'Stop Tracking' : 'Start Driving'}
        </button>

        {error && (
          <div className="text-red-400 bg-red-900/30 p-3 rounded mb-4 text-sm">
            Error: {error}
          </div>
        )}

        {isTracking && <ActiveTrackingDisplay />}
      </div>

      {/* Post-Trip Dashboard (Only shows when tracking is OFF and we have a finished trip) */}
      {!isTracking && finishedTripId && (
        <div className="w-full max-w-5xl mt-8 animate-fade-in pb-10">
          {/* Top section: Scorecard */}
          <div className="flex justify-center w-full">
            <EfficiencyScoreCard score={efficiencyScore} />
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-white mb-6 border-b border-gray-700 pb-4">
              Trip #{finishedTripId} Summary
            </h2>

            {/* Grid layout for the three charts/maps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="w-full">
                <SpeedChart tripId={finishedTripId} />
              </div>
              <div className="w-full">
                <AltitudeChart tripId={finishedTripId} />
              </div>
              <div className="w-full lg:col-span-2">
                <RouteMap tripId={finishedTripId} />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}