import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getTripTelemetry } from '../api.ts';

interface SpeedChartProps {
  tripId: number;
}

export default function SpeedChart({ tripId }: SpeedChartProps) {
  const [series, setSeries] = useState<{ name: string; data: [number, number][] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChartData() {
      setIsLoading(true);
      const data = await getTripTelemetry(tripId);

      // Transform the raw telemetry data into the [timestamp, value] format ApexCharts expects
      const formattedData = data.map((point) => {
        const timestamp = new Date(point.recorded_at).getTime();

        // Convert meters per second to MPH (1 m/s = 2.23694 mph)
        // If speed is null (lost GPS), default to 0
        const speedMph = point.speed_mps !== null
          ? Math.round(point.speed_mps * 2.23694)
          : 0;

        return [timestamp, speedMph] as [number, number];
      });

      setSeries([{ name: 'Speed (mph)', data: formattedData }]);
      setIsLoading(false);
    }

    if (tripId) {
      loadChartData();
    }
  }, [tripId]);

  // ApexCharts Configuration Object
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent', // Lets your Tailwind dark mode shine through
      toolbar: {
        autoSelected: 'pan',
        show: false // Hides the clunky desktop toolbar for a cleaner mobile UI
      },
      animations: {
        enabled: false // Disabling animations improves performance for thousands of data points
      }
    },
    theme: {
      mode: 'dark',
    },
    colors: ['#3b82f6'], // Tailwind Blue-500
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeFormatter: {
          hour: 'HH:mm', // Formats the X-axis labels to show hours and minutes
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      title: {
        text: 'Speed (mph)',
        style: { color: '#9ca3af' } // Tailwind Gray-400
      },
      min: 0,
    },
    tooltip: {
      x: {
        format: 'hh:mm:ss TT' // Shows exact time when you tap a point on the graph
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800 rounded-xl animate-pulse">
        <p className="text-gray-400">Loading trip data...</p>
      </div>
    );
  }

  if (series[0]?.data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800 rounded-xl">
        <p className="text-gray-400">No telemetry data found for this trip.</p>
      </div>
    );
  }

  return (
    <div className="m-2 p-4 bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-white mb-2">Trip #{tripId} Telemetry</h2>
      <div className="h-72">
        <Chart
          options={chartOptions}
          series={series}
          type="area"
          height="100%"
        />
      </div>
    </div>
  );
}