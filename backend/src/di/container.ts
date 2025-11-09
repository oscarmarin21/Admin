import { createContainer, asClass } from 'awilix';
import { AuthService } from '../application/services/auth.service.js';
import { OrganizationService } from '../application/services/organization.service.js';
import { ProjectService } from '../application/services/project.service.js';
import { SprintService } from '../application/services/sprint.service.js';
import { TaskService } from '../application/services/task.service.js';
import { MeetingService } from '../application/services/meeting.service.js';
import { MetricsService } from '../application/services/metrics.service.js';
import { OrganizationMongooseRepository } from '../infrastructure/repositories/organization-mongoose.repository.js';
import { UserMongooseRepository } from '../infrastructure/repositories/user-mongoose.repository.js';
import { SessionMongooseRepository } from '../infrastructure/repositories/session-mongoose.repository.js';
import { ProjectMongooseRepository } from '../infrastructure/repositories/project-mongoose.repository.js';
import { SprintMongooseRepository } from '../infrastructure/repositories/sprint-mongoose.repository.js';
import { TaskMongooseRepository } from '../infrastructure/repositories/task-mongoose.repository.js';
import { TaskHistoryMongooseRepository } from '../infrastructure/repositories/task-history-mongoose.repository.js';
import { MeetingMongooseRepository } from '../infrastructure/repositories/meeting-mongoose.repository.js';
import { MetricSnapshotMongooseRepository } from '../infrastructure/repositories/metric-snapshot-mongoose.repository.js';
import { InvitationMongooseRepository } from '../infrastructure/repositories/invitation-mongoose.repository.js';
import { JwtTokenManager } from '../infrastructure/security/jwt-token-manager.js';
import { NodemailerMailService } from '../infrastructure/mail/nodemailer-mail.service.js';
import { AuthController } from '../interfaces/http/controllers/auth.controller.js';
import { OrganizationController } from '../interfaces/http/controllers/organization.controller.js';
import { ProjectController } from '../interfaces/http/controllers/project.controller.js';
import { SprintController } from '../interfaces/http/controllers/sprint.controller.js';
import { TaskController } from '../interfaces/http/controllers/task.controller.js';
import { MeetingController } from '../interfaces/http/controllers/meeting.controller.js';
import { MetricsController } from '../interfaces/http/controllers/metrics.controller.js';

export const container = createContainer({
  injectionMode: 'CLASSIC',
});

container.register({
  organizationRepository: asClass(OrganizationMongooseRepository).singleton(),
  userRepository: asClass(UserMongooseRepository).singleton(),
  sessionRepository: asClass(SessionMongooseRepository).singleton(),
  projectRepository: asClass(ProjectMongooseRepository).singleton(),
  sprintRepository: asClass(SprintMongooseRepository).singleton(),
  taskRepository: asClass(TaskMongooseRepository).singleton(),
  taskHistoryRepository: asClass(TaskHistoryMongooseRepository).singleton(),
  meetingRepository: asClass(MeetingMongooseRepository).singleton(),
  metricSnapshotRepository: asClass(MetricSnapshotMongooseRepository).singleton(),
  invitationRepository: asClass(InvitationMongooseRepository).singleton(),
  tokenManager: asClass(JwtTokenManager).singleton(),
  mailService: asClass(NodemailerMailService).singleton(),
  authService: asClass(AuthService).singleton(),
  organizationService: asClass(OrganizationService).singleton(),
  projectService: asClass(ProjectService).singleton(),
  sprintService: asClass(SprintService).singleton(),
  taskService: asClass(TaskService).singleton(),
  meetingService: asClass(MeetingService).singleton(),
  metricsService: asClass(MetricsService).singleton(),
  authController: asClass(AuthController).singleton(),
  organizationController: asClass(OrganizationController).singleton(),
  projectController: asClass(ProjectController).singleton(),
  sprintController: asClass(SprintController).singleton(),
  taskController: asClass(TaskController).singleton(),
  meetingController: asClass(MeetingController).singleton(),
  metricsController: asClass(MetricsController).singleton(),
});

