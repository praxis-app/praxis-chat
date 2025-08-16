// TODO: Convert from MUI to Shadcn UI - leverage ui/box.tsx component

import { ArrowForwardIos } from '@mui/icons-material';
import { Box, SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ROLE_COLOR_OPTIONS } from '../../constants/role.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';

interface Props {
  color: string;
  label: string;
  onChange(color: string): void;
  sx?: SxProps;
}

export const ColorPicker = ({ label, color, onChange, sx }: Props) => {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const colorBoxSx: SxProps = {
    backgroundColor: color,
    borderRadius: 1,
    height: 24,
    marginRight: 1.5,
    width: 24,
  };

  const colorOptionSx = (colorOption: string): SxProps => ({
    backgroundColor: colorOption,
    width: 28,
    height: 28,
    borderRadius: 60,
    cursor: 'pointer',
    transition: 'transform 200ms cubic-bezier(.4,0,.2,1)',
    boxShadow:
      colorOption === color
        ? `${colorOption} 0px 0px 0px 15px inset, ${colorOption} 0px 0px 5px`
        : 'none',

    '&:hover': {
      transform: isDesktop ? 'scale(1.2)' : 'none',
    },
  });

  return (
    <Box sx={sx}>
      <Box
        display="flex"
        justifyContent="space-between"
        onClick={() => setOpen(!open)}
        sx={{ cursor: 'pointer', marginBottom: 0.25, userSelect: 'none' }}
      >
        <Typography color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Box display="flex">
          <Box sx={colorBoxSx}></Box>
          <Typography maxWidth="65px" marginRight={1.25}>
            {color}
          </Typography>
          <ArrowForwardIos
            fontSize="small"
            sx={{ transform: 'translateY(2px)' }}
          />
        </Box>
      </Box>

      {open && (
        <Box marginTop={2.5} marginBottom={1.5}>
          <Typography
            fontWeight={500}
            marginBottom={1.25}
            color="text.secondary"
          >
            {t('roles.form.pickColor')}
          </Typography>

          <Box display="flex" gap="14px" flexWrap="wrap" width="250px">
            {ROLE_COLOR_OPTIONS.map((colorOption) => (
              <Box
                key={colorOption}
                sx={colorOptionSx(colorOption)}
                onClick={() => onChange(colorOption)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
