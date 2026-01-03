import { api } from '@/client/api-client';
import { ChannelFeed } from '@/components/channels/channel-feed';
import { ChannelTopNav } from '@/components/channels/channel-top-nav';
import { MessageForm } from '@/components/messages/message-form';
import { LeftNavDesktop } from '@/components/nav/left-nav-desktop';
import { MESSAGES_PAGE_SIZE } from '@/constants/message.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useMeQuery } from '@/hooks/use-me-query';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscription } from '@/hooks/use-subscription';
import { useAppStore } from '@/store/app.store';
import { ChannelRes, FeedItemRes, FeedQuery } from '@/types/channel.types';
import { ImageRes } from '@/types/image.types';
import { MessageRes } from '@/types/message.types';
import { PollRes } from '@/types/poll.types';
import { PubSubMessage } from '@/types/shared.types';
import { PubSubMessageType } from '@common/pub-sub/pub-sub.constants';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

interface NewMessagePayload {
  type: PubSubMessageType.MESSAGE;
  message: MessageRes;
}

interface NewPollPayload {
  type: PubSubMessageType.POLL;
  poll: PollRes;
}

interface ImageMessagePayload {
  type: PubSubMessageType.IMAGE;
  isPlaceholder: boolean;
  messageId: string;
  imageId: string;
}

interface Props {
  channel?: ChannelRes;
}

export const ChannelView = ({ channel }: Props) => {
  const { isLoggedIn, accessToken, inviteToken } = useAppStore();
  const [isLastPage, setIsLastPage] = useState(false);

  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();

  const { serverId } = useServerData();
  const feedBoxRef = useRef<HTMLDivElement>(null);

  const feedQueryKey = ['servers', serverId, 'channels', channel?.id, 'feed'];

  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery({
    enabled: isLoggedIn,
  });

  const { data: feedData, fetchNextPage } = useInfiniteQuery({
    queryKey: feedQueryKey,
    queryFn: async ({ pageParam }) => {
      if (!serverId || !channel?.id) {
        throw new Error('Server ID and channel ID are required');
      }
      const result = await api.getChannelFeed(
        serverId,
        channel.id,
        pageParam,
        MESSAGES_PAGE_SIZE,
        inviteToken,
      );
      const isLast = result.feed.length === 0;
      if (isLast) {
        setIsLastPage(true);
      }
      return result;
    },
    getNextPageParam: (_lastPage, pages) => {
      return pages.flatMap((page) => page.feed).length;
    },
    initialPageParam: 0,
    enabled:
      !!serverId && !!channel?.id && (isMeSuccess || isMeError || !accessToken),
  });

  // Listen for new messages
  useSubscription(`new-message-${channel?.id}-${meData?.user.id}`, {
    onMessage: (event) => {
      const { body }: PubSubMessage<NewMessagePayload | ImageMessagePayload> =
        JSON.parse(event.data);
      if (!body) {
        return;
      }

      // Update cache with new message or update existing bot message
      if (body.type === PubSubMessageType.MESSAGE) {
        const messagePayload = body.message;

        const preserveImageSrc = (
          existingImages?: ImageRes[],
          incomingImages?: ImageRes[],
        ) => {
          if (!incomingImages?.length || !existingImages?.length) {
            return incomingImages;
          }

          const existingMap = new Map(
            existingImages.map((img) => [img.id, img]),
          );

          return incomingImages.map((image) => {
            const existing = existingMap.get(image.id);
            if (existing?.src && !image.src) {
              return { ...image, src: existing.src };
            }
            return image;
          });
        };

        const buildFeedItem = (existing?: FeedItemRes): FeedItemRes => ({
          ...messagePayload,
          images: preserveImageSrc(existing?.images, messagePayload.images),
          type: 'message',
        });

        queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
          if (!oldData) {
            return {
              pages: [{ feed: [buildFeedItem()] }],
              pageParams: [0],
            };
          }
          const pages = oldData.pages.map((page, index) => {
            // Check if message already exists (for bot message updates)
            const existingIndex = page.feed.findIndex(
              (item) =>
                item.type === 'message' && item.id === messagePayload.id,
            );

            if (existingIndex !== -1) {
              // Update existing message (bot message with command result)
              const updatedFeed = [...page.feed];
              const existingMessage = page.feed[existingIndex];
              updatedFeed[existingIndex] = buildFeedItem(existingMessage);

              // Sort by createdAt descending (newest first)
              updatedFeed.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
              return { feed: updatedFeed };
            }

            // Add new message to first page only
            if (index === 0) {
              const updatedFeed = [buildFeedItem(), ...page.feed];
              // Sort by createdAt descending (newest first)
              updatedFeed.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
              return { feed: updatedFeed };
            }
            return page;
          });
          return { pages, pageParams: oldData.pageParams };
        });
      }

      // Update cache with image status once uploaded
      if (body.type === PubSubMessageType.IMAGE) {
        queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
          if (!oldData) {
            return { pages: [], pageParams: [] };
          }

          const pages = oldData.pages.map((page) => {
            const feed = page.feed.map((item) => {
              if (item.type !== 'message') {
                return item;
              }
              if (item.id !== body.messageId || !item.images) {
                return item;
              }
              const images = item.images.map((image) =>
                image.id === body.imageId
                  ? { ...image, isPlaceholder: false }
                  : image,
              );
              return { ...item, images } as FeedItemRes;
            });
            return { feed };
          });

          return { pages, pageParams: oldData.pageParams };
        });
      }

      scrollToBottom();
    },
    enabled: !!meData && !!channel && !!channel?.id && !!serverId,
  });

  // Listen for new polls
  useSubscription(`new-poll-${channel?.id}-${meData?.user.id}`, {
    onMessage: (event) => {
      const { body }: PubSubMessage<NewPollPayload> = JSON.parse(event.data);
      if (!body) {
        return;
      }
      if (body.type === PubSubMessageType.POLL) {
        const newFeedItem: FeedItemRes = {
          ...(body.poll as FeedItemRes & { type: 'poll' }),
          type: 'poll',
        };
        queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
          if (!oldData) {
            return { pages: [{ feed: [newFeedItem] }], pageParams: [0] };
          }
          const pages = oldData.pages.map((page, index) => {
            if (index === 0) {
              const exists = page.feed.some(
                (fi) => fi.type === 'poll' && fi.id === newFeedItem.id,
              );
              if (exists) {
                return page;
              }
              const updatedFeed = [newFeedItem, ...page.feed];
              // Sort by createdAt descending (newest first)
              updatedFeed.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
              return { feed: updatedFeed };
            }
            return page;
          });
          return { pages, pageParams: oldData.pageParams };
        });
      }
      scrollToBottom();
    },
    enabled: !!meData && !!channel && !!channel?.id && !!serverId,
  });

  // Reset isLastPage when switching channels
  useEffect(() => {
    if (channel?.id) {
      setIsLastPage(false);
    }
  }, [channel?.id]);

  const scrollToBottom = () => {
    if (feedBoxRef.current && feedBoxRef.current.scrollTop >= -200) {
      feedBoxRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex">
      {isDesktop && <LeftNavDesktop me={meData?.user} />}

      <div className="flex flex-1 flex-col">
        <ChannelTopNav channel={channel} />

        <ChannelFeed
          channel={channel}
          feedBoxRef={feedBoxRef}
          onLoadMore={fetchNextPage}
          feed={feedData?.pages.flatMap((page) => page.feed) || []}
          isLastPage={isLastPage}
        />

        <MessageForm channelId={channel?.id} onSend={scrollToBottom} />
      </div>
    </div>
  );
};
