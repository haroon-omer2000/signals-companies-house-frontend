'use client';

import { Card, Group, Skeleton, Stack } from '@mantine/core';
import { motion } from 'framer-motion';

interface LoadingCardProps {
  index?: number;
}

export function LoadingCard({ index = 0 }: LoadingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <Card shadow="md" padding="lg" radius="lg" withBorder className="bg-white">
        <Stack gap="md">
          {/* Header skeleton */}
          <Group justify="space-between" align="flex-start">
            <div className="flex-1">
              <Group gap="sm" align="center" mb="xs">
                <Skeleton height={20} width={20} radius="sm" />
                <Skeleton height={24} width="60%" />
              </Group>
              
              <Group gap="xs" mb="sm">
                <Skeleton height={22} width={70} radius="xl" />
                <Skeleton height={22} width={50} radius="xl" />
              </Group>
            </div>
          </Group>

          {/* Details skeleton */}
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <Skeleton height={16} width={16} radius="sm" />
              <Skeleton height={16} width="40%" />
            </Group>

            <Group gap="sm" align="flex-start">
              <Skeleton height={16} width={16} radius="sm" />
              <div className="flex-1">
                <Skeleton height={16} width="80%" mb="xs" />
                <Skeleton height={16} width="60%" />
              </div>
            </Group>

            <Group gap="sm" align="center">
              <Skeleton height={16} width={16} radius="sm" />
              <Skeleton height={16} width="30%" />
            </Group>
          </Stack>

          {/* Description skeleton */}
          <div className="pt-2 border-t border-gray-100">
            <Skeleton height={16} width="90%" mb="xs" />
            <Skeleton height={16} width="70%" />
          </div>
        </Stack>
      </Card>
    </motion.div>
  );
} 