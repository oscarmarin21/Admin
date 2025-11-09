import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './routes/AppRouter';

export const App = (): JSX.Element => (
  <AppProviders>
    <AppRouter />
  </AppProviders>
);

