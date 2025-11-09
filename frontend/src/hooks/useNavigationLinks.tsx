import { type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineChartPie,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineChatAlt2,
  HiOutlineCog,
  HiOutlineUsers,
} from 'react-icons/hi';

interface NavigationLink {
  to: string;
  label: string;
  icon: ComponentType;
}

export const useNavigationLinks = (): NavigationLink[] => {
  const { t } = useTranslation();

  return [
    {
      to: '/dashboard',
      label: t('navigation.dashboard'),
      icon: HiOutlineChartPie,
    },
    {
      to: '/projects',
      label: t('navigation.projects'),
      icon: HiOutlineCollection,
    },
    {
      to: '/tasks',
      label: t('navigation.tasks'),
      icon: HiOutlineClipboardList,
    },
    {
      to: '/meetings',
      label: t('navigation.meetings'),
      icon: HiOutlineChatAlt2,
    },
    {
      to: '/members',
      label: t('navigation.members'),
      icon: HiOutlineUsers,
    },
    {
      to: '/settings',
      label: t('navigation.settings'),
      icon: HiOutlineCog,
    },
  ];
};

