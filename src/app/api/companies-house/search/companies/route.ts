import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const itemsPerPage = searchParams.get('items_per_page') || '20';
  const startIndex = searchParams.get('start_index') || '1';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Companies House API key not configured' },
      { status: 500 }
    );
  }

  try {
    const companiesHouseUrl = `${process.env.COMPANIES_HOUSE_BASE_URL}/search/companies?q=${encodeURIComponent(query)}&items_per_page=${itemsPerPage}&start_index=${startIndex}`;
    
    // Companies House uses HTTP Basic Auth with API key as username and empty password
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
    console.log('Making request to:', companiesHouseUrl);
    console.log('API Key (first 8 chars):', apiKey.substring(0, 8) + '...');
    
    const response = await fetch(companiesHouseUrl, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'UK-Company-Insights/1.0',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed. Please check your Companies House API key.',
            details: 'Make sure your API key is valid and has the correct permissions.',
            status: response.status
          },
          { status: 401 }
        );
      }
      
      throw new Error(`Companies House API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch company data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 