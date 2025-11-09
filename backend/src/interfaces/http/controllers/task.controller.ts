import { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { TaskService } from '../../../application/services/task.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  sprintId: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  dueDate: z.string().datetime().optional(),
  blocked: z.boolean().default(false),
});

const updateTaskSchema = createTaskSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'doing', 'done']),
});

const listAllTasksSchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeId: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  blocked: z.enum(['true', 'false']).optional(),
});

export class TaskController {
  public readonly createValidators = [validateRequest(createTaskSchema)];

  public readonly updateValidators = [validateRequest(updateTaskSchema)];

  public readonly updateStatusValidators = [validateRequest(updateStatusSchema)];

  public readonly listAllValidators = [validateRequest(listAllTasksSchema, 'query')];

  constructor(private readonly taskService: TaskService) {}

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.taskService.listTasks(
        req.auth!.organizationId,
        req.params.projectId,
      );
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  };

  listAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as z.infer<typeof listAllTasksSchema>;
      const result = await this.taskService.listTasksForOrganization(req.auth!.organizationId, {
        projectId: filters.projectId,
        status: filters.status,
        priority: filters.priority,
        assigneeId: filters.assigneeId,
        search: filters.search,
        blocked: filters.blocked !== undefined ? filters.blocked === 'true' : undefined,
        dueDateFrom: filters.dueDateFrom ? new Date(filters.dueDateFrom) : undefined,
        dueDateTo: filters.dueDateTo ? new Date(filters.dueDateTo) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskService.createTask(
        req.auth!.organizationId,
        req.params.projectId,
        {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        },
        req.auth!.id,
      );
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskService.updateTask(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.taskId,
        {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        },
        req.auth!.id,
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskService.updateStatus(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.taskId,
        req.body.status,
        req.auth!.id,
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.taskService.deleteTask(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.taskId,
        req.auth!.id,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  history = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const history = await this.taskService.getHistory(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.taskId,
      );
      res.json(history);
    } catch (error) {
      next(error);
    }
  };
}

