import { configureStore } from '@reduxjs/toolkit';

import { companiesHouseApi } from '../api/companies-house-api';

export const store = configureStore({
  reducer: {
    [companiesHouseApi.reducerPath]: companiesHouseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(companiesHouseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 