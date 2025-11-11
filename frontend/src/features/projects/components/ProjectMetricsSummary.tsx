import { Card, Spinner, Tooltip } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { useProjectMetricsQuery } from '../../metrics/hooks';

interface Props {
  projectId: string;
  variant?: 'card' | 'inline';
}

export const ProjectMetricsSummary = ({ projectId, variant = 'inline' }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useProjectMetricsQuery(projectId);

  if (variant === 'card') {
    return (
      <Card className="border border-slate-700 bg-slate-900/70 text-slate-100">
        <h3 className="text-lg font-semibold">{t('metrics.project.title')}</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-slate-400">{t('metrics.project.error')}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{data.completionRate}%</p>
            <p className="text-xs text-slate-400">{t('metrics.project.completionCaption')}</p>
            <dl className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <dt className="text-slate-400">{t('metrics.project.total')}</dt>
                <dd className="font-semibold text-white">{data.totalTasks}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t('metrics.project.completed')}</dt>
                <dd className="font-semibold text-white">{data.completedTasks}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t('metrics.project.blocked')}</dt>
                <dd className="font-semibold text-white">{data.blockedTasks}</dd>
              </div>
            </dl>
          </div>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Spinner size="sm" />
        <span>{t('metrics.project.loading')}</span>
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-xs text-slate-400">{t('metrics.project.error')}</p>;
  }

  return (
    <Tooltip content={t('metrics.project.completionTooltip')} placement="bottom">
      <p className="text-xs text-slate-300">
        {t('metrics.project.completionLabel', { rate: data.completionRate })}
      </p>
    </Tooltip>
  );
};


