import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, TextInput } from 'flowbite-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../../../lib/api-client';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationSlug: z.string().min(2),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInPage = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      organizationSlug: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/sign-in', {
        email: data.email,
        password: data.password,
        organizationSlug: data.organizationSlug,
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('locale', response.data.user.locale);
      }
      void i18n.changeLanguage(response.data.user.locale);

      signIn({
        user: response.data.user,
        tokens: {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          sessionId: response.data.tokens.sessionId,
        },
      });

      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label className="text-slate-200" htmlFor="email" value={t('auth.email')} />
        <TextInput
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>
      <div>
        <Label className="text-slate-200" htmlFor="organizationSlug" value={t('auth.organization')} />
        <TextInput
          id="organizationSlug"
          placeholder="your-organization"
          {...register('organizationSlug')}
        />
        {errors.organizationSlug && (
          <p className="mt-1 text-sm text-red-400">{errors.organizationSlug.message}</p>
        )}
      </div>
      <div>
        <Label className="text-slate-200" htmlFor="password" value={t('auth.password')} />
        <TextInput id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
      </div>
      <Button type="submit" isProcessing={isSubmitting}>
        {t('auth.signIn')}
      </Button>
      <p className="text-sm text-slate-400">
        No account yet?{' '}
        <Link to="/sign-up" className="text-brand-400 hover:underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </form>
  );
};

export default SignInPage;

