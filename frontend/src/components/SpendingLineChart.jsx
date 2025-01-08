import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler, // Import the Filler plugin
} from 'chart.js';

// Register chart components including the Filler plugin
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Register the Filler plugin
);

function SpendingLineChart({ tripData }) {
    const chartData = {
        labels: tripData.map(trip => trip.tripName),
        datasets: [
            {
                label: "Amount Spent",
                data: tripData.map(trip => trip.amountSpent),
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                fill: true,  // The 'fill' option requires the Filler plugin
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
        },
    };

    return <Line data={chartData} options={options} />;
}

export default SpendingLineChart;
