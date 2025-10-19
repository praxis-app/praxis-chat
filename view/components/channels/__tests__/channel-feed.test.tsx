import { useAppStore } from '@/store/app.store';
import { customRender as render } from '@/test/lib/custom-render';
import { FeedItemRes } from '@/types/channel.types';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ChannelFeed } from '../channel-feed';

vi.mock('@/store/app.store');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/use-in-view', () => ({
  useInView: vi.fn(() => ({
    inView: false,
    setInView: vi.fn(),
    viewed: false,
    setViewed: vi.fn(),
  })),
}));
vi.mock('@/hooks/use-scroll-direction', () => ({
  useScrollDirection: vi.fn(() => 'down'),
}));
vi.mock('@/hooks/use-sign-up-data', () => ({
  useSignUpData: vi.fn(() => ({
    signUpPath: '/sign-up',
    showSignUp: true,
  })),
}));
vi.mock('@/lib/shared.utils', () => ({
  throttle: vi.fn((fn) => fn),
  debounce: vi.fn((fn) => Object.assign(fn, { clear: vi.fn() })),
  cn: vi.fn((...args) => args.join(' ')),
  t: vi.fn((key) => key),
}));
vi.mock('../invites/welcome-message', () => ({
  WelcomeMessage: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="welcome-message">
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));
vi.mock('../../messages/bot-message', () => ({
  BotMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="welcome-message">{children}</div>
  ),
}));
vi.mock('@/components/shared/formatted-text', () => ({
  FormattedText: ({ text }: { text: string }) => <div>{text}</div>,
}));

describe('ChannelFeed', () => {
  const mockOnLoadMore = vi.fn();
  const mockFeedBoxRef = { current: document.createElement('div') };
  const mockFeed: FeedItemRes[] = [
    {
      type: 'message',
      id: '1',
      body: 'Hello world',
      user: {
        id: 'user1',
        name: 'John Doe',
        profilePicture: null,
      },
      userId: 'user1',
      isBot: false,
      commandStatus: null,
      createdAt: '2023-12-01T12:00:00Z',
    },
    {
      type: 'message',
      id: '2',
      body: 'Another message',
      user: {
        id: 'user2',
        name: 'Jane Smith',
        profilePicture: null,
      },
      userId: 'user2',
      isBot: false,
      commandStatus: null,
      createdAt: '2023-12-01T12:05:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAppStore as unknown as Mock).mockClear();
  });

  it('should render messages when they are provided', () => {
    (useAppStore as unknown as Mock).mockReturnValue({
      isLoggedIn: true,
      isAppLoading: false,
    });

    render(
      <ChannelFeed
        feed={mockFeed}
        feedBoxRef={mockFeedBoxRef}
        onLoadMore={mockOnLoadMore}
        isLastPage={false}
      />,
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Another message')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
  });

  it('should render the welcome message when user is not logged in and there are no messages', () => {
    (useAppStore as unknown as Mock).mockReturnValue({
      isLoggedIn: false,
      isAppLoading: false,
    });

    render(
      <ChannelFeed
        feed={[]}
        feedBoxRef={mockFeedBoxRef}
        onLoadMore={mockOnLoadMore}
        isLastPage={false}
      />,
    );

    expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
  });
});
