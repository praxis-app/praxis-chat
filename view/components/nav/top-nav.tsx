import { BrowserEvents, KeyCodes } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useAppStore } from '@/store/app.store';
import { ReactNode, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft } from 'react-icons/lu';
import { MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServerData } from '../../hooks/use-server-data';
import { Button } from '../ui/button';
import { NavSheet } from './nav-sheet';

interface Props {
  header?: string;
  onBackClick?: () => void;
  backBtnIcon?: ReactNode;
  goBackOnEscape?: boolean;
}

export const TopNav = ({
  header,
  onBackClick,
  backBtnIcon,
  goBackOnEscape = false,
}: Props) => {
  const { isNavSheetOpen, setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const { serverPath } = useServerData();

  const handleBackClick = useCallback(
    (isEscapeKey = false) => {
      if (onBackClick) {
        onBackClick();
        return;
      }
      if (isDesktop) {
        navigate(serverPath);
        return;
      }
      if (isEscapeKey) {
        return;
      }
      setIsNavSheetOpen(true);
    },
    [isDesktop, navigate, onBackClick, serverPath, setIsNavSheetOpen],
  );

  // Handle escape key to go back or open nav sheet
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KeyCodes.Escape && goBackOnEscape) {
        if (isNavSheetOpen) {
          setIsNavSheetOpen(false);
        } else {
          handleBackClick(true);
        }
      }
    };
    window.addEventListener(BrowserEvents.Keydown, handleKeyDown);
    return () => {
      window.removeEventListener(BrowserEvents.Keydown, handleKeyDown);
    };
  }, [handleBackClick, isNavSheetOpen, setIsNavSheetOpen, goBackOnEscape]);

  const renderBackBtn = () => {
    const renderBtn = () => (
      <Button variant="ghost" size="icon" onClick={() => handleBackClick()}>
        {backBtnIcon || <LuArrowLeft className="size-6" />}
      </Button>
    );

    if (!isDesktop && !onBackClick) {
      return <NavSheet trigger={renderBtn()} />;
    }

    return renderBtn();
  };

  return (
    <header className="flex h-[55px] items-center justify-between border-b border-[--color-border] px-2">
      <div className="mr-1 flex min-w-0 flex-1 items-center gap-2.5">
        {renderBackBtn()}

        <div className="min-w-0 flex-1 truncate text-[1.05rem] font-medium select-none">
          {header}
        </div>
      </div>

      <Button
        onClick={() => toast(t('prompts.inDev'))}
        variant="ghost"
        size="icon"
      >
        <MdSearch className="size-6" />
      </Button>
    </header>
  );
};
