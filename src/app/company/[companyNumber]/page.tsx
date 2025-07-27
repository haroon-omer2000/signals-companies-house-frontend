'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Alert, Badge, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { AlertCircle, Building2, Calendar, MapPin, Shield } from 'lucide-react';

import { AIAnalysisModal } from '@/components/ui/AIAnalysisModal';
import { FilingCard } from '@/components/ui/FilingCard';
import { LoadingCard } from '@/components/ui/LoadingCard';
import { 
  useGetCompanyDetailsQuery, 
  useGetFilingHistoryQuery 
} from '@/lib/api/companies-house-api';
import type { AIFilingSummary, Filing } from '@/types/companies-house';

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyNumber = params.companyNumber as string;
  const [analyzingFiling, setAnalyzingFiling] = useState<string | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIFilingSummary | null>(null);
  const [currentFiling, setCurrentFiling] = useState<Filing | null>(null);

  // Fetch company details and filing history
  const {
    data: companyDetails,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useGetCompanyDetailsQuery(companyNumber, {
    skip: !companyNumber,
  });

  const {
    data: filingHistory,
    isLoading: isLoadingFilings,
    error: filingsError,
  } = useGetFilingHistoryQuery(
    { companyNumber, items_per_page: 100 },
    { skip: !companyNumber }
  );

  const handleDownload = async (filing: Filing) => {
    console.log('Download filing:', filing);
    // TODO: Implement document download
    alert('Document download coming soon!');
  };

  const handleAnalyze = async (filing: Filing) => {
    console.log('Analyze filing:', filing);
    setCurrentFiling(filing);
    setCurrentAnalysis(null);
    setAnalyzingFiling(filing.transaction_id);
    setAnalysisModalOpen(true);
    
    try {
      const response = await fetch('/api/ai/analyze-filing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filing }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze filing');
      }

      const analysis = await response.json();
      setCurrentAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      // You could set an error state here instead of closing the modal
      setAnalysisModalOpen(false);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzingFiling(null);
    }
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalOpen(false);
    setCurrentAnalysis(null);
    setCurrentFiling(null);
    setAnalyzingFiling(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'liquidation':
        return 'red';
      case 'dissolved':
        return 'gray';
      case 'administration':
        return 'orange';
      default:
        return 'blue';
    }
  };

  if (companyError) {
    return (
      <Container size="md" style={{ padding: '2rem 0' }}>
        <Alert 
          variant="light" 
          color="red" 
          title="Error Loading Company"
          icon={<AlertCircle size={16} />}
        >
          {companyError && 'data' in companyError 
            ? (companyError.data as { error?: string })?.error || 'Failed to load company details'
            : 'Network error - please check your connection'
          }
        </Alert>
      </Container>
    );
  }

  if (isLoadingCompany) {
    return (
      <Container size="xl" style={{ padding: '2rem 0' }}>
        <Stack gap="xl">
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '50%',
              margin: '0 auto 1rem auto'
            }} />
            <div style={{ 
              width: '300px', 
              height: '2rem', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '4px',
              margin: '0 auto'
            }} />
          </div>
          
          <Grid>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                <LoadingCard index={index} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" style={{ padding: '2rem 0' }}>
      <Stack gap="xl">
        {/* Company Header */}
        {companyDetails && (
          <div style={{ 
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <Group gap="lg" align="flex-start">
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#3b82f6', 
                borderRadius: '12px',
                flexShrink: 0
              }}>
                <Building2 size={32} color="white" />
              </div>
              
              <div style={{ flex: 1 }}>
                <Group gap="sm" style={{ marginBottom: '0.5rem' }}>
                  <Badge 
                    variant="light" 
                    color={getStatusColor(companyDetails.company_status)}
                    size="sm"
                  >
                    {companyDetails.company_status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" color="gray" size="sm">
                    {companyDetails.type.toUpperCase()}
                  </Badge>
                </Group>
                
                <Title order={1} style={{ 
                  color: '#1f2937',
                  marginBottom: '1rem',
                  fontSize: '2rem'
                }}>
                  {companyDetails.company_name}
                </Title>
                
                <Stack gap="sm">
                  <Group gap="sm" align="center">
                    <Shield size={16} style={{ color: '#6b7280' }} />
                    <Text size="sm" style={{ color: '#6b7280' }}>
                      Company Number: 
                      <span style={{ 
                        fontFamily: 'monospace', 
                        color: '#1f2937',
                        marginLeft: '0.5rem'
                      }}>
                        {companyDetails.company_number}
                      </span>
                    </Text>
                  </Group>

                  <Group gap="sm" align="flex-start">
                    <MapPin size={16} style={{ color: '#6b7280', marginTop: '2px' }} />
                    <Text size="sm" style={{ color: '#6b7280' }}>
                      {companyDetails.registered_office_address.address_line_1}
                      {companyDetails.registered_office_address.address_line_2 && 
                        `, ${companyDetails.registered_office_address.address_line_2}`
                      }
                      <br />
                      {companyDetails.registered_office_address.locality}
                      {companyDetails.registered_office_address.postal_code && 
                        ` ${companyDetails.registered_office_address.postal_code}`
                      }
                    </Text>
                  </Group>

                  <Group gap="sm" align="center">
                    <Calendar size={16} style={{ color: '#6b7280' }} />
                    <Text size="sm" style={{ color: '#6b7280' }}>
                      Incorporated: {formatDate(companyDetails.date_of_creation)}
                    </Text>
                  </Group>
                </Stack>
              </div>
            </Group>
          </div>
        )}

        {/* Filing History Section */}
        <div>
          <Title order={2} style={{ 
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            Recent Financial Filings
          </Title>

          {filingsError && (
            <Alert 
              variant="light" 
              color="red" 
              title="Error Loading Filings"
              icon={<AlertCircle size={16} />}
              style={{ marginBottom: '1rem' }}
            >
              {filingsError && 'data' in filingsError 
                ? (filingsError.data as { error?: string })?.error || 'Failed to load filing history'
                : 'Network error - please check your connection'
              }
            </Alert>
          )}

          {isLoadingFilings && (
            <Grid>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                  <LoadingCard index={index} />
                </Grid.Col>
              ))}
            </Grid>
          )}

          {filingHistory && filingHistory.items && filingHistory.items.length > 0 && (
            <Grid>
              {filingHistory.items.map((filing, index) => (
                <Grid.Col key={filing.transaction_id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <FilingCard
                    filing={filing}
                    index={index}
                    onDownload={handleDownload}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analyzingFiling === filing.transaction_id}
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}

          {filingHistory && (!filingHistory.items || filingHistory.items.length === 0) && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <Building2 size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem auto' }} />
              <Title order={4} style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                No Financial Filings Found
              </Title>
              <Text style={{ color: '#9ca3af' }}>
                This company has no recent financial documents available.
              </Text>
            </div>
          )}
        </div>

        {/* AI Analysis Modal */}
        <AIAnalysisModal
          isOpen={analysisModalOpen}
          onClose={handleCloseAnalysisModal}
          filing={currentFiling}
          analysis={currentAnalysis}
          isLoading={analyzingFiling !== null}
        />
      </Stack>
    </Container>
  );
} 