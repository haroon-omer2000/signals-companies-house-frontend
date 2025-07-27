'use client';

import React, { useState, useEffect } from 'react';

import { ActionIcon, TextInput } from '@mantine/core';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

import { useDebounce } from '@/hooks/useDebounce';

interface CompanySearchFormProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function CompanySearchForm({ 
  onSearch, 
  isLoading = false,
  placeholder = "Search for a UK company by name or number..."
}: CompanySearchFormProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <TextInput
          size="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          leftSection={
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <Search 
                size={20} 
                className={`${isLoading ? 'text-blue-500' : 'text-gray-400'} transition-colors`} 
              />
            </motion.div>
          }
          rightSection={
            query && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleClear}
                  size="sm"
                >
                  <X size={16} />
                </ActionIcon>
              </motion.div>
            )
          }
          classNames={{
            input: `
              bg-white dark:bg-gray-800 
              border-2 border-gray-200 dark:border-gray-700
              focus:border-blue-500 dark:focus:border-blue-400
              transition-all duration-200
              text-lg
              shadow-lg hover:shadow-xl
              placeholder:text-gray-400
            `,
          }}
          styles={{
            input: {
              paddingLeft: '3rem',
              paddingRight: query ? '3rem' : '1rem',
              borderRadius: '12px',
              height: '60px',
            },
          }}
        />
        
        {/* Search suggestions hint */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-8 left-0 text-sm text-gray-500"
          >
            <span className="inline-flex items-center gap-2">
              💡 Try: &quot;Tesco&quot;, &quot;Microsoft&quot;, or company number &quot;00445790&quot;
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 