import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ProtectedRoute } from '../../components/router/ProtectedRoute';

const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const ProjectsPage = lazy(() => import('../../features/projects/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../../features/projects/pages/ProjectDetailPage'));
const TasksPage = lazy(() => import('../../features/tasks/pages/TasksPage'));
const MeetingsPage = lazy(() => import('../../features/meetings/pages/MeetingsPage'));
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage'));
const MembersPage = lazy(() => import('../../features/members/pages/MembersPage'));
const SignInPage = lazy(() => import('../../features/auth/pages/SignInPage'));
const SignUpPage = lazy(() => import('../../features/auth/pages/SignUpPage'));
const AcceptInvitationPage = lazy(() => import('../../features/auth/pages/AcceptInvitationPage'));

export const AppRouter = (): JSX.Element => (
  <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="members" element={<MembersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

