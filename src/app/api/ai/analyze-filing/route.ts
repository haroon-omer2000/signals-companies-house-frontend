import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import type { Filing } from '@/types/companies-house';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { filing }: { filing: Filing } = await request.json();

    if (!filing) {
      return NextResponse.json(
        { error: 'Filing data is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // For now, create a mock analysis based on the filing description
    // In a full implementation, this would download and parse the actual document
    const mockAnalysis = await generateMockAnalysis(filing);

    return NextResponse.json({
      filing_id: filing.transaction_id,
      filing_type: filing.category,
      filing_date: filing.date,
      summary: mockAnalysis.summary,
      key_insights: mockAnalysis.key_insights,
      financial_highlights: mockAnalysis.financial_highlights,
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze filing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateMockAnalysis(filing: Filing) {
  const prompt = `
Analyze this UK company filing and provide insights:

Filing Type: ${filing.category}
Description: ${filing.description}
Date: ${filing.date}
Pages: ${filing.pages || 'Unknown'}

Please provide:
1. A concise summary of what this filing likely contains
2. Key insights about the company's financial position
3. Notable financial highlights

Keep the response professional and informative.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst expert in UK company filings and Companies House documents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Parse the AI response into structured data
    return {
      summary: extractSection(content, 'summary') || 'This filing provides important financial and regulatory information about the company.',
      key_insights: extractListItems(content, 'insights') || [
        'Regular compliance filing with Companies House',
        'Provides statutory financial information',
        'Maintains regulatory transparency requirements'
      ],
      financial_highlights: {
        revenue: 'To be analyzed from full document',
        profit: 'To be analyzed from full document',
        assets: 'To be analyzed from full document',
        liabilities: 'To be analyzed from full document'
      }
    };
  } catch (aiError) {
    console.error('OpenAI API Error:', aiError);
    
    // Fallback to a structured mock response
    return {
      summary: `This ${filing.category} filing from ${new Date(filing.date).getFullYear()} contains important financial and regulatory information for the company. The document provides statutory disclosures required by Companies House and offers insights into the company's operational and financial status during the reporting period.`,
      key_insights: [
        'Annual regulatory compliance filing',
        'Financial position and performance data',
        'Corporate governance information',
        'Statutory declarations and confirmations'
      ],
      financial_highlights: {
        revenue: 'Analysis pending - document download required',
        profit: 'Analysis pending - document download required', 
        assets: 'Analysis pending - document download required',
        liabilities: 'Analysis pending - document download required'
      }
    };
  }
}

function extractSection(content: string, sectionName: string): string | null {
  const lines = content.split('\n');
  let inSection = false;
  let section = '';
  
  for (const line of lines) {
    if (line.toLowerCase().includes(sectionName)) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      if (line.trim() === '' || line.match(/^\d+\./)) {
        break;
      }
      section += line.trim() + ' ';
    }
  }
  
  return section.trim() || null;
}

function extractListItems(content: string, section: string): string[] | null {
  const lines = content.split('\n');
  const items: string[] = [];
  let inSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(section)) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
        items.push(trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, ''));
      } else if (trimmed === '') {
        break;
      }
    }
  }
  
  return items.length > 0 ? items : null;
} 