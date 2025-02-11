'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function BarChart({ data, options = {} }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Cleanup function to destroy previous chart instance
    const cleanup = () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };

    // If no data is provided, clean up and return
    if (!data) {
      cleanup();
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    // Merge default options with provided options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: data.title || 'Bar Chart'
        }
      }
    };

    // Create new chart instance
    cleanup();
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: data.datasets || []
      },
      options: { ...defaultOptions, ...options }
    });

    // Cleanup on unmount
    return cleanup;
  }, [data, options]);

  return (
    <div className="w-full h-[400px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <canvas ref={chartRef} />
    </div>
  );
}