import Image from "next/image";

import MarketTable from './components/MarketTable';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Polymarket Markets</h1>
      <MarketTable />
    </div>
  );
}
