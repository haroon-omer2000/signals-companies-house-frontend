'use client';

import { useState } from 'react';

import { Badge, Button, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { Brain, FileText, Sparkles, TrendingUp, Download } from 'lucide-react';

import type { AIFilingSummary, Filing } from '@/types/companies-house';

import { Modal } from './Modal';
import { TypewriterText } from './TypewriterText';
import { generateAnalysisPDF } from '@/lib/utils/pdf-generator';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  filing: Filing | null;
  analysis: AIFilingSummary | null;
  isLoading: boolean;
  companyName?: string;
  companyNumber?: string;
}

export function AIAnalysisModal({ 
  isOpen, 
  onClose, 
  filing, 
  analysis, 
  isLoading,
  companyName = 'Company',
  companyNumber = 'Unknown'
}: AIAnalysisModalProps) {
  const [showInsights, setShowInsights] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!filing || !analysis) return;
    
    setIsDownloading(true);
    try {
      generateAnalysisPDF({
        companyName,
        companyNumber,
        filingType: getCategoryLabel(filing.category),
        filingDate: formatDate(filing.date),
        summary: analysis.summary,
        keyInsights: analysis.key_insights,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="AI Document Analysis" 
      maxWidth="700px"
    >
      <Stack gap="lg">
        {/* Filing Info */}
        {filing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Group gap="sm" style={{ marginBottom: '0.5rem' }}>
              <FileText size={18} style={{ color: '#3b82f6' }} />
              <Badge 
                variant="light" 
                color={getCategoryColor(filing.category)}
                size="sm"
              >
                {getCategoryLabel(filing.category)}
              </Badge>
            </Group>
            
            <Text size="sm" fw={500} style={{ color: '#1f2937', marginBottom: '0.25rem' }}>
              {filing.description}
            </Text>
            
            <Text size="xs" style={{ color: '#6b7280' }}>
              Filed: {formatDate(filing.date)} • {filing.pages} pages
            </Text>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '2rem' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ marginBottom: '1rem', display: 'inline-block' }}
            >
              <Brain size={32} style={{ color: '#3b82f6' }} />
            </motion.div>
            
            <TypewriterText 
              text="Analyzing document with AI..."
              speed={50}
              style={{ fontSize: '1.1rem', color: '#4b5563' }}
            />
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Stack gap="lg">
              {/* Summary Section */}
              <div>
                <Group gap="sm" style={{ marginBottom: '1rem' }}>
                  <Sparkles size={20} style={{ color: '#3b82f6' }} />
                  <Title order={3} style={{ color: '#1f2937', margin: 0 }}>
                    Executive Summary
                  </Title>
                </Group>
                
                <TypewriterText
                  text={analysis.summary}
                  speed={20}
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#374151',
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  onComplete={() => setShowInsights(true)}
                />
              </div>

              <Divider />

              {/* Key Insights */}
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Group gap="sm" style={{ marginBottom: '1rem' }}>
                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                    <Title order={3} style={{ color: '#1f2937', margin: 0 }}>
                      Key Insights
                    </Title>
                  </Group>
                  
                  <Stack gap="sm">
                    {analysis.key_insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          marginTop: '0.5rem',
                          flexShrink: 0
                        }} />
                        <Text size="sm" style={{ color: '#065f46', lineHeight: '1.5' }}>
                          {insight}
                        </Text>
                      </motion.div>
                    ))}
                  </Stack>
                  
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: analysis.key_insights.length * 0.1 + 0.5 }}
                style={{ textAlign: 'center', paddingTop: '2rem' }}
              >
                <Group gap="md" justify="center">
                  <Button
                    onClick={handleDownloadPDF}
                    loading={isDownloading}
                    leftSection={<Download size={16} />}
                    size="md"
                    variant="outline"
                    style={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6'
                    }}
                  >
                    {isDownloading ? 'Generating PDF...' : 'Download Summary PDF'}
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    size="md"
                    style={{
                      background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                      border: 'none'
                    }}
                  >
                    Close Analysis
                  </Button>
                </Group>
              </motion.div>
            </Stack>
          </motion.div>
        )}
      </Stack>
    </Modal>
  );
} 