'use client';

import Link from 'next/link';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { Building2, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <Container size="md" style={{ padding: '2rem 0' }}>
      <Stack gap="xl" align="center">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#3b82f6', 
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <Building2 size={48} color="white" />
            </div>
          </div>
          
          <Title 
            order={1} 
            style={{ 
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1.5rem'
            }}
          >
            UK Company Financial Insights
          </Title>
          
          <Text 
            size="xl" 
            style={{ 
              color: '#6b7280', 
              maxWidth: '600px', 
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}
          >
            Discover, analyze, and understand UK companies with AI-powered insights from 
            official Companies House data. Get instant access to financial documents and 
            intelligent summaries.
          </Text>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/search">
              <Button 
                size="lg" 
                style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  border: 'none',
                  padding: '0.75rem 2rem'
                }}
                leftSection={<Search size={20} />}
              >
                Start Searching
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              style={{ 
                borderColor: '#d1d5db',
                color: '#374151',
                padding: '0.75rem 2rem'
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Simple feature list */}
        <div style={{ 
          padding: '3rem 0', 
          textAlign: 'center',
          maxWidth: '800px'
        }}>
          <Title order={2} style={{ 
            marginBottom: '2rem',
            color: '#1f2937'
          }}>
            Powerful Features
          </Title>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}>
              <Title order={3} style={{ 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Smart Company Search
              </Title>
              <Text style={{ color: '#6b7280' }}>
                Find any UK registered company by name or number with instant results
              </Text>
            </div>

            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}>
              <Title order={3} style={{ 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Financial Analysis
              </Title>
              <Text style={{ color: '#6b7280' }}>
                AI-powered insights from official Companies House financial documents
              </Text>
            </div>

            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6'
            }}>
              <Title order={3} style={{ 
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Real-time Data
              </Title>
              <Text style={{ color: '#6b7280' }}>
                Access live company information directly from Companies House API
              </Text>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          width: '100%'
        }}>
          <Title order={2} style={{ 
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Ready to explore UK companies?
          </Title>
          
          <Text 
            size="lg" 
            style={{ 
              marginBottom: '2rem', 
              color: '#6b7280',
              maxWidth: '400px',
              margin: '0 auto 2rem auto'
            }}
          >
            Start searching for companies and unlock AI-powered financial insights today.
          </Text>
          
          <Link href="/search">
            <Button 
              size="lg" 
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                border: 'none'
              }}
              leftSection={<Search size={18} />}
            >
              Search Companies Now
            </Button>
          </Link>
    </div>
      </Stack>
    </Container>
  );
}
