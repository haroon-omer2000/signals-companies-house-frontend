'use client';

import { useCallback, useState } from 'react';

import { Alert, Button, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';

import { CompanySearchForm } from '@/components/forms/CompanySearchForm';
import { CompanyCard } from '@/components/ui/CompanyCard';
import { LoadingCard } from '@/components/ui/LoadingCard';
import { useSearchCompaniesQuery } from '@/lib/api/companies-house-api';
import type { CompanySearchResult } from '@/types/companies-house';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // RTK Query for company search
  const {
    data: searchResults,
    isLoading,
    error,
    isFetching,
  } = useSearchCompaniesQuery(
    { 
      query: searchQuery, 
      items_per_page: itemsPerPage,
      start_index: (currentPage - 1) * itemsPerPage + 1
    },
    { skip: !searchQuery.trim() }
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  const handleCompanyClick = useCallback((company: CompanySearchResult) => {
    window.location.href = `/company/${company.company_number}`;
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  // Calculate pagination info
  const totalPages = searchResults ? Math.ceil(searchResults.total_results / itemsPerPage) : 0;
  const startResult = (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, searchResults?.total_results || 0);

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-20"
    >
      <SearchIcon size={64} className="text-gray-300 mx-auto mb-6" />
      <Title order={3} className="text-gray-600 mb-4">
        Search for UK Companies
      </Title>
      <Text c="dimmed" size="lg" className="max-w-md mx-auto">
        Enter a company name or number above to find UK registered companies and view their details.
      </Text>
    </motion.div>
  );

  const NoResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
      <Title order={4} className="text-gray-600 mb-2">
        No companies found
      </Title>
      <Text c="dimmed">
        Try searching with different keywords or company number
      </Text>
    </motion.div>
  );

  return (
    <Container size="xl" className="py-8">
      <Stack gap="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Title 
            order={1} 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Company Search
          </Title>
          <Text c="dimmed" size="lg" className="max-w-2xl mx-auto">
            Search for UK companies registered with Companies House and explore their financial insights
          </Text>
        </motion.div>

        {/* Search Form */}
        <CompanySearchForm 
          onSearch={handleSearch}
          isLoading={isLoading || isFetching}
        />

        {/* Results Section */}
        <div className="min-h-[400px]">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert 
                variant="light" 
                color="red" 
                title="Search Error"
                icon={<AlertCircle size={16} />}
                className="mb-6"
              >
                {error && 'data' in error 
                  ? (error.data as { error?: string })?.error || 'Failed to search companies'
                  : 'Network error - please check your connection'
                }
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {(isLoading || isFetching) && searchQuery && (
            <div>
              <Group justify="space-between" align="center" mb="lg">
                <Text size="lg" fw={500} className="text-gray-700">
                  Searching for companies...
                </Text>
                <Text size="sm" c="dimmed">
                  Please wait
                </Text>
              </Group>
              
              <Grid>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                    <LoadingCard index={index} />
                  </Grid.Col>
                ))}
              </Grid>
            </div>
          )}

          {/* Results */}
          {searchResults && !isLoading && !isFetching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Group justify="space-between" align="center" mb="lg">
                <Text size="lg" fw={500} className="text-gray-700">
                  Found {searchResults.total_results.toLocaleString()} companies
                </Text>
                <Text size="sm" c="dimmed">
                  Showing {startResult.toLocaleString()} - {endResult.toLocaleString()} of {searchResults.total_results.toLocaleString()} results
                </Text>
              </Group>

              {searchResults.items.length > 0 ? (
                <>
                  <Grid>
                    {searchResults.items.map((company, index) => (
                      <Grid.Col key={company.company_number} span={{ base: 12, sm: 6, lg: 4 }}>
                        <CompanyCard
                          company={company}
                          index={index}
                          onClick={handleCompanyClick}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{ marginTop: '2rem', marginBottom: '4rem' }}
                    >
                      <Group justify="center" gap="md">
                        <Button
                          variant="light"
                          leftSection={<ChevronLeft size={16} />}
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          style={{
                            backgroundColor: currentPage === 1 ? '#f3f4f6' : '#3b82f6',
                            color: currentPage === 1 ? '#9ca3af' : 'white',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          Previous
                        </Button>

                        <Group gap="xs">
                          <Text size="sm" style={{ color: '#6b7280' }}>
                            Page {currentPage} of {totalPages}
                          </Text>
                        </Group>

                        <Button
                          variant="light"
                          rightSection={<ChevronRight size={16} />}
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          style={{
                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#3b82f6',
                            color: currentPage === totalPages ? '#9ca3af' : 'white',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          Next
                        </Button>
                      </Group>
                    </motion.div>
                  )}
                </>
              ) : (
                <NoResults />
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!searchQuery && !isLoading && (
            <EmptyState />
          )}
        </div>
      </Stack>
    </Container>
  );
} 