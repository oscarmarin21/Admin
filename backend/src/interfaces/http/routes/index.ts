import { Application, Router } from 'express';
import { container } from '../../../di/container.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requireRoles } from '../middlewares/require-role.js';

export const registerHttpRoutes = (app: Application): void => {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const authController = container.resolve('authController');
  const organizationController = container.resolve('organizationController');
  const projectController = container.resolve('projectController');
  const sprintController = container.resolve('sprintController');
  const taskController = container.resolve('taskController');
  const meetingController = container.resolve('meetingController');
  const metricsController = container.resolve('metricsController');

  // Authentication routes
  router.post('/auth/sign-up', authController.signUpValidators, authController.signUp);
  router.post('/auth/sign-in', authController.signInValidators, authController.signIn);
  router.post('/auth/refresh', authController.refreshValidators, authController.refresh);
  router.post('/auth/sign-out', authGuard, authController.signOut);
  router.post(
    '/auth/invitations',
    authGuard,
    requireRoles('admin', 'project_manager'),
    authController.inviteValidators,
    authController.invite,
  );
  router.get(
    '/auth/invitations',
    authGuard,
    requireRoles('admin', 'project_manager'),
    authController.listInvitations,
  );
  router.delete(
    '/auth/invitations/:id',
    authGuard,
    requireRoles('admin', 'project_manager'),
    authController.cancelInvitation,
  );
  router.post(
    '/auth/invitations/accept',
    authController.acceptInvitationValidators,
    authController.acceptInvitation,
  );

  // Organization routes
  router.get('/organizations/me', authGuard, organizationController.me);
  router.put(
    '/organizations/me',
    authGuard,
    organizationController.updateValidators,
    organizationController.update,
  );
  router.get('/organizations/users', authGuard, organizationController.members);
  router.patch(
    '/organizations/users/:id/role',
    authGuard,
    requireRoles('admin'),
    organizationController.updateRoleValidators,
    organizationController.updateRole,
  );
  router.delete(
    '/organizations/users/:id',
    authGuard,
    requireRoles('admin'),
    organizationController.removeMember,
  );

  // Projects
  router.post(
    '/projects',
    authGuard,
    requireRoles('admin', 'project_manager'),
    projectController.createValidators,
    projectController.create,
  );
  router.get('/projects', authGuard, projectController.list);
  router.get('/projects/:id', authGuard, projectController.getById);
  router.patch(
    '/projects/:id',
    authGuard,
    requireRoles('admin', 'project_manager'),
    projectController.updateValidators,
    projectController.update,
  );
  router.delete(
    '/projects/:id',
    authGuard,
    requireRoles('admin', 'project_manager'),
    projectController.delete,
  );

  // Sprints
  router.get('/projects/:projectId/sprints', authGuard, sprintController.list);
  router.post(
    '/projects/:projectId/sprints',
    authGuard,
    sprintController.createValidators,
    sprintController.create,
  );
  router.patch(
    '/projects/:projectId/sprints/:sprintId',
    authGuard,
    sprintController.updateValidators,
    sprintController.update,
  );
  router.delete(
    '/projects/:projectId/sprints/:sprintId',
    authGuard,
    sprintController.delete,
  );

  // Tasks
  router.get('/projects/:projectId/tasks', authGuard, taskController.list);
  router.get('/tasks', authGuard, taskController.listAllValidators, taskController.listAll);
  router.post(
    '/projects/:projectId/tasks',
    authGuard,
    requireRoles('admin', 'project_manager', 'member'),
    taskController.createValidators,
    taskController.create,
  );
  router.patch(
    '/projects/:projectId/tasks/:taskId',
    authGuard,
    requireRoles('admin', 'project_manager', 'member'),
    taskController.updateValidators,
    taskController.update,
  );
  router.patch(
    '/projects/:projectId/tasks/:taskId/status',
    authGuard,
    requireRoles('admin', 'project_manager', 'member'),
    taskController.updateStatusValidators,
    taskController.updateStatus,
  );
  router.delete(
    '/projects/:projectId/tasks/:taskId',
    authGuard,
    requireRoles('admin', 'project_manager'),
    taskController.delete,
  );
  router.get('/projects/:projectId/tasks/:taskId/history', authGuard, taskController.history);

  // Meetings
  router.get('/projects/:projectId/meetings', authGuard, meetingController.list);
  router.get('/projects/:projectId/meetings/:meetingId', authGuard, meetingController.getById);
  router.get(
    '/meetings',
    authGuard,
    meetingController.listAllValidators,
    meetingController.listAll,
  );
  router.post(
    '/projects/:projectId/meetings',
    authGuard,
    requireRoles('admin', 'project_manager', 'member'),
    meetingController.createValidators,
    meetingController.create,
  );
  router.patch(
    '/projects/:projectId/meetings/:meetingId',
    authGuard,
    requireRoles('admin', 'project_manager', 'member'),
    meetingController.updateValidators,
    meetingController.update,
  );
  router.delete(
    '/projects/:projectId/meetings/:meetingId',
    authGuard,
    requireRoles('admin', 'project_manager'),
    meetingController.delete,
  );

  // Metrics
  router.get(
    '/metrics/projects/:projectId/current',
    authGuard,
    metricsController.project,
  );
  router.get(
    '/metrics/projects/:projectId/sprints/:sprintId',
    authGuard,
    metricsController.sprint,
  );

  app.use('/api', router);
};

