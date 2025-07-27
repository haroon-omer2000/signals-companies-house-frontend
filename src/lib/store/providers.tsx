'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { store } from './store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <MantineProvider
        defaultColorScheme="light"
        theme={{
          primaryColor: 'blue',
          colors: {
            blue: [
              '#e7f5ff',
              '#d0ebff',
              '#a5d8ff',
              '#74c0fc',
              '#4dabf7',
              '#339af0',
              '#228be6',
              '#1c7ed6',
              '#1971c2',
              '#1864ab',
            ],
          },
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          headings: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          },
        }}
      >
        <Notifications />
        {children}
      </MantineProvider>
    </ReduxProvider>
  );
} 