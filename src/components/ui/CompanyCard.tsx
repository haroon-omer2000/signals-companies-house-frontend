'use client';

import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { Building2, Calendar, MapPin, Shield } from 'lucide-react';

import type { CompanySearchResult } from '@/types/companies-house';

interface CompanyCardProps {
  company: CompanySearchResult;
  index: number;
  onClick: (company: CompanySearchResult) => void;
}

export function CompanyCard({ company, index, onClick }: CompanyCardProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        shadow="md"
        padding="lg"
        radius="lg"
        withBorder
        onClick={() => onClick(company)}
        className="cursor-pointer bg-white hover:bg-gray-50 transition-colors border-gray-200"
      >
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <div className="flex-1">
              <Group gap="sm" align="center" mb="xs">
                <Building2 size={20} className="text-blue-600" />
                <Text fw={600} size="lg" lineClamp={2} className="text-gray-900">
                  {company.title}
                </Text>
              </Group>
              
              <Group gap="xs" mb="sm">
                <Badge 
                  variant="light" 
                  color={getStatusColor(company.company_status)}
                  size="sm"
                >
                  {company.company_status.toUpperCase()}
                </Badge>
                <Badge variant="outline" color="gray" size="sm">
                  {company.company_type.toUpperCase()}
                </Badge>
              </Group>
            </div>
          </Group>

          {/* Company Details */}
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <Shield size={16} className="text-gray-500" />
              <Text size="sm" c="dimmed">
                Company Number: <span className="font-mono text-gray-700">{company.company_number}</span>
              </Text>
            </Group>

            <Group gap="sm" align="flex-start">
              <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <Text size="sm" c="dimmed" lineClamp={2}>
                {company.address_snippet}
              </Text>
            </Group>

            <Group gap="sm" align="center">
              <Calendar size={16} className="text-gray-500" />
              <Text size="sm" c="dimmed">
                Incorporated: {formatDate(company.date_of_creation)}
              </Text>
            </Group>
          </Stack>

          {/* Description */}
          {company.description && (
            <Text size="sm" c="dimmed" lineClamp={2} className="pt-2 border-t border-gray-100">
              {company.description}
            </Text>
          )}
        </Stack>
      </Card>
    </motion.div>
  );
} 