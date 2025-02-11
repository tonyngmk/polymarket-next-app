import Image from "next/image";

import MarketTable from './components/MarketTable';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';

export default function Home() {
  // Sample data for the charts
  const volumeChartData = {
    title: 'Market Volume Distribution',
    labels: ['Market A', 'Market B', 'Market C', 'Market D', 'Market E'],
    datasets: [{
      label: 'Volume',
      data: [12000, 19000, 3000, 5000, 2000],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      borderWidth: 1
    }]
  };

  const priceVolumeData = {
    title: 'Price and Volume Trends',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Price',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Volume',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Polymarket Markets</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Market Volume Chart</h2>
          <BarChart data={volumeChartData} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Price and Volume Trends</h2>
          <LineChart data={priceVolumeData} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Market Table</h2>
          <MarketTable />
        </div>
      </div>
    </div>
  );
}
