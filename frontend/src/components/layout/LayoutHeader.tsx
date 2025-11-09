import { Navbar, Dropdown, Avatar, Select } from 'flowbite-react';
import { HiOutlineMenu } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';

interface LayoutHeaderProps {
  onToggleSidebar: () => void;
}

export const LayoutHeader = ({ onToggleSidebar }: LayoutHeaderProps): JSX.Element => {
  const { t, i18n } = useTranslation();
  const { user, signOut, tokens } = useAuthStore();
  const navigate = useNavigate();

  const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const nextLocale = event.target.value;
    void i18n.changeLanguage(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', nextLocale);
    }
  };

  return (
    <Navbar fluid rounded className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center rounded-lg p-2 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 lg:hidden"
        >
          <HiOutlineMenu className="h-5 w-5" />
          <span className="sr-only">{t('navigation.openSidebar')}</span>
        </button>
        <Navbar.Brand href="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-xl font-semibold">
            {t('app.title')}
          </span>
        </Navbar.Brand>
      </div>
      <div className="flex items-center gap-3">
        <Select
          id="language-toggle"
          value={i18n.language}
          onChange={handleLocaleChange}
          className="w-28 border border-slate-700 bg-slate-900 text-slate-100 sm:w-32"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </Select>
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img="https://avatars.dicebear.com/api/initials/AA.svg"
              rounded
            />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="block truncate text-sm font-light">{user?.email}</span>
          </Dropdown.Header>
          <Dropdown.Item
            onClick={async () => {
              try {
                if (tokens?.sessionId) {
                  await apiClient.post(
                    '/auth/sign-out',
                    {},
                    {
                      headers: {
                        'x-session-id': tokens.sessionId,
                      },
                    },
                  );
                }
              } catch (error) {
                console.error(error);
              } finally {
                signOut();
                navigate('/sign-in');
              }
            }}
          >
            {t('navigation.signOut')}
          </Dropdown.Item>
        </Dropdown>
      </div>
    </Navbar>
  );
};

