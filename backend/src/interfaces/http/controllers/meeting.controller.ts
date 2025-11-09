import { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { MeetingService } from '../../../application/services/meeting.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { validateRequest } from '../middlewares/validate-request.js';

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value;
  });

const createMeetingSchema = z.object({
  sprintId: z.string().optional(),
  type: z.enum(['daily', 'review', 'retro', 'planning', 'other']).default('daily'),
  date: z.string().datetime(),
  summary: optionalText,
  decisions: optionalText,
  actionItems: optionalText,
  followUpOwner: z.string().optional(),
});

const updateMeetingSchema = createMeetingSchema.partial();

const listMeetingsSchema = z.object({
  projectId: z.string().optional(),
  type: z.enum(['daily', 'review', 'retro', 'planning', 'other']).optional(),
  search: z.string().min(1).max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export class MeetingController {
  public readonly createValidators = [validateRequest(createMeetingSchema)];

  public readonly updateValidators = [validateRequest(updateMeetingSchema)];

  public readonly listAllValidators = [validateRequest(listMeetingsSchema, 'query')];

  constructor(private readonly meetingService: MeetingService) {}

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const meetings = await this.meetingService.listMeetings(
        req.auth!.organizationId,
        req.params.projectId,
      );
      res.json(meetings);
    } catch (error) {
      next(error);
    }
  };

  listAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as z.infer<typeof listMeetingsSchema>;
      const meetings = await this.meetingService.listMeetingsForOrganization(req.auth!.organizationId, {
        projectId: filters.projectId,
        type: filters.type,
        search: filters.search,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });
      res.json(meetings);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await this.meetingService.getMeeting(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.meetingId,
      );
      res.json(meeting);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await this.meetingService.createMeeting(
        req.auth!.organizationId,
        req.params.projectId,
        {
          ...req.body,
          date: new Date(req.body.date),
          createdBy: req.auth!.id,
        },
      );
      res.status(201).json(meeting);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await this.meetingService.updateMeeting(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.meetingId,
        {
          ...req.body,
          date: req.body.date ? new Date(req.body.date) : undefined,
        },
      );
      res.json(meeting);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.meetingService.deleteMeeting(
        req.auth!.organizationId,
        req.params.projectId,
        req.params.meetingId,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

