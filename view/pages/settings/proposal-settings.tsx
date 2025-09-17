import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ProposalSettingsForm } from '@/components/settings/proposal-settings-form';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ProposalSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isPending, error } = useQuery({
    queryKey: ['server-configs'],
    queryFn: () => api.getServerConfig(),
  });

  if (error) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (isPending) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.proposals')}
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />

      <Container>
        <Card>
          <CardContent>
            <ProposalSettingsForm serverConfig={data.serverConfig} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
