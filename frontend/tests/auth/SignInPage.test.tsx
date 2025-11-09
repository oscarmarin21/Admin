import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignInPage from '../../src/features/auth/pages/SignInPage';
import { i18n } from '../../src/i18n/i18n';

describe('SignInPage', () => {
  it('renders sign-in form inputs', () => {
    const client = new QueryClient();

    render(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <SignInPage />
          </MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument();
  });
});

