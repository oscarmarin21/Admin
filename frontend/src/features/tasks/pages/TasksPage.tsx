import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Textarea,
} from 'flowbite-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useProjectsQuery } from '../../projects/hooks';
import { useOrganizationMembersQuery } from '../../members/hooks';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { TFunction } from 'i18next';
import type { Task, TaskStatus, Project } from '../../projects/types';
import type { OrganizationMember } from '../../members/api/members.api';
import {
  useTasksQuery,
  useCreateTaskGlobalMutation,
  useUpdateTaskGlobalMutation,
  useUpdateTaskStatusGlobalMutation,
  useDeleteTaskGlobalMutation,
} from '../hooks';
import type { TaskListFilters } from '../api/tasks.api';

const taskModalSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  blocked: z.boolean().optional(),
});

type TaskModalValues = z.infer<typeof taskModalSchema>;

const defaultModalValues: TaskModalValues = {
  projectId: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: '',
  dueDate: '',
  blocked: false,
};

const TasksPage = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: projects } = useProjectsQuery();
  const { data: members } = useOrganizationMembersQuery();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const [filters, setFilters] = useState<{
    projectId: string;
    status: string;
    priority: string;
    assigneeId: string;
    blocked: string;
    search: string;
    dueDateFrom: string;
    dueDateTo: string;
  }>({
    projectId: '',
    status: '',
    priority: '',
    assigneeId: '',
    blocked: '',
    search: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  const queryFilters: TaskListFilters = useMemo(
    () => ({
      projectId: filters.projectId || undefined,
      status: filters.status ? (filters.status as Task['status']) : undefined,
      priority: filters.priority ? (filters.priority as Task['priority']) : undefined,
      assigneeId: filters.assigneeId || undefined,
      blocked:
        filters.blocked === '' ? undefined : filters.blocked === 'true',
      search: filters.search || undefined,
      dueDateFrom: filters.dueDateFrom || undefined,
      dueDateTo: filters.dueDateTo || undefined,
    }),
    [filters],
  );

  const { data: tasks, isLoading, isError } = useTasksQuery(queryFilters);

  const createTaskMutation = useCreateTaskGlobalMutation();
  const updateTaskMutation = useUpdateTaskGlobalMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusGlobalMutation();
  const deleteTaskMutation = useDeleteTaskGlobalMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskModalValues>({
    resolver: zodResolver(taskModalSchema),
    defaultValues: defaultModalValues,
  });

  const canManageTasks = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'member';
  const canDeleteTasks = user?.role === 'admin' || user?.role === 'project_manager';

  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.name,
    })) ?? [];

  const projectDictionary = useMemo(() => {
    const map = new Map<string, Project>();
    projects?.forEach((project) => map.set(project.id, project));
    return map;
  }, [projects]);

  const memberOptions =
    members
      ?.filter((member) => member.status === 'active')
      .map((member) => ({
        value: member.id,
        label: `${member.firstName} ${member.lastName}`,
      })) ?? [];

  const memberDictionary = useMemo(() => {
    const map = new Map<string, OrganizationMember>();
    members?.forEach((member) => map.set(member.id, member));
    return map;
  }, [members]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setFormError(null);
    const defaultProject =
      (filters.projectId && projectOptions.some((option) => option.value === filters.projectId)
        ? filters.projectId
        : projectOptions[0]?.value) ?? '';
    reset({
      ...defaultModalValues,
      projectId: defaultProject,
      assigneeId: memberOptions[0]?.value ?? '',
    });
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setFormError(null);
    reset({
      projectId: task.projectId,
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      blocked: task.blocked,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
    setFormError(null);
  };

  const onSubmit = async (values: TaskModalValues) => {
    if (!canManageTasks) {
      setFormError(t('tasks.errors.noPermission'));
      return;
    }
    setFormError(null);
    const payload = {
      title: values.title,
      description: values.description?.trim() || undefined,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId ? values.assigneeId : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      blocked: values.blocked ?? false,
      tags: [],
    };

    try {
      if (modalMode === 'edit' && selectedTask) {
        await updateTaskMutation.mutateAsync({
          projectId: selectedTask.projectId,
          taskId: selectedTask.id,
          payload,
        });
      } else {
        await createTaskMutation.mutateAsync({
          projectId: values.projectId,
          payload,
        });
      }
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const handleStatusChange = (task: Task, status: Task['status']) => {
    if (!canManageTasks) return;
    updateTaskStatusMutation.mutate({
      projectId: task.projectId,
      taskId: task.id,
      status,
    });
  };

  const handleDeleteTask = (task: Task) => {
    if (!canDeleteTasks) return;
    const confirmed = window.confirm(t('tasks.confirmDelete') ?? 'Delete task?');
    if (!confirmed) return;
    deleteTaskMutation.mutate({ projectId: task.projectId, taskId: task.id });
  };

  const resetFilters = () =>
    setFilters({
      projectId: '',
      status: '',
      priority: '',
      assigneeId: '',
      blocked: '',
      search: '',
      dueDateFrom: '',
      dueDateTo: '',
    });

  const filteredTasksForBoard =
    viewMode === 'board' && queryFilters.projectId
      ? (tasks ?? []).filter((task) => task.projectId === queryFilters.projectId)
      : tasks ?? [];

  const renderListView = () => {
    if (!tasks || tasks.length === 0) {
      return (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <p className="text-sm text-slate-300">{t('tasks.emptyState')}</p>
        </Card>
      );
    }

    return (
      <>
        <div className="space-y-4 md:hidden">
          {tasks.map((task) => {
            const project = projects?.find((item) => item.id === task.projectId);
            const assignee = members?.find((member) => member.id === task.assigneeId);
            return (
              <Card
                key={task.id}
                className="border border-slate-700 bg-slate-800/80 text-slate-100 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand-300 hover:underline"
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                    >
                      {project?.name ?? t('tasks.table.unknownProject')}
                    </button>
                    <h2 className="text-lg font-semibold text-slate-100">{task.title}</h2>
                    {task.description && (
                      <p className="text-sm text-slate-400">{task.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{t('tasks.fields.status')}:</span>
                      <Select
                        value={task.status}
                        disabled={!canManageTasks}
                        onChange={(event) =>
                          handleStatusChange(task, event.target.value as Task['status'])
                        }
                        className="w-32 border-slate-700 bg-slate-900 text-slate-100"
                      >
                        <option value="todo">{t('taskStatus.todo')}</option>
                        <option value="doing">{t('taskStatus.doing')}</option>
                        <option value="done">{t('taskStatus.done')}</option>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{t('tasks.fields.priority')}:</span>
                      <Badge
                        color={
                          task.priority === 'high'
                            ? 'failure'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {t(`tasks.priority.${task.priority}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{t('tasks.fields.assignee')}:</span>
                      <span>
                        {assignee ? `${assignee.firstName} ${assignee.lastName}` : t('common.notSet')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{t('tasks.fields.dueDate')}:</span>
                      <span>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('common.notSet')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManageTasks && (
                      <Button size="xs" color="light" onClick={() => openEditModal(task)}>
                        {t('common.edit')}
                      </Button>
                    )}
                    {canDeleteTasks && (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteTask(task)}
                        isProcessing={deleteTaskMutation.isPending}
                      >
                        {t('common.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="hidden md:block border border-slate-700 bg-slate-800/80 text-slate-100">
          <div className="overflow-x-auto">
            <Table className="bg-transparent text-slate-100">
              <Table.Head className="bg-slate-800 text-slate-100">
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.table.project')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.table.title')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.fields.status')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.fields.priority')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.fields.assignee')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('tasks.fields.dueDate')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 text-right uppercase tracking-wide">
                  {t('tasks.table.actions')}
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-slate-700/60">
                {tasks.map((task) => {
                  const project = projects?.find((item) => item.id === task.projectId);
                  const assignee = members?.find((member) => member.id === task.assigneeId);
                  return (
                    <Table.Row key={task.id} className="border-slate-700 bg-transparent text-slate-100">
                      <Table.Cell>
                        <button
                          type="button"
                          className="text-left text-sm font-semibold text-brand-300 hover:underline"
                          onClick={() => navigate(`/projects/${task.projectId}`)}
                        >
                          {project?.name ?? t('tasks.table.unknownProject')}
                        </button>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{task.title}</span>
                          {task.description && (
                            <span className="text-xs text-slate-400">{task.description}</span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Select
                          value={task.status}
                          disabled={!canManageTasks}
                          onChange={(event) =>
                            handleStatusChange(task, event.target.value as Task['status'])
                          }
                          className="w-36 border-slate-700 bg-slate-900 text-slate-100"
                        >
                          <option value="todo">{t('taskStatus.todo')}</option>
                          <option value="doing">{t('taskStatus.doing')}</option>
                          <option value="done">{t('taskStatus.done')}</option>
                        </Select>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            task.priority === 'high'
                              ? 'failure'
                              : task.priority === 'medium'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {t(`tasks.priority.${task.priority}`)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {assignee ? (
                          <span>{`${assignee.firstName} ${assignee.lastName}`}</span>
                        ) : (
                          <span className="text-slate-400">{t('common.notSet')}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {task.dueDate ? (
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-slate-400">{t('common.notSet')}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="flex justify-end gap-2">
                        {canManageTasks && (
                          <Button color="light" size="xs" onClick={() => openEditModal(task)}>
                            {t('common.edit')}
                          </Button>
                        )}
                        {canDeleteTasks && (
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => handleDeleteTask(task)}
                            isProcessing={deleteTaskMutation.isPending}
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
      </>
    );
  };

  const renderBoardView = () => {
    if (!queryFilters.projectId) {
      return (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <p className="text-sm text-slate-300">{t('tasks.board.selectProject')}</p>
        </Card>
      );
    }

    if (filteredTasksForBoard.length === 0) {
      return (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <p className="text-sm text-slate-300">{t('tasks.board.empty')}</p>
        </Card>
      );
    }

    return (
      <TaskBoard
        tasks={filteredTasksForBoard}
        projectMap={projectDictionary}
        memberMap={memberDictionary}
        onStatusChange={handleStatusChange}
        onEdit={openEditModal}
        onDelete={handleDeleteTask}
        canManage={canManageTasks}
        canDelete={canDeleteTasks}
        t={t}
      />
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      );
    }

    if (isError) {
      return <Alert color="failure">{t('common.failedToLoad')}</Alert>;
    }

    return viewMode === 'board' ? renderBoardView() : renderListView();
  };


  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-semibold text-slate-100">{t('navigation.tasks')}</h1>
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-700">
            <Button
              size="sm"
              color={viewMode === 'list' ? 'info' : 'light'}
              onClick={() => setViewMode('list')}
            >
              {t('tasks.views.list')}
            </Button>
            <Button
              size="sm"
              color={viewMode === 'board' ? 'info' : 'light'}
              onClick={() => setViewMode('board')}
            >
              {t('tasks.views.board')}
            </Button>
          </div>
        </div>
        {canManageTasks && (
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            {t('tasks.actions.add')}
          </Button>
        )}
      </div>

      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <Label value={t('tasks.filters.project')} htmlFor="filter-project" className="text-slate-300" />
            <Select
              id="filter-project"
              value={filters.projectId}
              onChange={(event) => setFilters((prev) => ({ ...prev, projectId: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('tasks.filters.anyProject')}</option>
              {projectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.fields.status')} htmlFor="filter-status" className="text-slate-300" />
            <Select
              id="filter-status"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('tasks.filters.anyStatus')}</option>
              <option value="todo">{t('taskStatus.todo')}</option>
              <option value="doing">{t('taskStatus.doing')}</option>
              <option value="done">{t('taskStatus.done')}</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.fields.priority')} htmlFor="filter-priority" className="text-slate-300" />
            <Select
              id="filter-priority"
              value={filters.priority}
              onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('tasks.filters.anyPriority')}</option>
              <option value="low">{t('tasks.priority.low')}</option>
              <option value="medium">{t('tasks.priority.medium')}</option>
              <option value="high">{t('tasks.priority.high')}</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.fields.assignee')} htmlFor="filter-assignee" className="text-slate-300" />
            <Select
              id="filter-assignee"
              value={filters.assigneeId}
              onChange={(event) => setFilters((prev) => ({ ...prev, assigneeId: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            >
              <option value="">{t('tasks.filters.anyAssignee')}</option>
              {memberOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.filters.search')} htmlFor="filter-search" className="text-slate-300" />
            <TextInput
              id="filter-search"
              type="search"
              placeholder={t('tasks.filters.searchPlaceholder') ?? 'Search tasks'}
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.filters.dueFrom')} htmlFor="filter-due-from" className="text-slate-300" />
            <TextInput
              id="filter-due-from"
              type="date"
              value={filters.dueDateFrom}
              onChange={(event) => setFilters((prev) => ({ ...prev, dueDateFrom: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <Label value={t('tasks.filters.dueTo')} htmlFor="filter-due-to" className="text-slate-300" />
            <TextInput
              id="filter-due-to"
              type="date"
              value={filters.dueDateTo}
              onChange={(event) => setFilters((prev) => ({ ...prev, dueDateTo: event.target.value }))}
              className="w-full border-slate-700 bg-slate-900 text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="filter-blocked"
              checked={filters.blocked === 'true'}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, blocked: event.target.checked ? 'true' : '' }))
              }
            />
            <Label htmlFor="filter-blocked" className="text-slate-300">
              {t('tasks.filters.blockedOnly')}
            </Label>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button color="light" onClick={resetFilters} className="w-full sm:w-auto">
            {t('tasks.actions.resetFilters')}
          </Button>
        </div>
      </Card>

      {renderContent()}

      <Modal show={isModalOpen} onClose={closeModal} dismissible>
        <Modal.Header>
          {modalMode === 'edit' ? t('tasks.modal.editTitle') : t('tasks.modal.createTitle')}
        </Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className="space-y-4">
            {formError && <Alert color="failure">{formError}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="task-title" value={t('tasks.fields.title')} />
              <TextInput id="task-title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description" value={t('tasks.fields.description')} />
              <Textarea id="task-description" rows={3} {...register('description')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-status" value={t('tasks.fields.status')} />
                <Select id="task-status" {...register('status')}>
                  <option value="todo">{t('taskStatus.todo')}</option>
                  <option value="doing">{t('taskStatus.doing')}</option>
                  <option value="done">{t('taskStatus.done')}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority" value={t('tasks.fields.priority')} />
                <Select id="task-priority" {...register('priority')}>
                  <option value="low">{t('tasks.priority.low')}</option>
                  <option value="medium">{t('tasks.priority.medium')}</option>
                  <option value="high">{t('tasks.priority.high')}</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-assignee" value={t('tasks.fields.assignee')} />
                <Select id="task-assignee" {...register('assigneeId')}>
                  <option value="">{t('tasks.fields.selectAssignee')}</option>
                  {memberOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due-date" value={t('tasks.fields.dueDate')} />
                <TextInput id="task-due-date" type="date" {...register('dueDate')} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="task-blocked" {...register('blocked')} />
              <Label htmlFor="task-blocked">{t('tasks.fields.blocked')}</Label>
            </div>
            {modalMode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="task-project" value={t('tasks.fields.project')} />
                <Select id="task-project" {...register('projectId')}>
                  <option value="">{t('tasks.fields.selectProject')}</option>
                  {projectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-400">{errors.projectId.message}</p>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              isProcessing={
                isSubmitting ||
                createTaskMutation.isPending ||
                updateTaskMutation.isPending
              }
              className="border border-brand-500 bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500"
            >
              {modalMode === 'edit' ? t('tasks.modal.saveAction') : t('tasks.modal.createAction')}
            </Button>
            <Button color="light" type="button" onClick={closeModal}>
              {t('tasks.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;

interface TaskBoardProps {
  tasks: Task[];
  projectMap: Map<string, Project>;
  memberMap: Map<string, OrganizationMember>;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canManage: boolean;
  canDelete: boolean;
  t: TFunction<'translation'>;
}

const TaskBoard = ({
  tasks,
  projectMap,
  memberMap,
  onStatusChange,
  onEdit,
  onDelete,
  canManage,
  canDelete,
  t,
}: TaskBoardProps): JSX.Element => {
  const columns: Array<{ id: TaskStatus; title: string }> = [
    { id: 'todo', title: t('taskStatus.todo') },
    { id: 'doing', title: t('taskStatus.doing') },
    { id: 'done', title: t('taskStatus.done') },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const tasksByStatus = useMemo(
    () =>
      columns.reduce<Record<TaskStatus, Task[]>>((acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      }, {} as Record<TaskStatus, Task[]>),
    [tasks],
  );

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const draggedTask = tasks.find((task) => task.id === active.id);
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => setActiveTaskId(event.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn key={column.id} columnId={column.id} title={column.title}>
            {tasksByStatus[column.id].map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                canManage={canManage}
                projectMap={projectMap}
                memberMap={memberMap}
                onEdit={onEdit}
                onDelete={onDelete}
                canDelete={canDelete}
                t={t}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <BoardTaskCard
            task={activeTask}
            projectMap={projectMap}
            memberMap={memberMap}
            onEdit={onEdit}
            onDelete={onDelete}
            canManage={canManage}
            canDelete={canDelete}
            t={t}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface KanbanColumnProps {
  columnId: TaskStatus;
  title: string;
  children: React.ReactNode;
}

const KanbanColumn = ({ columnId, title, children }: KanbanColumnProps): JSX.Element => {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[240px] flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4 transition ${
        isOver ? 'border-brand-400 bg-slate-900/95' : ''
      }`}
    >
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-200">{title}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

interface DraggableTaskProps {
  task: Task;
  canManage: boolean;
  projectMap: Map<string, Project>;
  memberMap: Map<string, OrganizationMember>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canDelete: boolean;
  t: TFunction<'translation'>;
}

const DraggableTask = ({
  task,
  canManage,
  projectMap,
  memberMap,
  onEdit,
  onDelete,
  canDelete,
  t,
}: DraggableTaskProps): JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canManage,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoardTaskCard
        task={task}
        projectMap={projectMap}
        memberMap={memberMap}
        onEdit={onEdit}
        onDelete={onDelete}
        canManage={canManage}
        canDelete={canDelete}
        t={t}
        isDragging={isDragging}
      />
    </div>
  );
};

interface BoardTaskCardProps {
  task: Task;
  projectMap: Map<string, Project>;
  memberMap: Map<string, OrganizationMember>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canManage: boolean;
  canDelete: boolean;
  t: TFunction<'translation'>;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const BoardTaskCard = ({
  task,
  projectMap,
  memberMap,
  onEdit,
  onDelete,
  canManage,
  canDelete,
  t,
  isDragging = false,
  isOverlay = false,
}: BoardTaskCardProps): JSX.Element => {
  const project = projectMap.get(task.projectId);
  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : undefined;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900/85 p-4 text-sm transition ${
        isDragging || isOverlay ? 'border-brand-400 shadow-lg shadow-brand-500/30' : ''
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-300">
        {project?.name ?? t('tasks.table.unknownProject')}
      </span>
      <div>
        <h3 className="text-base font-semibold text-slate-100">{task.title}</h3>
        {task.description && <p className="text-xs text-slate-400 line-clamp-3">{task.description}</p>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        <Badge
          color={task.priority === 'high' ? 'failure' : task.priority === 'medium' ? 'warning' : 'info'}
        >
          {t(`tasks.priority.${task.priority}`)}
        </Badge>
        <span>
          {t('tasks.fields.assignee')}:{' '}
          {assignee ? `${assignee.firstName} ${assignee.lastName}` : t('common.notSet')}
        </span>
        <span>
          {t('tasks.fields.dueDate')}:{' '}
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('common.notSet')}
        </span>
        {task.blocked && <Badge color="warning">{t('tasks.fields.blocked')}</Badge>}
      </div>
      {!isOverlay && (
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <Button size="xs" color="light" onClick={() => onEdit(task)}>
              {t('common.edit')}
            </Button>
          )}
          {canDelete && (
            <Button size="xs" color="failure" onClick={() => onDelete(task)}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

