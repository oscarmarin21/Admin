import { useState, useMemo } from 'react';
import { Button, Card, Table, Badge, Modal, TextInput, Select, Alert, Spinner, Label } from 'flowbite-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useOrganizationMembersQuery,
  useInvitationsQuery,
  useInviteMemberMutation,
  useCancelInvitationMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from '../hooks';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { OrganizationMember } from '../api/members.api';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'project_manager', 'member', 'stakeholder']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;
const roles: OrganizationMember['role'][] = ['admin', 'project_manager', 'member', 'stakeholder'];

const MembersPage = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: members, isLoading: isMembersLoading, isError: isMembersError } =
    useOrganizationMembersQuery();
  const {
    data: invitations,
    isLoading: isInvitationsLoading,
    isError: isInvitationsError,
  } = useInvitationsQuery();

  const inviteMemberMutation = useInviteMemberMutation();
  const cancelInvitationMutation = useCancelInvitationMutation();
  const updateMemberRoleMutation = useUpdateMemberRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const canManageMembers =
    currentUserRole === 'admin' || currentUserRole === 'project_manager';

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'member' },
  });

  const activeMembers = useMemo(
    () => (members ?? []).filter((member) => member.status === 'active'),
    [members],
  );

  const pendingInvitations = useMemo(
    () => (invitations ?? []).filter((invitation) => invitation.status === 'pending'),
    [invitations],
  );

  const onSubmitInvite = async (values: InviteFormValues) => {
    setInviteError(null);
    try {
      await inviteMemberMutation.mutateAsync(values);
      reset({ email: '', role: 'member' });
      setInviteModalOpen(false);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : t('common.unexpectedError'));
    }
  };

  const handleRoleChange = (userId: string, role: OrganizationMember['role']) => {
    updateMemberRoleMutation.mutate({ userId, role });
  };

  const handleRemoveMember = (userId: string) => {
    const confirmed = window.confirm(t('members.confirmRemove') ?? 'Remove member?');
    if (!confirmed) return;
    removeMemberMutation.mutate(userId);
  };

  const cancelInvitation = (invitationId: string) => {
    cancelInvitationMutation.mutate(invitationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">{t('members.title')}</h1>
        {canManageMembers && (
          <Button onClick={() => setInviteModalOpen(true)}>{t('members.actions.invite')}</Button>
        )}
      </div>

      {isMembersLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : isMembersError ? (
        <Alert color="failure">{t('common.failedToLoad')}</Alert>
      ) : (
        <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
          <div className="overflow-x-auto">
            <Table className="bg-transparent text-slate-100">
              <Table.Head className="bg-slate-800 text-slate-100">
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('members.table.name')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('members.table.email')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('members.table.role')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 uppercase tracking-wide">
                  {t('members.table.locale')}
                </Table.HeadCell>
                <Table.HeadCell className="bg-slate-800 text-right uppercase tracking-wide">
                  {t('members.table.actions')}
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-slate-700/60">
                {activeMembers.map((member) => (
                  <Table.Row key={member.id} className="border-slate-700 bg-transparent text-slate-100">
                    <Table.Cell>
                      {member.firstName} {member.lastName}
                    </Table.Cell>
                    <Table.Cell>{member.email}</Table.Cell>
                    <Table.Cell>
                      <Select
                        value={member.role}
                        onChange={(event) =>
                          handleRoleChange(member.id, event.target.value as OrganizationMember['role'])
                        }
                        className="w-40 border-slate-700 bg-slate-900 text-slate-100"
                        disabled={!canManageMembers || updateMemberRoleMutation.isPending}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {t(`members.roles.${role}`)}
                          </option>
                        ))}
                      </Select>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="info" className="capitalize">
                        {t(`settings.languageOptions.${member.locale}`)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="flex justify-end gap-2">
                      {canManageMembers && (
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleRemoveMember(member.id)}
                          isProcessing={removeMemberMutation.isPending}
                          disabled={member.id === currentUserId}
                        >
                          {t('members.actions.remove')}
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
                {activeMembers.length === 0 && (
                  <Table.Row className="border-slate-700 bg-transparent text-slate-200">
                    <Table.Cell colSpan={5} className="text-center">
                      {t('members.emptyState')}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>
      )}

      <Card className="border border-slate-700 bg-slate-800/80 text-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('members.invitations.title')}</h2>
          {isInvitationsLoading && <Spinner size="sm" />}
        </div>
        <div className="mt-4 space-y-3">
          {isInvitationsError ? (
            <Alert color="warning">{t('members.invitations.error')}</Alert>
          ) : pendingInvitations.length > 0 ? (
            pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-700/70 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{invitation.email}</p>
                  <p className="text-xs text-slate-400">
                    {t('members.invitationRole')}: {t(`members.roles.${invitation.role}`)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t('members.expires')}: {new Date(invitation.expiresAt).toLocaleString()}
                  </p>
                </div>
                {canManageMembers && (
                  <Button
                    color="light"
                    size="xs"
                    className="self-start"
                    onClick={() => cancelInvitation(invitation.id)}
                    isProcessing={cancelInvitationMutation.isPending}
                  >
                    {t('members.actions.cancelInvitation')}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-300">{t('members.invitations.empty')}</p>
          )}
        </div>
      </Card>

      <Modal show={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} dismissible>
        <Modal.Header>{t('members.inviteModal.title')}</Modal.Header>
        <form onSubmit={handleSubmit(onSubmitInvite)}>
          <Modal.Body className="space-y-4">
            {inviteError && <Alert color="failure">{inviteError}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="invite-email" value={t('members.fields.email')} />
              <TextInput id="invite-email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role" value={t('members.fields.role')} />
              <Select id="invite-role" {...register('role')}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {t(`members.roles.${role}`)}
                  </option>
                ))}
              </Select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              isProcessing={isSubmitting || inviteMemberMutation.isPending}
              className="border border-brand-500 bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-500"
            >
              {t('members.inviteModal.submit')}
            </Button>
            <Button color="light" type="button" onClick={() => setInviteModalOpen(false)}>
            {t('members.actions.close')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default MembersPage;

