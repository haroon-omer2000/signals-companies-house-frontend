// Types for Companies House API responses
export interface CompanySearchResult {
  title: string;
  company_number: string;
  company_status: string;
  company_type: string;
  address_snippet: string;
  date_of_creation: string;
  matches?: {
    title?: number[];
    snippet?: number[];
  };
  description?: string;
  kind: string;
  links: {
    self: string;
  };
}

export interface CompanySearchResponse {
  etag: string;
  kind: string;
  items: CompanySearchResult[];
  items_per_page: number;
  page_number: number;
  start_index: number;
  total_results: number;
}

export interface CompanyDetails {
  company_name: string;
  company_number: string;
  company_status: string;
  company_status_detail?: string;
  confirmation_statement?: {
    last_made_up_to: string;
    next_due: string;
    next_made_up_to: string;
    overdue: boolean;
  };
  date_of_creation: string;
  date_of_cessation?: string;
  etag: string;
  has_been_liquidated?: boolean;
  has_charges?: boolean;
  has_insolvency_history?: boolean;
  jurisdiction: string;
  kind: string;
  last_full_members_list_date?: string;
  links: {
    filing_history?: string;
    officers?: string;
    persons_with_significant_control?: string;
    registers?: string;
    self: string;
  };
  registered_office_address: {
    address_line_1?: string;
    address_line_2?: string;
    care_of?: string;
    country?: string;
    locality?: string;
    po_box?: string;
    postal_code?: string;
    premises?: string;
    region?: string;
  };
  registered_office_is_in_dispute?: boolean;
  sic_codes?: string[];
  type: string;
  undeliverable_registered_office_address?: boolean;
}

export interface Filing {
  barcode?: string;
  category: string;
  date: string;
  description: string;
  description_values?: Record<string, string>;
  links: {
    document_metadata?: string;
    self: string;
  };
  pages?: number;
  paper_filed?: boolean;
  transaction_id: string;
  type: string;
}

export interface FilingHistoryResponse {
  etag: string;
  filing_history_status: string;
  items: Filing[];
  items_per_page: number;
  kind: string;
  start_index: number;
  total_count: number;
}

export interface DocumentMetadata {
  company_number: string;
  created_at: string;
  description: string;
  description_values?: Record<string, string>;
  etag: string;
  kind: string;
  links: {
    document: string;
    self: string;
  };
  pages: number;
  updated_at: string;
}

export interface AIFilingSummary {
  filing_id: string;
  filing_type: string;
  filing_date: string;
  summary: string;
  key_insights: string[];
}

 