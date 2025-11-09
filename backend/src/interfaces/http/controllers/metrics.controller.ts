import { Response, NextFunction } from 'express';
import type { MetricsService } from '../../../application/services/metrics.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';

export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  project = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.metricsService.getProjectMetrics(
        req.auth!.organizationId,
        req.params.projectId,
      );
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };

  sprint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.metricsService.getSprintMetrics(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.sprintId,
      );
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  };
}

