'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function LineChart({ data, options = {} }) {
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
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: data.title || 'Multi-Axis Line Chart'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Price'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Volume'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };

    // Create new chart instance
    cleanup();
    chartInstance.current = new Chart(ctx, {
      type: 'line',
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