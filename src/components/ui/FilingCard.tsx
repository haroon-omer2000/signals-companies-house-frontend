'use client';

import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { Calendar, Download, FileText, Sparkles } from 'lucide-react';

import type { Filing } from '@/types/companies-house';

interface FilingCardProps {
  filing: Filing;
  index: number;
  onDownload: (filing: Filing) => void;
  onAnalyze: (filing: Filing) => void;
  isAnalyzing?: boolean;
}

export function FilingCard({ 
  filing, 
  index, 
  onDownload, 
  onAnalyze, 
  isAnalyzing = false 
}: FilingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'accounts':
        return 'blue';
      case 'annual-return':
        return 'green';
      case 'confirmation-statement':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease'
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="sm" align="center" style={{ marginBottom: '8px' }}>
              <FileText size={18} style={{ color: '#3b82f6' }} />
              <Badge 
                variant="light" 
                color={getCategoryColor(filing.category)}
                size="sm"
              >
                {getCategoryLabel(filing.category)}
              </Badge>
            </Group>
            
            <Text 
              size="sm" 
              fw={500} 
              style={{ 
                color: '#1f2937',
                lineHeight: '1.4',
                marginBottom: '4px'
              }}
            >
              {filing.description}
            </Text>

            <Group gap="sm" align="center">
              <Calendar size={14} style={{ color: '#6b7280' }} />
              <Text size="xs" style={{ color: '#6b7280' }}>
                Filed: {formatDate(filing.date)}
              </Text>
              {filing.pages && (
                <>
                  <Text size="xs" style={{ color: '#d1d5db' }}>•</Text>
                  <Text size="xs" style={{ color: '#6b7280' }}>
                    {filing.pages} pages
                  </Text>
                </>
              )}
            </Group>
          </div>
        </Group>

        {/* Actions */}
        <Group gap="sm">
          <Button
            variant="outline"
            size="xs"
            leftSection={<Download size={14} />}
            onClick={() => onDownload(filing)}
            style={{
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            Download
          </Button>
          
          <Button
            variant="filled"
            size="xs"
            leftSection={<Sparkles size={14} />}
            onClick={() => onAnalyze(filing)}
            loading={isAnalyzing}
            style={{
              backgroundColor: '#3b82f6',
              border: 'none'
            }}
          >
            {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
} 