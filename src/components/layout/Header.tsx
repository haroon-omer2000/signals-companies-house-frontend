'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Container, Group, Text } from '@mantine/core';
import { Building2 } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  return (
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 0'
    }}>
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Link href="/">
            <Group gap="sm" align="center">
              <div style={{ 
                padding: '8px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '8px' 
              }}>
                <Building2 size={24} color="white" />
              </div>
              <div>
                <Text size="lg" fw={700} style={{ color: '#111827' }}>
                  Company Insights
                </Text>
                <Text size="xs" style={{ color: '#6b7280' }}>
                  Powered by Companies House
                </Text>
              </div>
            </Group>
          </Link>

          <Group gap="md">
            <Link href="/">
              <Text 
                size="sm" 
                fw={pathname === '/' ? 600 : 400}
                style={{ 
                  color: pathname === '/' ? '#3b82f6' : '#6b7280',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: pathname === '/' ? '#eff6ff' : 'transparent'
                }}
              >
                Home
              </Text>
            </Link>
            <Link href="/search">
              <Text 
                size="sm" 
                fw={pathname === '/search' ? 600 : 400}
                style={{ 
                  color: pathname === '/search' ? '#3b82f6' : '#6b7280',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: pathname === '/search' ? '#eff6ff' : 'transparent'
                }}
              >
                Search
              </Text>
            </Link>
          </Group>
        </Group>
      </Container>
    </header>
  );
} 