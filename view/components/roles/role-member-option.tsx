import {
  Box,
  Checkbox,
  CardActionArea as MuiCardActionArea,
  SxProps,
  Typography,
  styled,
} from '@mui/material';
import { User } from '../../types/user.types';
import UserAvatar from '../users/user-avatar';

const ROLE_MEMBER_OPTION_STYLES: SxProps = {
  borderRadius: 2,
  display: 'flex',
  justifyContent: 'space-between',
  paddingLeft: 0.75,
  paddingRight: 0.25,
  paddingY: 0.75,
};

const CardActionArea = styled(MuiCardActionArea)(() => ({
  marginBottom: 2,
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Props {
  handleChange(): void;
  checked: boolean;
  user: User;
}

const RoleMemberOption = ({ handleChange, user, checked }: Props) => (
  <CardActionArea onClick={handleChange} sx={ROLE_MEMBER_OPTION_STYLES}>
    <Box display="flex">
      <UserAvatar
        userId={user.id}
        userName={user.name}
        sx={{ marginRight: 1.5 }}
      />
      <Typography sx={{ marginTop: 1, userSelect: 'none' }}>
        {user.displayName || user.name}
      </Typography>
    </Box>

    <Checkbox checked={checked} disableRipple />
  </CardActionArea>
);

export default RoleMemberOption;
