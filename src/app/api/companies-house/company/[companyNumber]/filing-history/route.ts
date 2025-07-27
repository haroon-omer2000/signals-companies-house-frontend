import { NextRequest, NextResponse } from 'next/server';

import type { Filing } from '@/types/companies-house';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyNumber: string } }
) {
  const { companyNumber } = params;
  const searchParams = request.nextUrl.searchParams;
  const itemsPerPage = searchParams.get('items_per_page') || '100';
  const category = searchParams.get('category');

  if (!companyNumber) {
    return NextResponse.json(
      { error: 'Company number is required' },
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
    let companiesHouseUrl = `${process.env.COMPANIES_HOUSE_BASE_URL}/company/${companyNumber}/filing-history?items_per_page=${itemsPerPage}`;
    
    if (category) {
      companiesHouseUrl += `&category=${category}`;
    }
    
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
    console.log('Fetching filing history from:', companiesHouseUrl);
    
    const response = await fetch(companiesHouseUrl, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'UK-Company-Insights/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company filing history not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      throw new Error(`Companies House API error: ${response.status} - ${errorText}`);
    }

    const data: { items?: Filing[]; total_count?: number } = await response.json();
    
    // Filter for accounts/financial documents if no specific category requested
    if (!category) {
      const financialCategories = ['accounts', 'annual-return', 'confirmation-statement'];
      const filteredItems = data.items?.filter((item: Filing) => 
        financialCategories.some(cat => item.category?.toLowerCase().includes(cat)) ||
        item.description?.toLowerCase().includes('accounts') ||
        item.description?.toLowerCase().includes('annual')
      ) || [];
      
      // Return the 6 most recent financial filings
      data.items = filteredItems.slice(0, 6);
      data.total_count = filteredItems.length;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch filing history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 