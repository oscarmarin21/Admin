import type { UserRole } from '../../domain/entities/user.js';

export interface SignUpInput {
  organizationName: string;
  defaultLocale: 'en' | 'es';
  admin: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface SignInInput {
  email: string;
  password: string;
  organizationSlug: string;
  userAgent: string;
  ipAddress: string;
}

export interface InviteUserInput {
  organizationId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
}

export interface AcceptInvitationInput {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

