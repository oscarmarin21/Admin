import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Textarea,
} from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useProjectsQuery } from '../../projects/hooks';
import { useOrganizationMembersQuery } from '../../members/hooks';
import { useAuthStore } from '../../auth/stores/auth.store';
import {
  useMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
} from '../hooks';
import type { Meeting, MeetingType } from '../types';
import type { MeetingListFilters } from '../api/meetings.api';

const meetingSchema = z.object({
  projectId: z.string().min(1),
  sprintId: z.string().optional(),
  type: z.enum(['daily', 'review', 'retro', 'planning', 'other']),
  date: z.string().min(1),
  summary: z.string().optional(),
  decisions: z.string().optional(),
  actionItems: z.string().optional(),
  followUpOwner: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

const defaultValues: MeetingFormValues = {
  projectId: '',
  sprintId: '',
  type: 'daily',
  date: '',
  summary: '',
  decisions: '',
  actionItems: '',
  followUpOwner: '',
};

const MeetingsPage = (): JSX.Element => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: projects } = useProjectsQuery();
  const { data: members } = useOrganizationMembersQuery();

  const [filters, setFilters] = useState<MeetingListFilters>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const meetingsQuery = useMeetingsQuery(filters);
  const createMutation = useCreateMeetingMutation();
  const updateMutation = useUpdateMeetingMutation();
  const deleteMutation = useDeleteMeetingMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues,
  });

  const projectFieldValue = watch('projectId');
  const dateFieldValue = watch('date');

  const canManage = user?.role === 'admin' || user?.role === 'project_manager';

  const projectOptions = useMemo(
    () =>
      (projects ?? []).map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects],
  );

  const memberOptions = useMemo(
    () =>
      (members ?? [])
        .filter((member) => member.status === 'active')
        .map((member) => ({
          value: member.id,
          label: `${member.firstName} ${member.lastName}`,
        })),
    [members],
  );

  const projectIdRegister = register('projectId');

  useEffect(() => {
    if (
      isModalOpen &&
      modalMode === 'create' &&
      projectOptions.length > 0 &&
      !projectFieldValue
    ) {
      setValue('projectId', projectOptions[0].value, { shouldValidate: true });
    }
  }, [isModalOpen, modalMode, projectOptions, projectFieldValue, setValue]);

  const openCreateModal = () => {
    if (projectOptions.length === 0) {
      return;
    }
    setModalMode('create');
    setSelectedMeeting(null);
    setFormError(null);
    reset({
      ...defaultValues,
      projectId: filters.projectId || projectOptions[0]?.value || '',
      date: new Date().toISOString().slice(0, 16),
    });
    void trigger(['projectId', 'date']);
    setModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setModalMode('edit');
    setSelectedMeeting(meeting);
    setFormError(null);
    reset({
      projectId: meeting.projectId,
      sprintId: meeting.sprintId ?? '',
      type: meeting.type,
      date: meeting.date.slice(0, 16),
      summary: meeting.summary ?? '',
      decisions: meeting.decisions ?? '',
      actionItems: meeting.actionItems ?? '',
      followUpOwner: meeting.followUpOwner ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMeeting(null);
    setFormError(null);
  };

  const onSubmit = async (values: MeetingFormValues) => {
    if (!canManage) {
      setFormError(t('meetings.errors.noPermission'));
      return;
    }

    setFormError(null);
    const payload = {
      sprintId: values.sprintId || undefined,
      type: values.type,
      date: new Date(values.date).toISOString(),
      summary: values.summary ? values.summary.trim() || undefined : undefined,
      decisions: values.decisions ? values.decisions.trim() || undefined : undefined,
      actionItems: values.actionItems ? values.actionItems.trim() || undefined : undefined,
      followUpOwner: values.followUpOwner || undefined,
    };

    try {
      if (modalMode === 'edit' && selectedMeeting) {
        await updateMutation.mutateAsync({
          projectId: selectedMeeting.projectId,
          meetingId: selectedMeeting.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync({
          projectId: values.projectId,
          payload,
        });
      }
      closeModal();
    } catch (error) {
      if (error && typeof error === 'object' && 'isAxiosError' in error && (error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setFormError(
          axiosError.response?.data?.message ?? axiosError.message ?? t('common.unexpectedError'),
        );
      } else {
        setFormError(error instanceof Error ? error.message : t('common.unexpectedError'));
      }
    }
  };

  const handleDelete = (meeting: Meeting) => {
    if (!canManage) return;
    if (!window.confirm(t('meetings.confirmDelete') ?? 'Delete meeting?')) return;
    deleteMutation.mutate({ projectId: meeting.projectId, meetingId: meeting.id });
  };

  const resetFilters = () => setFilters({});

  const meetingList = meetingsQuery.data ?? [];
  const isCreateDisabled =
    !canManage || meetingsQuery.isLoading || projectOptions.length === 0;
  const isSubmitDisabled =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    !projectFieldValue ||
    !dateFieldValue;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">{t('navigation.meetings')}</h1>
        {canManage && (
          <div className="flex w-full flex-col gap-1 sm:w-auto">
            <Button onClick={openCreateModal} className="w-full sm:w-auto" disabled={isCreateDisabled}>
              {t('meetings.actions.create')}
            </Button>
            {projectOptions.length === 0 && (
              <span className="text-xs text-slate-400">
                {t('meetings.messages.noProjects')}
              </span>
            )}
          </div>
        )}
      </div>

      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="filter-project" value={t('meetings.filters.project')} className="text-slate-300" />
            <Select
              id="filter-project"
              value={filters.projectId ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, projectId: event.target.value || undefined }))
              }
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('meetings.filters.anyProject')}</option>
              {projectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-type" value={t('meetings.filters.type')} className="text-slate-300" />
            <Select
              id="filter-type"
              value={filters.type ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, type: (event.target.value as MeetingType) || undefined }))
              }
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('meetings.filters.anyType')}</option>
              <option value="daily">{t('meetings.types.daily')}</option>
              <option value="planning">{t('meetings.types.planning')}</option>
              <option value="review">{t('meetings.types.review')}</option>
              <option value="retro">{t('meetings.types.retro')}</option>
              <option value="other">{t('meetings.types.other')}</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-search" value={t('meetings.filters.search')} className="text-slate-300" />
            <TextInput
              id="filter-search"
              type="search"
              placeholder={t('meetings.filters.searchPlaceholder') ?? 'Search'}
              value={filters.search ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value || undefined }))
              }
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-date-from" value={t('meetings.filters.dateFrom')} className="text-slate-300" />
            <TextInput
              id="filter-date-from"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, dateFrom: event.target.value || undefined }))
              }
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-date-to" value={t('meetings.filters.dateTo')} className="text-slate-300" />
            <TextInput
              id="filter-date-to"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, dateTo: event.target.value || undefined }))
              }
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button color="light" onClick={resetFilters} className="w-full sm:w-auto">
            {t('meetings.actions.resetFilters')}
          </Button>
        </div>
      </Card>

      {meetingsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : meetingsQuery.isError ? (
        <Alert color="failure">{t('common.failedToLoad')}</Alert>
      ) : meetingList.length === 0 ? (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <p className="text-sm text-slate-300">{t('meetings.emptyState')}</p>
        </Card>
      ) : (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <div className="overflow-x-auto">
            <Table className="bg-transparent text-slate-100">
              <Table.Head className="bg-slate-800 text-slate-100">
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('meetings.table.project')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('meetings.table.date')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('meetings.table.type')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('meetings.table.summary')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('meetings.table.followUp')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 text-right uppercase tracking-wide">
                  {t('meetings.table.actions')}
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-slate-700/60">
                {meetingList.map((meeting) => {
                  const project = projects?.find((item) => item.id === meeting.projectId);
                  const owner = members?.find((member) => member.id === meeting.followUpOwner);
                  return (
                    <Table.Row key={meeting.id} className="border-slate-700 bg-transparent text-slate-100">
                      <Table.Cell>{project?.name ?? t('meetings.table.unknownProject')}</Table.Cell>
                      <Table.Cell>{new Date(meeting.date).toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Badge color="info">{t(`meetings.types.${meeting.type}`)}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="text-sm font-semibold">{meeting.summary}</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{meeting.decisions}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {owner ? (
                          <span>{`${owner.firstName} ${owner.lastName}`}</span>
                        ) : (
                          <span className="text-slate-400">{t('common.notSet')}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="flex justify-end gap-2">
                        {canManage && (
                          <Button size="xs" color="light" onClick={() => openEditModal(meeting)}>
                            {t('common.edit')}
                          </Button>
                        )}
                        {canManage && (
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleDelete(meeting)}
                            isProcessing={deleteMutation.isPending}
                          >
                            {t('common.delete')}
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </Card>
      )}

      <Modal show={isModalOpen} onClose={closeModal} dismissible>
        <Modal.Header>
          {modalMode === 'edit' ? t('meetings.modal.editTitle') : t('meetings.modal.createTitle')}
        </Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {formError && <Alert color="failure">{formError}</Alert>}
            {modalMode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="meeting-project" value={t('meetings.fields.project')} />
                <Select id="meeting-project" {...projectIdRegister}>
                  <option value="">{t('meetings.fields.selectProject')}</option>
                  {projectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-400">{t('meetings.errors.projectRequired')}</p>
                )}
              </div>
            )}
            {modalMode === 'edit' && <input type="hidden" {...projectIdRegister} />}
            <div className="space-y-2">
              <Label htmlFor="meeting-type" value={t('meetings.fields.type')} />
              <Select id="meeting-type" {...register('type')}>
                <option value="daily">{t('meetings.types.daily')}</option>
                <option value="planning">{t('meetings.types.planning')}</option>
                <option value="review">{t('meetings.types.review')}</option>
                <option value="retro">{t('meetings.types.retro')}</option>
                <option value="other">{t('meetings.types.other')}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-date" value={t('meetings.fields.date')} />
              <TextInput id="meeting-date" type="datetime-local" {...register('date')} />
              {errors.date && <p className="text-sm text-red-400">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-summary" value={t('meetings.fields.summary')} />
              <Textarea id="meeting-summary" rows={2} {...register('summary')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-decisions" value={t('meetings.fields.decisions')} />
              <Textarea id="meeting-decisions" rows={2} {...register('decisions')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-actionItems" value={t('meetings.fields.actionItems')} />
              <Textarea id="meeting-actionItems" rows={2} {...register('actionItems')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-followUp" value={t('meetings.fields.followUpOwner')} />
              <Select id="meeting-followUp" {...register('followUpOwner')}>
                <option value="">{t('meetings.fields.selectOwner')}</option>
                {memberOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" isProcessing={isSubmitting} disabled={isSubmitDisabled}>
              {modalMode === 'edit' ? t('meetings.modal.saveAction') : t('meetings.modal.createAction')}
            </Button>
            <Button color="light" type="button" onClick={closeModal}>
              {t('meetings.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default MeetingsPage;

