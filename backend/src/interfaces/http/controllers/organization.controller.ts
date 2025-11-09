import { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { OrganizationService } from '../../../application/services/organization.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const updateOrganizationSchema = z.object({
  name: z.string().min(3).optional(),
  defaultLocale: z.enum(['en', 'es']).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'project_manager', 'member', 'stakeholder']),
});

export class OrganizationController {
  public readonly updateValidators = [validateRequest(updateOrganizationSchema)];

  public readonly updateRoleValidators = [validateRequest(updateRoleSchema)];

  constructor(private readonly organizationService: OrganizationService) {}

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const organization = await this.organizationService.getOrganization(req.auth!.organizationId);
      res.json(organization);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const organization = await this.organizationService.updateOrganization(
        req.auth!.organizationId,
        req.body,
      );
      res.json(organization);
    } catch (error) {
      next(error);
    }
  };

  members = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const members = await this.organizationService.listMembers(req.auth!.organizationId);
      res.json(members);
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.organizationService.updateMemberRole(
        req.auth!.organizationId,
        req.params.id,
        req.body.role,
      );
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.organizationService.removeMember(req.auth!.organizationId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

