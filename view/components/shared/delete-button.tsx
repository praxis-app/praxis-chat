// TODO: Move hex color values to theme

import { ButtonProps, Button as MuiButton, styled } from '@mui/material';

const Button = styled(MuiButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  color: '#f44336',

  ...theme.applyStyles('light', {
    backgroundColor: theme.palette.background.secondary,
  }),
}));

const DeleteButton = ({ children, ...buttonProps }: ButtonProps) => (
  <Button variant="text" fullWidth {...buttonProps}>
    {children}
  </Button>
);

export default DeleteButton;
