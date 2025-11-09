import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthService } from '../../../application/services/auth.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const signUpSchema = z.object({
  organizationName: z.string().min(3),
  defaultLocale: z.enum(['en', 'es']).default('en'),
  admin: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  }),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationSlug: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'project_manager', 'member', 'stakeholder']),
});

const acceptInvitationSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export class AuthController {
  public readonly signUpValidators = [validateRequest(signUpSchema)];

  public readonly signInValidators = [validateRequest(signInSchema)];

  public readonly refreshValidators = [validateRequest(refreshSchema)];

  public readonly inviteValidators = [validateRequest(inviteSchema)];

  public readonly acceptInvitationValidators = [validateRequest(acceptInvitationSchema)];

  constructor(private readonly authService: AuthService) {}

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.signUp(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.get('user-agent') ?? 'unknown';
      const ipAddress = req.ip ?? '0.0.0.0';
      const result = await this.authService.signIn({
        ...req.body,
        userAgent,
        ipAddress,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.get('user-agent') ?? 'unknown';
      const ipAddress = req.ip ?? '0.0.0.0';
      const result = await this.authService.refreshSession(
        req.body.refreshToken,
        userAgent,
        ipAddress,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Missing session identifier.');
      }
      await this.authService.signOut(sessionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  invite = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new Error('Unauthorized');
      }
      const invitation = await this.authService.inviteUser({
        organizationId: req.auth.organizationId,
        email: req.body.email,
        role: req.body.role,
        invitedBy: req.auth.id,
      });
      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  };

  listInvitations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const invitations = await this.authService.listInvitations(req.auth!.organizationId);
      res.json(invitations);
    } catch (error) {
      next(error);
    }
  };

  cancelInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.authService.cancelInvitation(req.auth!.organizationId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.acceptInvitation(req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}

