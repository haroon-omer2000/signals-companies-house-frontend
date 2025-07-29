'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Group, Text, Badge } from '@mantine/core';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { summaryCache } from '@/lib/utils/cache';

export function CacheManager() {
  const [cacheStats, setCacheStats] = useState({ total: 0, size: 0 });
  const [isClearing, setIsClearing] = useState(false);

  const updateStats = () => {
    const stats = summaryCache.getStats();
    setCacheStats(stats);
  };

  const clearCache = () => {
    setIsClearing(true);
    summaryCache.clear();
    updateStats();
    setTimeout(() => setIsClearing(false), 1000);
  };

  useEffect(() => {
    updateStats();
  }, []);

  if (cacheStats.total === 0) {
    return null; // Don't show if no cached items
  }

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem'
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Database size={16} style={{ color: '#64748b' }} />
          <Text size="sm" fw={500} style={{ color: '#475569' }}>
            AI Analysis Cache
          </Text>
          <Badge variant="light" color="blue" size="sm">
            {cacheStats.total} summaries
          </Badge>
          <Text size="xs" style={{ color: '#64748b' }}>
            {Math.round(cacheStats.size / 1024)}KB
          </Text>
        </Group>
        
        <Group gap="xs">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<RefreshCw size={12} />}
            onClick={updateStats}
            style={{ color: '#64748b' }}
          >
            Refresh
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<Trash2 size={12} />}
            onClick={clearCache}
            loading={isClearing}
            color="red"
          >
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </Group>
      </Group>
    </Card>
  );
} 