import { render, screen, waitFor } from '@testing-library/react';
import { UserAvatar } from '../user-avatar';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock the LazyLoadImage component to control its behavior
vi.mock('../../images/lazy-load-image', () => ({
  LazyLoadImage: ({ src, imageId, alt, onLoad, onLoadingStatusChange }: any) => {
    // Simulate image loading behavior
    React.useEffect(() => {
      if (src || imageId) {
        // Notify that loading has started
        onLoadingStatusChange?.('loading');
        
        // Simulate successful load after a short delay
        setTimeout(() => {
          onLoad?.({} as any);
          onLoadingStatusChange?.('loaded');
        }, 100);
      } else {
        onLoadingStatusChange?.('idle');
      }
    }, [src, imageId, onLoad, onLoadingStatusChange]);

    return (
      <img
        src={src || 'mocked-image-src'}
        alt={alt}
        data-testid="lazy-load-image"
      />
    );
  },
}));

describe('UserAvatar', () => {
  it('should show fallback initially and then show image when loaded', async () => {
    render(
      <UserAvatar
        name="John Doe"
        imageSrc="https://example.com/avatar.jpg"
        imageId="avatar-123"
      />
    );

    // Initially should show fallback
    expect(screen.getByText('J')).toBeInTheDocument();
    const imageElement = screen.queryByTestId('lazy-load-image');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveClass('opacity-0');

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    // After image loads, fallback should be hidden and image should be visible
    await waitFor(() => {
      expect(screen.queryByText('J')).not.toBeInTheDocument();
      const imageElement = screen.getByTestId('lazy-load-image');
      expect(imageElement).toHaveClass('opacity-100');
    });
  });

  it('should show fallback when no image source is provided', () => {
    render(<UserAvatar name="John Doe" />);

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.queryByTestId('lazy-load-image')).not.toBeInTheDocument();
  });

  it('should show fallback when image fails to load', async () => {
    // Mock LazyLoadImage to simulate error
    vi.doMock('../../images/lazy-load-image', () => ({
      LazyLoadImage: ({ src, imageId, onError }: any) => {
        React.useEffect(() => {
          if (src || imageId) {
            setTimeout(() => {
              onError?.();
            }, 100);
          }
        }, [src, imageId, onError]);

        return null; // Don't render anything on error
      },
    }));

    render(
      <UserAvatar
        name="John Doe"
        imageSrc="https://example.com/broken-avatar.jpg"
      />
    );

    // Should show fallback initially
    expect(screen.getByText('J')).toBeInTheDocument();

    // Should still show fallback after error
    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  it('should not show both image and fallback at the same time', async () => {
    render(
      <UserAvatar
        name="John Doe"
        imageSrc="https://example.com/avatar.jpg"
      />
    );

    // Initially only fallback should be visible
    expect(screen.getByText('J')).toBeInTheDocument();
    const imageElement = screen.queryByTestId('lazy-load-image');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveClass('opacity-0');

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    // After image loads, only image should be visible (fallback should be hidden)
    await waitFor(() => {
      expect(screen.queryByText('J')).not.toBeInTheDocument();
      const imageElement = screen.getByTestId('lazy-load-image');
      expect(imageElement).toHaveClass('opacity-100');
    });

    // Verify only one is visible at any time
    const fallbackVisible = screen.queryByText('J') !== null;
    const finalImageElement = screen.getByTestId('lazy-load-image');
    const imageVisible = finalImageElement && finalImageElement.classList.contains('opacity-100');
    
    expect(fallbackVisible && imageVisible).toBe(false);
  });
});