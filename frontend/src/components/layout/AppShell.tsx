import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineX } from 'react-icons/hi';
import { LayoutHeader } from './LayoutHeader';
import { useNavigationLinks } from '../../hooks/useNavigationLinks';

export const AppShell = (): JSX.Element => {
  const { t } = useTranslation();
  const links = useNavigationLinks();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeSidebar = () => setMobileSidebarOpen(false);
  const toggleSidebar = () => setMobileSidebarOpen((prev) => !prev);

  const sidebarContent = (
    <nav className="flex h-full flex-col gap-1 bg-slate-950 px-3 py-4 text-slate-300">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'active-link bg-slate-800 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 text-slate-400 transition group-hover:text-white group-[.active-link]:text-white" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-950 lg:block">
        <div className="p-4 text-xl font-semibold">{t('app.title')}</div>
        {sidebarContent}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="flex w-64 flex-col border-r border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between p-4">
              <span className="text-xl font-semibold">{t('app.title')}</span>
              <button
                type="button"
                onClick={closeSidebar}
                className="rounded-lg p-2 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                <HiOutlineX className="h-5 w-5" />
                <span className="sr-only">{t('navigation.closeSidebar')}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            role="presentation"
            onClick={closeSidebar}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <LayoutHeader onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

