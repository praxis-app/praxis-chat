import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { ROLE_COLOR_OPTIONS } from '../../constants/role.constants';

interface Props {
  color: string;
  label: string;
  onChange(color: string): void;
  className?: string;
}

export const ColorPicker = ({ label, color, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground group flex w-full cursor-pointer items-center justify-between rounded-md px-1 py-1.5 text-sm font-medium"
      >
        <span>{label}</span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block size-6 rounded"
            style={{ backgroundColor: color }}
          />
          <span className="text-foreground/80 max-w-24 truncate">{color}</span>
          <MdChevronRight className="translate-y-[1px]" />
        </span>
      </button>

      {open && (
        <div className="mt-3 mb-2">
          <div className="text-muted-foreground mb-3 text-sm font-medium">
            {t('roles.form.pickColor')}
          </div>
          <div className="flex w-[250px] flex-wrap gap-[14px]">
            {ROLE_COLOR_OPTIONS.map((colorOption) => (
              <div
                key={colorOption}
                role="button"
                aria-label={`Pick ${colorOption}`}
                tabIndex={0}
                onClick={() => onChange(colorOption)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onChange(colorOption);
                }}
                className="ring-offset-background size-7 rounded-full transition-transform outline-none"
                style={{
                  backgroundColor: colorOption,
                  boxShadow:
                    colorOption === color
                      ? `${colorOption} 0px 0px 0px 15px inset, ${colorOption} 0px 0px 5px`
                      : 'none',
                  transform: isDesktop ? undefined : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isDesktop) return;
                  (e.currentTarget as HTMLDivElement).style.transform =
                    'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  if (!isDesktop) return;
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
