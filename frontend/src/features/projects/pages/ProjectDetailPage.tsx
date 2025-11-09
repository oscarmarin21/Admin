import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Spinner,
  Alert,
  Modal,
  TextInput,
  Textarea,
  Select,
  Label,
  Checkbox,
} from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useProjectQuery,
  useProjectTasksQuery,
  useUpdateProjectMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} from '../hooks';
import { useOrganizationMembersQuery } from '../../members/hooks';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { ProjectInput, TaskInput, TaskStatus, Task } from '../types';

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['planned', 'active', 'on_hold', 'completed', 'archived']),
  ownerId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  blocked: z.boolean().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;

const defaultProjectValues: ProjectFormValues = {
  name: '',
  description: '',
  status: 'planned',
  ownerId: '',
  startDate: '',
  endDate: '',
};

const defaultTaskValues: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: '',
  dueDate: '',
  blocked: false,
};

const ProjectDetailPage = (): JSX.Element => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectQuery(
    projectId ?? '',
  );
  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useProjectTasksQuery(projectId ?? '');
  const { data: members } = useOrganizationMembersQuery();

  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalState, setTaskModalState] = useState<{ mode: 'create' | 'edit'; task?: Task } | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);

  const updateProjectMutation = useUpdateProjectMutation(projectId ?? '');

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const ownersOptions = useMemo(
    () =>
      (members ?? []).filter((member) => member.status === 'active').map((member) => ({
        value: member.id,
        label: `${member.firstName} ${member.lastName}`,
      })),
    [members],
  );

  const assigneeOptions = ownersOptions;

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProjectForm,
    formState: { errors: projectErrors, isSubmitting: isSavingProject },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultProjectValues,
  });

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTaskForm,
    formState: { errors: taskErrors, isSubmitting: isSavingTask },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultTaskValues,
  });

  const openProjectModal = () => {
    if (!project) return;
    setFormError(null);
    resetProjectForm({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      ownerId: project.ownerId,
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
    });
    setProjectModalOpen(true);
  };

  const submitProject = async (values: ProjectFormValues) => {
    if (!projectId) return;
    setFormError(null);
    const payload: Partial<ProjectInput> = {
      name: values.name,
      description: values.description?.trim() || undefined,
      status: values.status,
      ownerId: values.ownerId,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
    };
    try {
      await updateProjectMutation.mutateAsync(payload);
      setProjectModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const openCreateTaskModal = () => {
    setTaskFormError(null);
    const defaultAssignee =
      currentUserId && assigneeOptions.some((option) => option.value === currentUserId)
        ? currentUserId
        : assigneeOptions[0]?.value ?? '';
    resetTaskForm({
      ...defaultTaskValues,
      assigneeId: defaultAssignee,
    });
    setTaskModalState({ mode: 'create' });
  };

  const openEditTaskModal = (task: Task) => {
    setTaskFormError(null);
    resetTaskForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      blocked: task.blocked,
    });
    setTaskModalState({ mode: 'edit', task });
  };

  const closeTaskModal = () => {
    setTaskModalState(null);
    setTaskFormError(null);
  };

  const submitTask = async (values: TaskFormValues) => {
    if (!projectId) return;
    setTaskFormError(null);
    const payload: TaskInput = {
      title: values.title,
      description: values.description?.trim() || undefined,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId ? values.assigneeId : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      blocked: values.blocked ?? false,
    };
    try {
      if (taskModalState?.mode === 'edit' && taskModalState.task) {
        await updateTaskMutation.mutateAsync({
          projectId,
          taskId: taskModalState.task.id,
          payload,
        });
      } else {
        await createTaskMutation.mutateAsync({ projectId, payload });
      }
      closeTaskModal();
    } catch (error) {
      setTaskFormError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    if (!projectId) return;
    updateTaskStatusMutation.mutate(
      { projectId, taskId, status },
      {
        onError: (error) => {
          // eslint-disable-next-line no-alert
          alert(error instanceof Error ? error.message : t('common.unexpectedError'));
        },
      },
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(t('tasks.confirmDelete') ?? 'Delete task?');
    if (!confirmed) return;
    try {
      await deleteTaskMutation.mutateAsync({ projectId, taskId });
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  if (!projectId) {
    return <Alert color="failure">{t('projects.invalidProject')}</Alert>;
  }

  return (
    <div className="space-y-6">
      {isProjectLoading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {isProjectError && <Alert color="failure">{t('common.failedToLoad')}</Alert>}

      {project && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-100">{project.name}</h1>
              <p className="text-sm text-slate-400">
                {t(`projectStatus.${project.status}` as const, project.status)}
              </p>
            </div>
            <Button color="light" onClick={openProjectModal}>
              {t('common.edit')}
            </Button>
          </div>

          <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-400">{t('projects.fields.owner')}</dt>
                <dd className="text-lg">
                  {members?.find((member) => member.id === project.ownerId)
                    ? `${members.find((member) => member.id === project.ownerId)?.firstName ?? ''} ${
                        members?.find((member) => member.id === project.ownerId)?.lastName ?? ''
                      }`
                    : t('common.notSet')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">{t('projects.fields.dates')}</dt>
                <dd className="text-lg">
                  {[project.startDate, project.endDate]
                    .filter(Boolean)
                    .map((date) => (date ? new Date(date).toLocaleDateString() : ''))
                    .join(' → ') || t('common.notSet')}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-400">{t('projects.fields.description')}</dt>
                <dd className="text-sm text-slate-200">
                  {project.description || t('common.notSet')}
                </dd>
              </div>
            </dl>
          </Card>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-slate-100">{t('navigation.tasks')}</h2>
              <Button
                className="self-start border border-brand-500 bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500"
                onClick={openCreateTaskModal}
              >
                {t('tasks.actions.add')}
              </Button>
            </div>

            {isTasksLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : isTasksError ? (
              <Alert color="failure">{t('common.failedToLoad')}</Alert>
            ) : (
              <div className="space-y-3">
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border border-slate-700 bg-slate-800/80 text-slate-100 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-slate-300">{task.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                            <span>
                              {t('tasks.fields.status')}:{' '}
                              <strong>{t(`taskStatus.${task.status}` as const)}</strong>
                            </span>
                            <span>
                              {t('tasks.fields.priority')}:{' '}
                              <strong>{t(`tasks.priority.${task.priority}` as const)}</strong>
                            </span>
                            <span>
                              {t('tasks.fields.assignee')}:{' '}
                              <strong>
                                {task.assigneeId
                                  ? `${members?.find((member) => member.id === task.assigneeId)?.firstName ?? ''} ${
                                      members?.find((member) => member.id === task.assigneeId)?.lastName ?? ''
                                    }`
                                  : t('common.notSet')}
                              </strong>
                            </span>
                            {task.dueDate && (
                              <span>
                                {t('tasks.fields.dueDate')}: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong>
                              </span>
                            )}
                            {task.blocked && (
                              <span className="text-red-300">{t('tasks.fields.blocked')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          <Select
                            value={task.status}
                            onChange={(event) =>
                              handleTaskStatusChange(task.id, event.target.value as TaskStatus)
                            }
                            className="w-40 border-slate-700 bg-slate-900 text-slate-100"
                          >
                            <option value="todo">{t('taskStatus.todo')}</option>
                            <option value="doing">{t('taskStatus.doing')}</option>
                            <option value="done">{t('taskStatus.done')}</option>
                          </Select>
                          <div className="flex gap-2">
                            <Button color="light" size="xs" onClick={() => openEditTaskModal(task)}>
                              {t('common.edit')}
                            </Button>
                            <Button
                              color="failure"
                              size="xs"
                              onClick={() => handleDeleteTask(task.id)}
                              isProcessing={deleteTaskMutation.isPending}
                            >
                              {t('common.delete')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
                    <p className="text-sm text-slate-300">{t('tasks.placeholder')}</p>
                  </Card>
                )}
              </div>
            )}
          </section>
        </>
      )}

      <Modal show={isProjectModalOpen} onClose={() => setProjectModalOpen(false)} dismissible>
        <Modal.Header>{t('projects.modal.editTitle')}</Modal.Header>
        <form onSubmit={handleProjectSubmit(submitProject)}>
          <Modal.Body className="space-y-4">
            {formError && <Alert color="failure">{formError}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="project-name" value={t('projects.fields.name')} />
              <TextInput id="project-name" {...registerProject('name')} />
              {projectErrors.name && (
                <p className="text-sm text-red-400">{projectErrors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description" value={t('projects.fields.description')} />
              <Textarea id="project-description" rows={3} {...registerProject('description')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-status" value={t('projects.fields.status')} />
                <Select id="project-status" {...registerProject('status')}>
                  <option value="planned">{t('projectStatus.planned')}</option>
                  <option value="active">{t('projectStatus.active')}</option>
                  <option value="on_hold">{t('projectStatus.on_hold')}</option>
                  <option value="completed">{t('projectStatus.completed')}</option>
                  <option value="archived">{t('projectStatus.archived')}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-owner" value={t('projects.fields.owner')} />
                <Select id="project-owner" {...registerProject('ownerId')}>
                  <option value="">{t('projects.fields.selectOwner')}</option>
                  {ownersOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {projectErrors.ownerId && (
                  <p className="text-sm text-red-400">{projectErrors.ownerId.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-start" value={t('projects.fields.startDate')} />
                <TextInput id="project-start" type="date" {...registerProject('startDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-end" value={t('projects.fields.endDate')} />
                <TextInput id="project-end" type="date" {...registerProject('endDate')} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              isProcessing={isSavingProject || updateProjectMutation.isPending}
            >
              {t('common.saveChanges')}
            </Button>
            <Button color="light" onClick={() => setProjectModalOpen(false)} type="button">
              {t('projects.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!taskModalState} onClose={closeTaskModal} dismissible>
        <Modal.Header>
          {taskModalState?.mode === 'edit'
            ? t('tasks.modal.editTitle')
            : t('tasks.modal.createTitle')}
        </Modal.Header>
        <form onSubmit={handleTaskSubmit(submitTask)}>
          <Modal.Body className="space-y-4">
            {taskFormError && <Alert color="failure">{taskFormError}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="task-title" value={t('tasks.fields.title')} />
              <TextInput id="task-title" {...registerTask('title')} />
              {taskErrors.title && <p className="text-sm text-red-400">{taskErrors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description" value={t('tasks.fields.description')} />
              <Textarea id="task-description" rows={3} {...registerTask('description')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-status" value={t('tasks.fields.status')} />
                <Select id="task-status" {...registerTask('status')}>
                  <option value="todo">{t('taskStatus.todo')}</option>
                  <option value="doing">{t('taskStatus.doing')}</option>
                  <option value="done">{t('taskStatus.done')}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority" value={t('tasks.fields.priority')} />
                <Select id="task-priority" {...registerTask('priority')}>
                  <option value="low">{t('tasks.priority.low')}</option>
                  <option value="medium">{t('tasks.priority.medium')}</option>
                  <option value="high">{t('tasks.priority.high')}</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-assignee" value={t('tasks.fields.assignee')} />
                <Select id="task-assignee" {...registerTask('assigneeId')}>
                  <option value="">{t('projects.fields.selectOwner')}</option>
                  {assigneeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due-date" value={t('tasks.fields.dueDate')} />
                <TextInput id="task-due-date" type="date" {...registerTask('dueDate')} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="task-blocked" {...registerTask('blocked')} />
              <Label htmlFor="task-blocked">{t('tasks.fields.blocked')}</Label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              isProcessing={isSavingTask || createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {taskModalState?.mode === 'edit'
                ? t('tasks.modal.saveAction')
                : t('tasks.modal.createAction')}
            </Button>
            <Button color="light" type="button" onClick={closeTaskModal}>
              {t('tasks.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;

