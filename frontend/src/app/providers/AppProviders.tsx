import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Flowbite } from 'flowbite-react';
import { queryClient } from '../../lib/query-client';
import { i18n } from '../../i18n/i18n';

export const AppProviders = ({ children }: PropsWithChildren): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Flowbite theme={{}}>
          {children}
        </Flowbite>
      </BrowserRouter>
    </I18nextProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

