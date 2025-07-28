'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Badge, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { Building2, Calendar, MapPin, Shield } from 'lucide-react';

import { AIAnalysisModal } from '@/components/ui/AIAnalysisModal';
import { FilingCard } from '@/components/ui/FilingCard';
import { LoadingCard } from '@/components/ui/LoadingCard';
import { 
  useGetCompanyDetailsQuery, 
  useGetFilingHistoryQuery,
  useDownloadAndParseDocumentMutation
} from '@/lib/api/companies-house-api';
import type { AIFilingSummary, Filing } from '@/types/companies-house';

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyNumber = params.companyNumber as string;
  const [analyzingFiling, setAnalyzingFiling] = useState<string | null>(null);
  const [downloadingFiling, setDownloadingFiling] = useState<string | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIFilingSummary | null>(null);
  const [currentFiling, setCurrentFiling] = useState<Filing | null>(null);

  // Fetch company details and filing history
  const {
    data: companyDetails,
    isLoading: isLoadingCompany,
  } = useGetCompanyDetailsQuery(companyNumber, {
    skip: !companyNumber,
  });

  const {
    data: filingHistory,
    isLoading: isLoadingFilings,
  } = useGetFilingHistoryQuery(
    { companyNumber, items_per_page: 100 },
    { skip: !companyNumber }
  );

  const handleDownload = async (filing: Filing) => {
    console.log('Starting download for filing:', filing);
    
    if (!filing.links?.document_metadata) {
      alert('No document available for download');
      return;
    }
    
    setDownloadingFiling(filing.transaction_id);
    
    try {
      // Get document metadata using our secure proxy API
      const metadataResponse = await fetch('/api/companies-house/document/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentMetadataUrl: filing.links.document_metadata
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to get document metadata');
      }
      
      const metadata = await metadataResponse.json();
      console.log('Document metadata for download:', metadata);
      
      if (!metadata.links?.document) {
        throw new Error('No document download link available');
      }
      
      // The metadata.links.document is already the full content URL
      const documentContentUrl = metadata.links.document;
      
      console.log('Downloading document via our proxy API...');
      
      // Create a direct download link that bypasses blob buffering
      const downloadUrl = `/api/companies-house/document/download`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${filing.category}-${filing.date}-${filing.barcode || filing.transaction_id}.pdf`;
      
      // Add the document URL as a query parameter for the API
      const urlWithParams = new URL(downloadUrl, window.location.origin);
      urlWithParams.searchParams.set('documentUrl', documentContentUrl);
      a.href = urlWithParams.toString();
      
      // Trigger the download directly
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingFiling(null);
    }
  };

  const [downloadAndParseDocument] = useDownloadAndParseDocumentMutation();

  const handleAnalyze = async (filing: Filing) => {
    console.log('Starting analysis for filing:', filing);
    setCurrentFiling(filing);
    setCurrentAnalysis(null);
    setAnalyzingFiling(filing.transaction_id);
    setAnalysisModalOpen(true);
    
    try {
      let documentContent = '';
      
      // Step 1: Check if filing has document metadata link
      if (filing.links?.document_metadata) {
        console.log('Getting document metadata from:', filing.links.document_metadata);
        
        // Step 2: Get document metadata using our secure proxy API
        const metadataResponse = await fetch('/api/companies-house/document/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentMetadataUrl: filing.links.document_metadata
          }),
        });
        
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          console.log('Document metadata received:', metadata);
          
          if (metadata.links?.document) {
            console.log('Downloading and parsing document from:', metadata.links.document);
            
            // Step 3: Download and parse the document
            // The metadata.links.document is already the full content URL
            const documentContentUrl = metadata.links.document;
            
            try {
              // For AI analysis, we want to parse the document, not download it
              const documentResult = await downloadAndParseDocument({
                documentUrl: documentContentUrl,
                parseOnly: true
              }).unwrap();
              documentContent = documentResult.extractedText;
              console.log(`Document parsed successfully: ${documentResult.documentType}, ${documentResult.contentLength} characters`);
            } catch (downloadError) {
              console.error('Document download/parsing failed:', downloadError);
              // Continue with analysis without document content
            }
          } else {
            console.log('No document link found in metadata response');
          }
        } else {
          console.error('Failed to fetch document metadata:', metadataResponse.status);
        }
      } else {
        console.log('No document metadata link available for this filing');
      }
      
      // Step 4: Perform AI analysis with or without document content
      console.log('Sending to AI analysis...');
      const response = await fetch('/api/ai/analyze-filing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filing,
          documentContent: documentContent || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze filing');
      }

      const analysis = await response.json();
      setCurrentAnalysis(analysis);
      console.log('Analysis completed successfully');
      
    } catch (error) {
      console.error('Analysis workflow failed:', error);
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
              {filingHistory.items.map((filing) => (
                <Grid.Col key={filing.transaction_id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <FilingCard
                    filing={filing}
                    onDownload={handleDownload}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analyzingFiling === filing.transaction_id}
                    isDownloading={downloadingFiling === filing.transaction_id}
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
          companyName={companyDetails?.company_name}
          companyNumber={companyDetails?.company_number}
        />
      </Stack>
    </Container>
  );
} 