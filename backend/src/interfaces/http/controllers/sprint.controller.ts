import { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { SprintService } from '../../../application/services/sprint.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const sprintParamSchema = z.object({
  projectId: z.string().min(1),
  sprintId: z.string().min(1),
});

const createSprintSchema = z.object({
  name: z.string().min(2),
  goal: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const updateSprintSchema = createSprintSchema.partial();

export class SprintController {
  public readonly createValidators = [validateRequest(createSprintSchema)];

  public readonly updateValidators = [validateRequest(updateSprintSchema)];

  constructor(private readonly sprintService: SprintService) {}

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sprints = await this.sprintService.listSprints(
        req.auth!.organizationId,
        req.params.projectId,
      );
      res.json(sprints);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.sprintService.createSprint(
        req.auth!.organizationId,
        req.params.projectId,
        {
          ...req.body,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
        },
      );
      res.status(201).json(sprint);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.sprintService.updateSprint(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.sprintId,
        {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        },
      );
      res.json(sprint);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.sprintService.deleteSprint(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.sprintId,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

