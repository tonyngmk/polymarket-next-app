import { NextResponse } from 'next/server';

// Polymarket API endpoint
const BASE_POLYMARKET_API = 'https://gamma-api.polymarket.com/events';

// Function to fetch data with pagination
// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllMarkets() {
  let allData = [];
  let offset = 0;
  const limit = 20; // Polymarket API default limit
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page} (offset: ${offset})...`);
    
    // Calculate end date (5 days from today)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Configure API query parameters
    const queryParams = new URLSearchParams({
      closed: 'false',
      active: 'true',
      order: 'endDate',
      ascending: 'false',
      end_date_max: formattedEndDate,
      liquidity_min: '10000',
      volume_min: '10000',
      offset: offset.toString()
    });

    const response = await fetch(`${BASE_POLYMARKET_API}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data?.length || 0} markets from page ${page}`);
    
    // If no data returned, we've reached the end
    if (!data || data.length === 0) {
      console.log('No more data available, finishing pagination');
      break;
    }

    allData = [...allData, ...data];
    offset += limit;
    page += 1;

    // Add 0.1 second delay before next request
    await delay(100);
  }

  return allData;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const itemsPerPage = 10;
    
    // Calculate date 5 days from now
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    // Fetch data from Polymarket API
    const data = await fetchAllMarkets();

    // Filter events with markets ending within 5 days
    const filteredData = data.filter(event => {
      if (!event.markets || !Array.isArray(event.markets)) return false;
      // Check if any market within the event ends within 5 days
      return event.markets.some(market => {
        // Skip if market is closed or has no end date
        if (market.closed || !market.endDateIso) return false;
        const marketEndDate = new Date(market.endDateIso);
        const now = new Date();
        // Only include markets that end between now and 5 days from now
        return marketEndDate >= now && marketEndDate <= fiveDaysFromNow;
      });
    });

    // Paginate the filtered data
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Return the paginated data with proper headers
    return NextResponse.json(
      { markets: paginatedData },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}