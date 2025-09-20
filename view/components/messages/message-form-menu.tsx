import { ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdPoll } from 'react-icons/md';
import { CreateProposalForm } from '../proposals/create-proposal-form/create-proposal-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

interface Props {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  trigger: ReactNode;
  channelId?: string;
  isGeneralChannel?: boolean;
}

export const MessageFormMenu = ({
  trigger,
  showMenu,
  setShowMenu,
  channelId,
  isGeneralChannel,
}: Props) => {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const handleProposalFormNavigate = () => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }
  };

  return (
    <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className="bg-input/30 hover:bg-input/40 inline-flex size-11 cursor-pointer items-center justify-center rounded-full p-2 px-3 focus:outline-none [&_svg]:shrink-0">
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-52"
          align="start"
          alignOffset={-1}
          side="top"
          sideOffset={20}
        >
          <DialogTrigger asChild>
            <DropdownMenuItem className="text-md">
              <MdPoll className="text-foreground size-5" />
              {t('proposals.actions.create')}
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent
        className="overflow-y-auto pt-10 md:max-h-[90vh] md:w-xl md:pt-6"
        ref={dialogContentRef}
      >
        <DialogHeader>
          <DialogTitle>{t('proposals.headers.create')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center md:text-left">
          {t('proposals.descriptions.create')}
        </DialogDescription>

        <Separator className="mt-1" />

        <CreateProposalForm
          channelId={channelId}
          isGeneralChannel={isGeneralChannel}
          onSuccess={() => setShowProposalForm(false)}
          onNavigate={handleProposalFormNavigate}
        />
      </DialogContent>
    </Dialog>
  );
};
