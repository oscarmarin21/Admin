import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, TextInput, Select } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../lib/api-client';

const signUpSchema = z.object({
  organization: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  defaultLocale: z.enum(['en', 'es']).default('en'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      organization: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      defaultLocale: 'en',
    },
  });

  const onSubmit = async (data: SignUpFormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/sign-up', {
        organizationName: data.organization,
        defaultLocale: data.defaultLocale,
        admin: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('locale', data.defaultLocale);
      }
      void i18n.changeLanguage(data.defaultLocale);

      navigate('/sign-in?registered=1', { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label className="text-slate-200" htmlFor="organization" value={t('auth.organization')} />
        <TextInput
          id="organization"
          placeholder="My Awesome Company"
          {...register('organization')}
        />
        {errors.organization && (
          <p className="mt-1 text-sm text-red-400">{errors.organization.message}</p>
        )}
      </div>
      <div>
        <Label className="text-slate-200" htmlFor="defaultLocale" value="Default language" />
        <Select id="defaultLocale" {...register('defaultLocale')}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </Select>
        {errors.defaultLocale && (
          <p className="mt-1 text-sm text-red-400">{errors.defaultLocale.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-slate-200" htmlFor="firstName" value="First name" />
          <TextInput id="firstName" placeholder="Jane" {...register('firstName')} />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label className="text-slate-200" htmlFor="lastName" value="Last name" />
          <TextInput id="lastName" placeholder="Doe" {...register('lastName')} />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label className="text-slate-200" htmlFor="email" value={t('auth.email')} />
        <TextInput
          id="email"
          type="email"
          placeholder="admin@example.com"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>
      <div>
        <Label className="text-slate-200" htmlFor="password" value={t('auth.password')} />
        <TextInput
          id="password"
          type="password"
          placeholder="Create a strong password"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" isProcessing={isSubmitting}>
        {t('auth.signUp')}
      </Button>
      <p className="text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/sign-in" className="text-brand-400 hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  );
};

export default SignUpPage;

