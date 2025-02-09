'use client';

import { useEffect, useState, useCallback } from 'react';

export default function MarketTable() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'desc'
  });

  // Sorting function
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Special handling for numeric values
      if (key === 'odds' || key === 'volume') {
        aValue = key === 'volume' ? parseFloat(aValue.replace(/,/g, '')) : parseFloat(aValue);
        bValue = key === 'volume' ? parseFloat(bValue.replace(/,/g, '')) : parseFloat(bValue);
      }
      // Special handling for dates
      else if (key === 'endDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle column header click
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setMarkets(sortData(markets, key, direction));
  };

  const fetchMarkets = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/markets?page=${pageNum}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
        
      // Process and flatten the market data
      const processedMarkets = data.markets.flatMap(event => {
        if (!event.markets) return [];
        
        return event.markets.flatMap(market => {
          if (!market.outcomePrices || market.closed) return [];
          
          let outcomes, marketOutcomes;
          try {
            outcomes = market.outcomePrices ? JSON.parse(market.outcomePrices) : [];
            marketOutcomes = market.outcomes ? JSON.parse(market.outcomes) : [];
          } catch (e) {
            console.error('Error parsing market data:', e);
            return [];
          }

          if (!Array.isArray(outcomes) || outcomes.length < 2) return [];
          
          // Compare the two outcomes and keep only the higher one
          const price1 = parseFloat(outcomes[0]) || 0;
          const price2 = parseFloat(outcomes[1]) || 0;
          const higherIndex = price1 >= price2 ? 0 : 1;
          const position = higherIndex === 0 ? 'Yes' : 'No';
          
          return [{
            eventName: event.title,
            marketName: market.groupItemTitle || 'Unknown',
            position: position,
            odds: parseFloat(outcomes[higherIndex]).toFixed(3),
            endDate: market.endDate ? new Date(market.endDate).toLocaleString() : 'N/A',
            volume: market.volume ? parseInt(market.volume).toLocaleString() : '0'
          }];
        });
      });

      if (processedMarkets.length === 0) {
        setHasMore(false);
      } else {
        setMarkets(prevMarkets => [...prevMarkets, ...processedMarkets]);
        setPage(pageNum);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets(1);
  }, [fetchMarkets]);

  if (loading) return <div className="text-center p-4">Loading markets...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  // Helper function to render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchMarkets(page + 1);
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* <div className="mb-4 flex justify-end">
        <button
          onClick={handleLoadMore}
          disabled={loading || !hasMore}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            loading || !hasMore
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Loading...' : hasMore ? 'Load More' : 'No More Data'}
        </button>
      </div> */}
      <table className="min-w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              onClick={() => handleSort('eventName')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Event{renderSortIndicator('eventName')}
            </th>
            <th 
              onClick={() => handleSort('marketName')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Market{renderSortIndicator('marketName')}
            </th>
            <th 
              onClick={() => handleSort('position')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Position{renderSortIndicator('position')}
            </th>
            <th 
              onClick={() => handleSort('odds')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Odds{renderSortIndicator('odds')}
            </th>
            <th 
              onClick={() => handleSort('endDate')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              End Date{renderSortIndicator('endDate')}
            </th>
            <th 
              onClick={() => handleSort('volume')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Volume{renderSortIndicator('volume')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {markets.map((market, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.eventName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.marketName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.odds}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.endDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{market.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}