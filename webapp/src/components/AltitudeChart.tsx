import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { type ApexOptions } from 'apexcharts';
import { getTripTelemetry } from '../api';

interface AltitudeChartProps {
    tripId: number;
}

export default function AltitudeChart({ tripId }: AltitudeChartProps) {
    const [series, setSeries] = useState<{ name: string; data: [number, number][] }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadChartData() {
            setIsLoading(true);
            const data = await getTripTelemetry(tripId);

            const formattedData = data.map((point) => {
                const timestamp = new Date(point.recorded_at).getTime();
                // If altitude is null, default to 0
                const altitude = point.altitude_meters !== null ? Math.round(point.altitude_meters) : 0;
                return [timestamp, altitude] as [number, number];
            });

            setSeries([{ name: 'Elevation (m)', data: formattedData }]);
            setIsLoading(false);
        }

        if (tripId) {
            loadChartData();
        }
    }, [tripId]);

    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: 'dark' },
        colors: ['#10b981'], // Tailwind Emerald-500
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
        dataLabels: { enabled: false },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: { hour: 'HH:mm' }
            },
            tooltip: { enabled: false }
        },
        yaxis: {
            title: {
                text: 'Altitude (meters)',
                style: { color: '#9ca3af' }
            },
        },
        tooltip: {
            x: { format: 'hh:mm:ss TT' }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-800 rounded-xl animate-pulse">
                <p className="text-gray-400">Loading elevation data...</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-6">
            <h2 className="text-xl font-bold text-white mb-2">Elevation Profile</h2>
            <div className="h-72">
                <Chart options={chartOptions} series={series} type="area" height="100%" />
            </div>
        </div>
    );
}