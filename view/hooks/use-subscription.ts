import { LocalStorageKeys } from '@/constants/shared.constants';
import { getWebSocketURL } from '@/lib/shared.utils';
import { useAuthSore } from '@/store/auth.store';
import { PubSubMessage, SubscriptionOptions } from '@/types/shared.types';
import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

export const useSubscription = (
  channel: string,
  options?: SubscriptionOptions,
) => {
  const isLoggedIn = useAuthSore((state) => state.isLoggedIn);
  const isEnabled = options?.enabled ?? true;

  const getOptions = () => {
    if (!options || !options.onMessage) {
      return options;
    }
    const onMessage = (event: MessageEvent) => {
      const message: PubSubMessage = JSON.parse(event.data);
      // Ignore messages from other channels
      if (message.channel !== channel || !options.onMessage) {
        return;
      }
      // Log errors from the server
      if (message.type === 'RESPONSE' && message.error) {
        console.error(message.error);
        return;
      }
      options.onMessage(event);
    };
    return { ...options, onMessage };
  };

  const { sendMessage, readyState, ...rest } = useWebSocket(getWebSocketURL(), {
    // Ensure multiple channels can be subscribed to in
    // the same component with `share` set to `true`
    share: true,
    shouldReconnect: () => isLoggedIn,
    ...getOptions(),
  });

  useEffect(() => {
    const token = localStorage.getItem(LocalStorageKeys.AccessToken);
    if (!isLoggedIn || !token) {
      return;
    }

    if (isEnabled && readyState === WebSocket.OPEN) {
      const message: PubSubMessage = {
        type: 'REQUEST',
        request: 'SUBSCRIBE',
        channel,
        token,
      };
      sendMessage(JSON.stringify(message));
    }
  }, [channel, isEnabled, readyState, sendMessage, isLoggedIn]);

  return { sendMessage, ...rest };
};
