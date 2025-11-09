import { useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Label, TextInput } from 'flowbite-react';
import { apiClient } from '../../../lib/api-client';

type AcceptInvitationForm = {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

const AcceptInvitationPage = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().min(2),
          lastName: z.string().min(2),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
        })
        .superRefine((values, ctx) => {
          if (values.password !== values.confirmPassword) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['confirmPassword'],
              message: t('invitations.passwordMismatch'),
            });
          }
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center text-slate-100">
        <Alert color="failure">{t('invitations.invalidToken')}</Alert>
        <Link to="/sign-in" className="text-brand-400 hover:underline">
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: AcceptInvitationForm) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/invitations/accept', {
        token,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setSuccess(true);
      setTimeout(() => navigate('/sign-in'), 1500);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">{t('invitations.acceptTitle')}</h1>
        <p className="text-sm text-slate-400">{t('invitations.acceptSubtitle')}</p>
      </div>
      {serverError && <Alert color="failure">{serverError}</Alert>}
      {success && <Alert color="success">{t('invitations.acceptSuccess')}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="firstName" value={t('settings.fields.firstName')} className="text-slate-200" />
          <TextInput id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-sm text-red-400">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName" value={t('settings.fields.lastName')} className="text-slate-200" />
          <TextInput id="lastName" {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-red-400">{errors.lastName.message}</p>}
        </div>
        <div>
          <Label htmlFor="password" value={t('auth.password')} className="text-slate-200" />
          <TextInput id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword" value={t('invitations.confirmPassword')} className="text-slate-200" />
          <TextInput id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" isProcessing={isSubmitting}>
          {t('invitations.acceptAction')}
        </Button>
      </form>
      <p className="text-sm text-slate-400">
        {t('invitations.hasAccount')}{' '}
        <Link to="/sign-in" className="text-brand-400 hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
};

export default AcceptInvitationPage;

