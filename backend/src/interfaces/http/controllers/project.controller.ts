import { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ProjectService } from '../../../application/services/project.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['planned', 'active', 'on_hold', 'completed', 'archived']).default('planned'),
  ownerId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

export class ProjectController {
  public readonly createValidators = [validateRequest(createProjectSchema)];

  public readonly updateValidators = [validateRequest(updateProjectSchema)];

  constructor(private readonly projectService: ProjectService) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.createProject(req.auth!.organizationId, {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.listProjects(req.auth!.organizationId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.getProject(
        req.auth!.organizationId,
        req.params.id,
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.updateProject(
        req.auth!.organizationId,
        req.params.id,
        {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        },
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.deleteProject(req.auth!.organizationId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

