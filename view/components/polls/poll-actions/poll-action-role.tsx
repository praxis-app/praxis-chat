import { api } from '@/client/api-client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PERMISSION_KEYS } from '@/constants/server-role.constants';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useServerData } from '@/hooks/use-server-data';
import {
  PollActionRes,
  PollActionServerRoleMemberRes,
} from '@/types/poll-action.types';
import { PermissionKeys } from '@/types/role.types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ACCORDION_ITEM_VALUE = 'role-change-proposal';

interface Props {
  action: PollActionRes;
}

export const PollActionRole = ({ action }: Props) => {
  const [accordionValue, setAccordionValue] = useState<string | undefined>();

  const { serverId } = useServerData();

  const { data: serverRoleData, isLoading: isServerRoleLoading } = useQuery({
    queryKey: ['servers', serverId, 'roles', action.serverRole?.serverRoleId],
    queryFn: () => {
      if (!action.serverRole?.serverRoleId || !serverId) {
        throw new Error('Server role ID is required');
      }
      return api.getServerRole(serverId, action.serverRole.serverRoleId);
    },
    enabled:
      accordionValue === ACCORDION_ITEM_VALUE &&
      !!action.serverRole?.serverRoleId &&
      !!serverId,
  });

  const permissionChanges = PERMISSION_KEYS.reduce<
    {
      name: PermissionKeys;
      value: boolean;
    }[]
  >((result, name) => {
    if (name === 'manageChannels') {
      const match = action.serverRole?.permissions?.find(
        (p) => p.subject === 'Channel' && p.action.includes('manage'),
      );
      if (match) {
        result.push({
          value: match.changeType === 'add',
          name,
        });
      }
    }
    if (name === 'manageSettings') {
      const match = action.serverRole?.permissions?.find(
        (p) => p.subject === 'ServerConfig' && p.action.includes('manage'),
      );
      if (match) {
        result.push({
          value: match.changeType === 'add',
          name,
        });
      }
    }
    if (name === 'manageRoles') {
      const match = action.serverRole?.permissions?.find(
        (p) => p.subject === 'ServerRole' && p.action.includes('manage'),
      );
      if (match) {
        result.push({
          value: match.changeType === 'add',
          name,
        });
      }
    }
    if (name === 'createInvites') {
      const readMatch = action.serverRole?.permissions?.find(
        (p) => p.subject === 'Invite' && p.action.includes('read'),
      );
      const createMatch = action.serverRole?.permissions?.find(
        (p) => p.subject === 'Invite' && p.action.includes('create'),
      );
      if (readMatch && createMatch) {
        result.push({
          value:
            readMatch.changeType === 'add' && createMatch.changeType === 'add',
          name,
        });
      }
    }
    if (name === 'manageInvites') {
      const match = action.serverRole?.permissions?.find(
        (p) => p.subject === 'Invite' && p.action.includes('manage'),
      );
      if (match) {
        result.push({
          value: match.changeType === 'add',
          name,
        });
      }
    }
    return result;
  }, []);

  const { t } = useTranslation();

  const getAccordionLabel = () => {
    if (action.actionType === 'change-role') {
      return t('polls.labels.roleChangeProposal');
    }
    return t('polls.labels.roleProposal');
  };

  const getPermissionName = (name: PermissionKeys | '') => {
    if (!name) {
      return '';
    }
    return t(`permissions.names.${name}`);
  };

  if (!action.serverRole) {
    return null;
  }

  return (
    <Accordion
      type="single"
      defaultValue={accordionValue}
      onValueChange={setAccordionValue}
      className="mb-2.5 rounded-md border px-2.5"
      collapsible
    >
      <AccordionItem value={ACCORDION_ITEM_VALUE}>
        <AccordionTrigger className="cursor-pointer hover:no-underline">
          {getAccordionLabel()}
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {isServerRoleLoading && (
            <div className="text-muted-foreground p-2 text-sm">
              {t('actions.loading')}
            </div>
          )}

          {serverRoleData && (
            <div className="space-y-3">
              <div className="text-sm font-medium">
                {t('polls.headers.selectedRole')}
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: serverRoleData.serverRole.color }}
                />
                <span className="font-medium">
                  {serverRoleData.serverRole.name}
                </span>
                <span className="text-muted-foreground text-sm">
                  {MIDDOT_WITH_SPACES}
                </span>
                <p className="text-muted-foreground text-sm">
                  {t('roles.labels.membersCount', {
                    count: serverRoleData.serverRole.memberCount,
                  })}
                </p>
              </div>
            </div>
          )}

          {!!action.serverRole.name && (
            <div className="space-y-3">
              <Separator className="mb-4" />
              <div className="text-sm font-medium">
                {t('polls.labels.roleNameChange')}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-sm">
                  {action.serverRole.prevName}
                </span>
                <span className="text-sm">→</span>
                <span className="text-sm font-medium">
                  {action.serverRole.name}
                </span>
              </div>
            </div>
          )}

          {!!action.serverRole.color && (
            <div className="space-y-3">
              <Separator className="mb-4" />
              <div className="text-sm font-medium">
                {t('polls.labels.roleColorChange')}
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: action.serverRole.prevColor }}
                />
                <span className="text-muted-foreground text-sm">
                  {action.serverRole.prevColor}
                </span>
                <span className="text-sm">→</span>
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: action.serverRole.color }}
                />
                <span className="text-sm font-medium">
                  {action.serverRole.color}
                </span>
              </div>
            </div>
          )}

          {permissionChanges.length > 0 && (
            <div className="space-y-3">
              <Separator className="mb-4" />
              <div className="text-sm font-medium">
                {t('polls.headers.permissions')}
              </div>
              <div className="space-y-2">
                {permissionChanges.map((permission) => (
                  <div
                    key={permission.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {getPermissionName(permission.name as PermissionKeys)}
                    </span>
                    <Badge
                      variant={permission.value ? 'default' : 'destructive'}
                      className="w-17"
                    >
                      {permission.value
                        ? t('actions.enabled')
                        : t('actions.disabled')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {action.serverRole.members &&
            action.serverRole.members.length > 0 && (
              <div className="space-y-3">
                <Separator className="mb-4" />
                <div className="text-sm font-medium">
                  {t('polls.headers.memberChanges')}
                </div>
                <div>
                  <div className="space-y-2">
                    {action.serverRole.members.map(
                      (member: PollActionServerRoleMemberRes) => (
                        <div
                          key={member.user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="max-w-[150px] truncate text-sm md:max-w-[220px]">
                            {member.user.displayName || member.user.name}
                          </span>
                          <Badge
                            variant={
                              member.changeType === 'add'
                                ? 'default'
                                : 'destructive'
                            }
                            className="w-16"
                          >
                            {member.changeType === 'add'
                              ? t('actions.add')
                              : t('actions.remove')}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
