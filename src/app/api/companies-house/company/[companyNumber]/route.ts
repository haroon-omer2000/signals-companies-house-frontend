import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyNumber: string } }
) {
  const { companyNumber } = params;

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
    const companiesHouseUrl = `${process.env.COMPANIES_HOUSE_BASE_URL}/company/${companyNumber}`;
    
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
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
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      throw new Error(`Companies House API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch company details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 