import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Modal, Spinner, Alert, TextInput, Textarea, Select, Label } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../hooks';
import type { Project, ProjectInput } from '../types';
import { useOrganizationMembersQuery } from '../../members/hooks';
import { useAuthStore } from '../../auth/stores/auth.store';

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['planned', 'active', 'on_hold', 'completed', 'archived']),
  ownerId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const defaultValues: ProjectFormValues = {
  name: '',
  description: '',
  status: 'planned',
  ownerId: '',
  startDate: '',
  endDate: '',
};

const ProjectsPage = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useProjectsQuery();
  const { data: members } = useOrganizationMembersQuery();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createProjectMutation = useCreateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation(editingProject?.id ?? '');

  const ownersOptions = useMemo(
    () =>
      (members ?? []).filter((member) => member.status === 'active').map((member) => ({
        value: member.id,
        label: `${member.firstName} ${member.lastName}`,
      })),
    [members],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setFormError(null);
    const defaultOwnerOption =
      currentUserId && ownersOptions.some((option) => option.value === currentUserId)
        ? currentUserId
        : ownersOptions[0]?.value ?? '';
    reset({ ...defaultValues, ownerId: defaultOwnerOption });
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormError(null);
    reset({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      ownerId: project.ownerId,
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setFormError(null);
  };

  const onSubmit = async (values: ProjectFormValues) => {
    setFormError(null);
    const payload: ProjectInput = {
      name: values.name,
      description: values.description?.trim() || undefined,
      status: values.status,
      ownerId: values.ownerId,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
    };

    try {
      if (editingProject) {
        await updateProjectMutation.mutateAsync(payload);
      } else {
        await createProjectMutation.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const handleDelete = async (projectId: string) => {
    const confirmed = window.confirm(t('projects.confirmDelete') ?? 'Are you sure?');
    if (!confirmed) {
      return;
    }
    try {
      await deleteProjectMutation.mutateAsync(projectId);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error instanceof Error ? error.message : 'Unable to delete project.');
    }
  };

  useEffect(() => {
    if (!editingProject && (ownersOptions.length > 0 || currentUserId)) {
      // ensure default owner set when opening create modal
      const fallbackOwner =
        currentUserId && ownersOptions.some((option) => option.value === currentUserId)
          ? currentUserId
          : ownersOptions[0]?.value ?? '';
      reset((current) => ({
        ...current,
        ownerId: current.ownerId || fallbackOwner,
      }));
    }
  }, [editingProject, ownersOptions, reset, currentUserId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">{t('navigation.projects')}</h1>
        <Button
          className="self-start border border-brand-500 bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500"
          onClick={openCreateModal}
        >
          {t('projects.actions.add')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <Alert color="failure" className="bg-red-900/40 text-red-100">
          {t('common.failedToLoad')}
        </Alert>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="border border-slate-700 bg-slate-800/80 text-slate-100 shadow-lg transition hover:border-slate-500 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm capitalize text-slate-300">
                    {t(`projectStatus.${project.status}` as const, project.status)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button color="light" size="xs" onClick={() => navigate(`/projects/${project.id}`)}>
                    {t('common.view')}
                  </Button>
                  <Button color="light" size="xs" onClick={() => openEditModal(project)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    color="failure"
                    size="xs"
                    onClick={() => handleDelete(project.id)}
                    isProcessing={deleteProjectMutation.isPending}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-slate-300">{project.description}</p>
              )}
              <dl className="text-xs text-slate-400">
                <div className="flex justify-between">
                  <dt>{t('projects.fields.owner')}</dt>
                  <dd>
                    {members?.find((member) => member.id === project.ownerId)
                      ? `${members.find((member) => member.id === project.ownerId)?.firstName ?? ''} ${
                          members?.find((member) => member.id === project.ownerId)?.lastName ?? ''
                        }`
                      : '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t('projects.fields.dates')}</dt>
                  <dd>
                    {[project.startDate, project.endDate]
                      .filter(Boolean)
                      .map((date) => (date ? new Date(date).toLocaleDateString() : ''))
                      .join(' → ') || t('common.notSet')}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
          {projects && projects.length === 0 && (
            <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
              <p className="text-sm text-slate-300">{t('projects.emptyState')}</p>
            </Card>
          )}
        </div>
      )}

      <Modal show={isModalOpen} onClose={closeModal} dismissible>
        <Modal.Header>
          {editingProject ? t('projects.modal.editTitle') : t('projects.modal.createTitle')}
        </Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className="space-y-4">
            {formError && <Alert color="failure">{formError}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="name" value={t('projects.fields.name')} />
              <TextInput id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" value={t('projects.fields.description')} />
              <Textarea id="description" rows={3} {...register('description')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status" value={t('projects.fields.status')} />
                <Select id="status" {...register('status')}>
                  <option value="planned">{t('projectStatus.planned')}</option>
                  <option value="active">{t('projectStatus.active')}</option>
                  <option value="on_hold">{t('projectStatus.on_hold')}</option>
                  <option value="completed">{t('projectStatus.completed')}</option>
                  <option value="archived">{t('projectStatus.archived')}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerId" value={t('projects.fields.owner')} />
                <Select id="ownerId" {...register('ownerId')}>
                  <option value="">{t('projects.fields.selectOwner')}</option>
                  {ownersOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.ownerId && (
                  <p className="text-sm text-red-400">{errors.ownerId.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" value={t('projects.fields.startDate')} />
                <TextInput id="startDate" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" value={t('projects.fields.endDate')} />
                <TextInput id="endDate" type="date" {...register('endDate')} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              className="border border-brand-500 bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500"
              isProcessing={isSubmitting || createProjectMutation.isPending || updateProjectMutation.isPending}
            >
              {editingProject ? t('common.saveChanges') : t('projects.modal.createAction')}
            </Button>
            <Button color="light" onClick={closeModal} type="button">
              {t('projects.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;

