import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { documentMetadataUrl }: { documentMetadataUrl: string } = await request.json();

    if (!documentMetadataUrl) {
      return NextResponse.json(
        { error: 'Document metadata URL is required' },
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

    console.log('Fetching document metadata from:', documentMetadataUrl);
    
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
    const response = await fetch(documentMetadataUrl, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'UK-Company-Insights/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Document metadata not found' },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('Document Metadata API Error:', errorText);
      
      throw new Error(`Document API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Document metadata response:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching document metadata:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch document metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 