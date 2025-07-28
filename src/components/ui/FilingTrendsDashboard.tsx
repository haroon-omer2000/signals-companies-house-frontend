'use client';

import { Card, Group, Stack, Text, Title } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, FileText } from 'lucide-react';

import type { Filing } from '@/types/companies-house';

interface FilingTrendsDashboardProps {
  filings: Filing[];
  companyName: string;
}

interface MonthlyData {
  month: string;
  count: number;
  year: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function FilingTrendsDashboard({ filings, companyName }: FilingTrendsDashboardProps) {
  // Process filing data for trends
  const processFilingTrends = (): MonthlyData[] => {
    const monthlyCounts: { [key: string]: number } = {};
    
    // Get filings from last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    filings.forEach(filing => {
      const filingDate = new Date(filing.date);
      if (filingDate >= threeYearsAgo) {
        const monthKey = `${filingDate.getFullYear()}-${String(filingDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyCounts)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return {
          month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
          count,
          year: parseInt(year)
        };
      })
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
      .slice(-12); // Show last 12 months
  };

  // Process filing categories for pie chart
  const processCategoryData = (): CategoryData[] => {
    const categoryCounts: { [key: string]: number } = {};
    
    filings.forEach(filing => {
      const category = filing.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .map(([category, count], index) => ({
        name: category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        value: count,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const monthlyData = processFilingTrends();
  const categoryData = processCategoryData();
  
  // Calculate trends
  const totalFilings = filings.length;
  const recentFilings = filings.filter(f => {
    const filingDate = new Date(f.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return filingDate >= oneYearAgo;
  }).length;
  
  const avgFilingsPerYear = totalFilings > 0 ? (totalFilings / Math.max(1, new Date().getFullYear() - new Date(filings[0]?.date || Date.now()).getFullYear())).toFixed(1) : '0';

  // Check if we have enough data to show meaningful charts
  const hasEnoughDataForCharts = monthlyData.length > 0 && categoryData.length > 1;

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
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              Filing Trends Dashboard
            </Title>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Analysis of {companyName}&apos;s filing patterns and compliance
            </Text>
          </div>
          <TrendingUp size={24} style={{ color: '#3b82f6' }} />
        </Group>

        {/* Key Metrics */}
        <Group gap="lg" style={{ justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <Text size="2xl" fw={700} style={{ color: '#1f2937' }}>
              {totalFilings}
            </Text>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Total Filings
            </Text>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Text size="2xl" fw={700} style={{ color: '#10b981' }}>
              {recentFilings}
            </Text>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Last 12 Months
            </Text>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Text size="2xl" fw={700} style={{ color: '#f59e0b' }}>
              {avgFilingsPerYear}
            </Text>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Avg/Year
            </Text>
          </div>
        </Group>

        {/* Charts */}
        {hasEnoughDataForCharts ? (
          <Group gap="xl" align="flex-start" style={{ flexWrap: 'wrap' }}>
            {/* Filing Trends Chart */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <Text fw={600} style={{ color: '#1f2937', marginBottom: '1rem' }}>
                Filing Activity (Last 12 Months)
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Filing Categories Chart */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <Text fw={600} style={{ color: '#1f2937', marginBottom: '1rem' }}>
                Filing Types Distribution
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Group>
        ) : (
          <div style={{
            padding: '2rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <TrendingUp size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem auto' }} />
            <Text fw={500} style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Insufficient Data for Trends Analysis
            </Text>
            <Text size="sm" style={{ color: '#9ca3af' }}>
              {totalFilings === 0 
                ? 'No filing history available to generate trends.'
                : 'Need more filing data to show meaningful trends and patterns.'
              }
            </Text>
          </div>
        )}

        {/* Insights */}
        {hasEnoughDataForCharts && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <Text fw={600} style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              📊 Filing Insights
            </Text>
            <Text size="sm" style={{ color: '#4b5563', lineHeight: '1.5' }}>
              {recentFilings > 0 
                ? `This company has filed ${recentFilings} documents in the last 12 months, averaging ${avgFilingsPerYear} filings per year. The filing pattern shows ${monthlyData.some(d => d.count > 1) ? 'regular compliance' : 'consistent regulatory adherence'}.`
                : 'This company has no recent filings in the last 12 months, which may indicate either excellent compliance with longer filing cycles or potential regulatory issues that should be investigated.'
              }
            </Text>
          </div>
        )}
      </Stack>
    </Card>
  );
} 