// TODO: Add remaining layout and functionality - below is a WIP

import { TopNav } from '@/components/nav/top-nav';
import { NavigationPaths } from '@/constants/shared.constants';
import { useNavigate } from 'react-router-dom';

export const EditServerPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <TopNav
        header={'TODO: Show server name here'}
        onBackClick={() => navigate(NavigationPaths.ManageServers)}
      />
    </>
  );
};
