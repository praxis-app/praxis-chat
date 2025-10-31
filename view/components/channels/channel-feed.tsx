import { LocalStorageKeys } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useInView } from '@/hooks/use-in-view';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { debounce, throttle } from '@/lib/shared.utils';
import { useAppStore } from '@/store/app.store';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import {
  RefObject,
  UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { WelcomeMessage } from '../invites/welcome-message';
import { BotMessage } from '../messages/bot-message';
import { Message } from '../messages/message';
import { InlinePoll } from '../polls/inline-poll';

const LOAD_MORE_THROTTLE_MS = 1500;
const IN_VIEW_THRESHOLD = 50;

interface Props {
  channel?: ChannelRes;
  feed: FeedItemRes[];
  feedBoxRef: RefObject<HTMLDivElement>;
  isLastPage: boolean;
  onLoadMore: () => void;
}

export const ChannelFeed = ({
  channel,
  feed,
  feedBoxRef,
  isLastPage,
  onLoadMore,
}: Props) => {
  const { isAppLoading } = useAppStore((state) => state);
  const { me, isAnon, isLoggedIn } = useAuthData();

  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollDirection = useScrollDirection(feedBoxRef);
  const feedTopRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  // Create throttled function once and reuse it
  const throttledOnLoadMore = useRef(
    throttle(() => {
      onLoadMoreRef.current();
    }, LOAD_MORE_THROTTLE_MS),
  ).current;

  const { setViewed } = useInView(feedTopRef, `${IN_VIEW_THRESHOLD}px`, () => {
    if (scrollPosition < -IN_VIEW_THRESHOLD && scrollDirection === 'up') {
      setViewed(false);

      if (!isLastPage) {
        throttledOnLoadMore();
      }
    }
  });

  // Debounced scroll handler to improve performance
  const debouncedSetScrollPosition = useMemo(
    () => debounce((position: number) => setScrollPosition(position), 16),
    [setScrollPosition],
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    debouncedSetScrollPosition(target.scrollTop);
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSetScrollPosition.clear();
    };
  }, [debouncedSetScrollPosition]);

  useEffect(() => {
    if (
      !isAppLoading &&
      (!isLoggedIn || isAnon) &&
      !localStorage.getItem(LocalStorageKeys.HideWelcomeMessage)
    ) {
      setShowWelcomeMessage(true);
    }
  }, [isLoggedIn, isAppLoading, isAnon]);

  return (
    <div
      ref={feedBoxRef}
      className="flex flex-1 flex-col-reverse gap-4.5 overflow-y-scroll px-3.5 pt-2.5 pb-4"
      onScroll={handleScroll}
    >
      {showWelcomeMessage && (
        <WelcomeMessage onDismiss={() => setShowWelcomeMessage(false)} />
      )}

      {feed.map((item) => {
        if (item.type === 'message') {
          if (item.bot) {
            return <BotMessage key={`message-${item.id}`} message={item} />;
          }
          return (
            <Message
              key={`message-${item.id}`}
              channelId={channel?.id}
              message={item}
              me={me}
            />
          );
        }
        if (!channel) {
          return null;
        }
        return (
          <InlinePoll
            key={`poll-${item.id}`}
            poll={item}
            channel={channel}
            me={me}
          />
        );
      })}

      {/* Bottom is top due to `column-reverse` */}
      <div ref={feedTopRef} className="pb-0.5" />
    </div>
  );
};
