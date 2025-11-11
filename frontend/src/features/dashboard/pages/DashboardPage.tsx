import { useMemo } from 'react';
import { Card, Badge, ListGroup } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { useProjectsQuery } from '../../projects/hooks';
import { useTasksQuery } from '../../tasks/hooks';
import { useMeetingsQuery } from '../../meetings/hooks';
import type { TaskListFilters } from '../../tasks/api/tasks.api';
import type { MeetingListFilters } from '../../meetings/api/meetings.api';

const DashboardPage = (): JSX.Element => {
  const { t } = useTranslation();
  const taskFilters = useMemo<TaskListFilters>(() => ({}), []);
  const meetingFilters = useMemo<MeetingListFilters>(() => ({}), []);

  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();
  const {
    data: tasks,
    isLoading: tasksLoading,
  } = useTasksQuery(taskFilters);
  const {
    data: meetings,
    isLoading: meetingsLoading,
  } = useMeetingsQuery(meetingFilters);

  const totalProjects = projects?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const taskBreakdown = (tasks ?? []).reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    { todo: 0, doing: 0, done: 0 },
  );
  const completionRate = totalTasks === 0 ? 0 : Math.round((taskBreakdown.done / totalTasks) * 100);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return (meetings ?? [])
      .filter((meeting) => new Date(meeting.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [meetings]);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <h2 className="text-lg font-semibold">{t('dashboard.metrics.projects.title')}</h2>
        {projectsLoading ? (
          <p className="text-sm text-slate-400">{t('dashboard.loading')}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{totalProjects}</p>
            <p className="text-sm text-slate-400">{t('dashboard.metrics.projects.caption')}</p>
          </div>
        )}
      </Card>

      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <h2 className="text-lg font-semibold">{t('dashboard.metrics.tasks.title')}</h2>
        {tasksLoading ? (
          <p className="text-sm text-slate-400">{t('dashboard.loading')}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-3xl font-bold text-white">{totalTasks}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge color="gray">{t('taskStatus.todo')}: {taskBreakdown.todo}</Badge>
              <Badge color="info">{t('taskStatus.doing')}: {taskBreakdown.doing}</Badge>
              <Badge color="success">{t('taskStatus.done')}: {taskBreakdown.done}</Badge>
            </div>
            <p className="text-sm text-slate-300">
              {t('dashboard.metrics.tasks.completion', { rate: completionRate })}
            </p>
            <p className="text-xs text-slate-500">{t('dashboard.metrics.tasks.caption')}</p>
          </div>
        )}
      </Card>

      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <h2 className="text-lg font-semibold">{t('dashboard.metrics.meetings.title')}</h2>
        {meetingsLoading ? (
          <p className="text-sm text-slate-400">{t('dashboard.loading')}</p>
        ) : upcomingMeetings.length === 0 ? (
          <p className="text-sm text-slate-300">{t('dashboard.metrics.meetings.empty')}</p>
        ) : (
          <ListGroup className="bg-transparent">
            {upcomingMeetings.map((meeting) => (
              <ListGroup.Item
                key={meeting.id}
                className="flex flex-col gap-1 border-slate-700 bg-slate-900/60 text-slate-100"
              >
                <span className="text-sm font-semibold">{meeting.summary}</span>
                <span className="text-xs text-slate-400">
                  {new Date(meeting.date).toLocaleString()} · {t(`meetings.types.${meeting.type}`)}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;

