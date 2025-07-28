'use client';

import { Badge, Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

import type { Filing } from '@/types/companies-house';

interface FinancialHealthScoreProps {
  filings: Filing[];
  companyName: string;
}

interface HealthMetrics {
  score: number;
  filingRegularity: number;
  complianceStatus: string;
  lastFilingDays: number;
  insights: string[];
}

export function FinancialHealthScore({ filings, companyName }: FinancialHealthScoreProps) {
  const calculateHealthScore = (): HealthMetrics => {
    if (filings.length === 0) {
      return {
        score: 0,
        filingRegularity: 0,
        complianceStatus: 'No Data',
        lastFilingDays: 0,
        insights: ['No filing history available']
      };
    }

    let score = 0;
    const insights: string[] = [];
    
    // Sort filings by date (newest first)
    const sortedFilings = [...filings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate days since last filing
    const lastFilingDate = new Date(sortedFilings[0].date);
    const today = new Date();
    const lastFilingDays = Math.floor((today.getTime() - lastFilingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Score based on recency of last filing (0-30 points)
    if (lastFilingDays <= 90) {
      score += 30;
      insights.push('Recent filings indicate good compliance');
    } else if (lastFilingDays <= 365) {
      score += 20;
      insights.push('Filing within the last year shows reasonable compliance');
    } else if (lastFilingDays <= 730) {
      score += 10;
      insights.push('Filing within the last 2 years shows some compliance');
    } else {
      insights.push('No recent filings - potential compliance issues');
    }
    
    // Score based on filing frequency (0-25 points)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const recentFilings = filings.filter(f => new Date(f.date) >= oneYearAgo).length;
    
    if (recentFilings >= 3) {
      score += 25;
      insights.push('High filing frequency indicates active compliance');
    } else if (recentFilings >= 1) {
      score += 15;
      insights.push('Regular filing pattern maintained');
    } else {
      insights.push('Low filing frequency may indicate compliance issues');
    }
    
    // Score based on filing types (0-25 points)
    const hasAccounts = filings.some(f => f.category === 'accounts');
    const hasAnnualReturns = filings.some(f => f.category === 'annual-return' || f.category === 'confirmation-statement');
    
    if (hasAccounts && hasAnnualReturns) {
      score += 25;
      insights.push('Complete filing types (accounts and annual returns)');
    } else if (hasAccounts || hasAnnualReturns) {
      score += 15;
      insights.push('Partial filing types - some key documents present');
    } else {
      insights.push('Missing key filing types');
    }
    
    // Score based on document completeness (0-20 points)
    const hasDetailedFilings = filings.some(f => f.pages && f.pages > 10);
    if (hasDetailedFilings) {
      score += 20;
      insights.push('Detailed documents indicate thorough reporting');
    } else if (filings.some(f => f.pages && f.pages > 5)) {
      score += 10;
      insights.push('Moderate document detail level');
    } else {
      insights.push('Limited document detail may indicate minimal reporting');
    }
    
    // Determine compliance status
    let complianceStatus = 'Excellent';
    if (score < 40) complianceStatus = 'Poor';
    else if (score < 60) complianceStatus = 'Fair';
    else if (score < 80) complianceStatus = 'Good';
    
    // Calculate filing regularity percentage
    const filingRegularity = Math.min(100, Math.max(0, score));
    
    return {
      score: Math.min(100, score),
      filingRegularity,
      complianceStatus,
      lastFilingDays,
      insights: insights.slice(0, 3) // Limit to 3 insights
    };
  };

  const metrics = calculateHealthScore();
  
  // Check if we have enough data for meaningful analysis
  const hasEnoughData = filings.length > 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={20} style={{ color: '#10b981' }} />;
    if (score >= 60) return <Activity size={20} style={{ color: '#f59e0b' }} />;
    if (score >= 40) return <Clock size={20} style={{ color: '#f97316' }} />;
    return <AlertTriangle size={20} style={{ color: '#ef4444' }} />;
  };

  return (
    <Card
      shadow="sm"
      padding="xl"
      radius="md"
      withBorder
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              Financial Health Score
            </Title>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Compliance and filing health assessment for {companyName}
            </Text>
          </div>
          {getScoreIcon(metrics.score)}
        </Group>

        {/* Score Display */}
        {hasEnoughData ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: getScoreColor(metrics.score) + '10',
                border: `4px solid ${getScoreColor(metrics.score)}`,
                marginBottom: '1rem'
              }}>
                <Text size="2xl" fw={700} style={{ color: getScoreColor(metrics.score) }}>
                  {metrics.score}
                </Text>
              </div>
              
              <Badge 
                size="lg" 
                variant="light"
                style={{ 
                  backgroundColor: getScoreColor(metrics.score) + '20',
                  color: getScoreColor(metrics.score),
                  border: `1px solid ${getScoreColor(metrics.score)}`
                }}
              >
                {metrics.complianceStatus} Compliance
              </Badge>
            </div>

            {/* Progress Bar */}
            <div>
              <Group justify="space-between" style={{ marginBottom: '0.5rem' }}>
                <Text size="sm" fw={500} style={{ color: '#1f2937' }}>
                  Filing Regularity
                </Text>
                <Text size="sm" style={{ color: '#6b7280' }}>
                  {metrics.filingRegularity.toFixed(0)}%
                </Text>
              </Group>
              <Progress 
                value={metrics.filingRegularity} 
                color={getScoreColor(metrics.score)}
                size="lg"
                radius="md"
              />
            </div>

            {/* Key Metrics */}
            <Group gap="lg" style={{ justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} style={{ color: '#1f2937' }}>
                  {filings.length}
                </Text>
                <Text size="sm" style={{ color: '#6b7280' }}>
                  Total Filings
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} style={{ color: metrics.lastFilingDays <= 365 ? '#10b981' : '#ef4444' }}>
                  {metrics.lastFilingDays}
                </Text>
                <Text size="sm" style={{ color: '#6b7280' }}>
                  Days Since Last Filing
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} style={{ color: '#3b82f6' }}>
                  {filings.filter(f => f.category === 'accounts').length}
                </Text>
                <Text size="sm" style={{ color: '#6b7280' }}>
                  Account Filings
                </Text>
              </div>
            </Group>
          </>
        ) : (
          <div style={{
            padding: '2rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Activity size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem auto' }} />
            <Text fw={500} style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              No Filing Data Available
            </Text>
            <Text size="sm" style={{ color: '#9ca3af' }}>
              Unable to calculate health score without filing history.
            </Text>
          </div>
        )}

        {/* Insights */}
        {hasEnoughData && metrics.insights.length > 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <Text fw={600} style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              💡 Health Insights
            </Text>
            <Stack gap="xs">
              {metrics.insights.map((insight, index) => (
                <Text key={index} size="sm" style={{ color: '#4b5563', lineHeight: '1.4' }}>
                  • {insight}
                </Text>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Card>
  );
} 