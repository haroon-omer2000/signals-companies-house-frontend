import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { 
  AIFilingSummary,
  CompanyDetails,
  CompanySearchResponse,
  DocumentMetadata,
  Filing,
  FilingHistoryResponse,
  TrendsSummary
} from '@/types/companies-house';

const COMPANIES_HOUSE_BASE_URL = 'https://api.company-information.service.gov.uk';

export const companiesHouseApi = createApi({
  reducerPath: 'companiesHouseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/companies-house',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Company', 'Filings', 'Document', 'Summary'],
  endpoints: (builder) => ({
    // Search for companies
    searchCompanies: builder.query<CompanySearchResponse, { query: string; items_per_page?: number }>({
      query: ({ query, items_per_page = 20 }) => 
        `/search/companies?q=${encodeURIComponent(query)}&items_per_page=${items_per_page}`,
      providesTags: ['Company'],
    }),

    // Get company details
    getCompanyDetails: builder.query<CompanyDetails, string>({
      query: (companyNumber) => `/company/${companyNumber}`,
      providesTags: (_result, _error, companyNumber) => [
        { type: 'Company', id: companyNumber },
      ],
    }),

    // Get filing history
    getFilingHistory: builder.query<FilingHistoryResponse, { 
      companyNumber: string; 
      category?: string;
      items_per_page?: number;
    }>({
      query: ({ companyNumber, category, items_per_page = 100 }) => {
        let url = `/company/${companyNumber}/filing-history?items_per_page=${items_per_page}`;
        if (category) {
          url += `&category=${category}`;
        }
        return url;
      },
      providesTags: (_result, _error, { companyNumber }) => [
        { type: 'Filings', id: companyNumber },
      ],
    }),

    // Get document metadata
    getDocumentMetadata: builder.query<DocumentMetadata, {
      companyNumber: string;
      transactionId: string;
    }>({
      query: ({ companyNumber, transactionId }) => 
        `/company/${companyNumber}/filing-history/${transactionId}/document`,
      providesTags: (_result, _error, { transactionId }) => [
        { type: 'Document', id: transactionId },
      ],
    }),

    // Download and parse document
    downloadAndParseDocument: builder.mutation<{
      success: boolean;
      documentType: string;
      contentLength: number;
      extractedText: string;
      originalUrl: string;
    }, { documentUrl: string; parseOnly?: boolean }>({
      query: ({ documentUrl, parseOnly }) => ({
        url: '/companies-house/document/download',
        method: 'POST',
        body: { documentUrl, parseOnly },
      }),
    }),

    // AI Summary endpoints (will be handled by our API routes)
    generateFilingSummary: builder.mutation<AIFilingSummary, {
      filing: Filing;
      documentContent: string;
    }>({
      query: ({ filing, documentContent }) => ({
        url: '/ai/summarize-filing',
        method: 'POST',
        body: { filing, documentContent },
      }),
      invalidatesTags: ['Summary'],
    }),

    generateTrendsSummary: builder.mutation<TrendsSummary, {
      companyNumber: string;
      summaries: AIFilingSummary[];
    }>({
      query: ({ companyNumber, summaries }) => ({
        url: '/ai/generate-trends',
        method: 'POST',
        body: { companyNumber, summaries },
      }),
      invalidatesTags: ['Summary'],
    }),
  }),
});

export const {
  useSearchCompaniesQuery,
  useGetCompanyDetailsQuery,
  useGetFilingHistoryQuery,
  useGetDocumentMetadataQuery,
  useDownloadAndParseDocumentMutation,
  useGenerateFilingSummaryMutation,
  useGenerateTrendsSummaryMutation,
} = companiesHouseApi; 