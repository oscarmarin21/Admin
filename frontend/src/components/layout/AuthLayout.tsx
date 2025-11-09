import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AuthLayout = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <div className="mb-6 text-3xl font-bold">{t('app.title')}</div>
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

