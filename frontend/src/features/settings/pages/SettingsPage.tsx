import { useTranslation } from 'react-i18next';
import { Card, Label, TextInput, Button, Select } from 'flowbite-react';
import { useAuthStore } from '../../auth/stores/auth.store';

const SettingsPage = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-100">{t('settings.profile')}</h1>
      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">{t('settings.profile')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label className="text-slate-200" value={t('settings.fields.firstName')} htmlFor="firstName" />
            <TextInput
              id="firstName"
              value={user?.firstName ?? ''}
              readOnly
              className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500"
            />
          </div>
          <div>
            <Label className="text-slate-200" value={t('settings.fields.lastName')} htmlFor="lastName" />
            <TextInput
              id="lastName"
              value={user?.lastName ?? ''}
              readOnly
              className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500"
            />
          </div>
          <div>
            <Label className="text-slate-200" value={t('settings.fields.email')} htmlFor="email" />
            <TextInput
              id="email"
              value={user?.email ?? ''}
              readOnly
              className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500"
            />
          </div>
          <div>
            <Label className="text-slate-200" value={t('settings.fields.language')} htmlFor="language" />
            <Select
              id="language"
              value={i18n.language}
              onChange={(event) => {
                const nextLocale = event.target.value;
                void i18n.changeLanguage(nextLocale);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('locale', nextLocale);
                }
              }}
              className="border-slate-700 bg-slate-900/80 text-slate-100"
            >
              <option value="en">{t('settings.languageOptions.en')}</option>
              <option value="es">{t('settings.languageOptions.es')}</option>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

