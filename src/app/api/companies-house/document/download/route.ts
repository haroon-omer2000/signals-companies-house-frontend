import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { documentUrl, parseOnly }: { documentUrl: string; parseOnly?: boolean } = await request.json();

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      );
    }
    
    return await processDocumentDownload(documentUrl, parseOnly);
  } catch (error) {
    console.error('Document download/parsing error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentUrl = searchParams.get('documentUrl');
    const parseOnly = searchParams.get('parseOnly') === 'true';
    
    if (!documentUrl) {
      return NextResponse.json({ error: 'Document URL is required' }, { status: 400 });
    }
    
    return await processDocumentDownload(documentUrl, parseOnly);
  } catch (error) {
    console.error('Document download/parsing error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}

async function processDocumentDownload(documentUrl: string, parseOnly: boolean = false) {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Companies House API key not configured' },
      { status: 500 }
    );
  }

  // The documentUrl should already be the full content URL from metadata
  // Format: https://document-api.company-information.service.gov.uk/document/{document_id}/content
  const fullDocumentUrl = documentUrl;
  
  const authString = Buffer.from(`${apiKey}:`).toString('base64');
  
  console.log('Downloading document from:', fullDocumentUrl);
  
  const response = await fetch(fullDocumentUrl, {
    headers: {
      'Authorization': `Basic ${authString}`,
      'User-Agent': 'UK-Company-Insights/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
  }

  // Get content type to determine parsing method
  const contentType = response.headers.get('content-type') || '';
  
  // If this is just a download request, proxy the response directly
  if (!parseOnly) {
    console.log(`Proxying PDF document directly: ${response.headers.get('content-length')} bytes`);
    
    const filename = `document.pdf`;
    
    // Return the response directly as a proxy - this should be much faster
    return new Response(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType || 'application/pdf',
        'Content-Length': response.headers.get('content-length') || '',
      },
    });
  }
  
  // Only buffer the response if we need to parse it
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let extractedText = '';
  let documentType = '';

  if (contentType.includes('application/pdf') || documentUrl.toLowerCase().endsWith('.pdf')) {
    documentType = 'PDF';
    
    // For now, skip PDF text extraction to avoid parsing issues
    // In a production environment, you would use a more robust PDF parser
    // or a server-side service for text extraction
    if (parseOnly) {
      console.log('PDF parsing not available - using placeholder text');
      extractedText = `PDF Document: ${documentType}\nPages: ${buffer.length / 1024}KB\nContent extraction would require a production PDF parser.`;
    } else {
      console.log(`PDF document ready for download: ${buffer.length} bytes`);
      extractedText = 'PDF download ready';
    }
  } else if (contentType.includes('text/html') || documentUrl.toLowerCase().endsWith('.html')) {
    // Parse HTML
    try {
      console.log('Parsing HTML document...');
      const htmlContent = buffer.toString('utf-8');
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach((script: Element) => script.remove());
      
      // Extract text content
      extractedText = document.body?.textContent || document.textContent || '';
      documentType = 'HTML';
      console.log(`Extracted ${extractedText.length} characters from HTML`);
    } catch (htmlError) {
      console.error('HTML parsing error:', htmlError);
      throw new Error('Failed to parse HTML document');
    }
  } else {
    // Try to parse as text
    try {
      console.log('Attempting to parse as plain text...');
      extractedText = buffer.toString('utf-8');
      documentType = 'TEXT';
      console.log(`Extracted ${extractedText.length} characters as plain text`);
    } catch (textError) {
      console.error('Text parsing error:', textError);
      throw new Error(`Unsupported document type: ${contentType}`);
    }
  }

  // Clean up the extracted text
  const cleanedText = extractedText
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();

  // If this is a parsing request, return the extracted text
  // For PDFs without text extraction, we still want to return metadata
  if (parseOnly && (!cleanedText || (cleanedText.length < 50 && documentType !== 'PDF'))) {
    throw new Error('Document appears to be empty or too short');
  }

  return NextResponse.json({
    success: true,
    documentType,
    contentLength: cleanedText.length,
    extractedText: cleanedText,
    originalUrl: documentUrl,
  });
} 