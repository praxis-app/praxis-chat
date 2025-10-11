import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock TypeORM to prevent entity loading issues
vi.mock('typeorm', async () => {
  const actual = await vi.importActual('typeorm');
  return {
    ...actual,
    Entity: () => vi.fn(),
    Column: () => vi.fn(),
    PrimaryGeneratedColumn: () => vi.fn(),
    CreateDateColumn: () => vi.fn(),
    UpdateDateColumn: () => vi.fn(),
    ManyToOne: () => vi.fn(),
    OneToMany: () => vi.fn(),
    JoinColumn: () => vi.fn(),
    Unique: () => vi.fn(),
  };
});

// Mock all dependencies before importing the controller
vi.mock('../../images/images.service');
vi.mock('../messages.service');
vi.mock('../../invites/invites.service');
vi.mock('../../channels/channels.service');
vi.mock('fs');
vi.mock('../../images/images.utils');

// Import after mocks
import * as fs from 'fs';
import * as imagesService from '../../images/images.service';
import { getUploadsPath } from '../../images/images.utils';
import * as messagesController from '../messages.controller';

describe('Message Images Authorization', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(getUploadsPath).mockReturnValue('/uploads');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    mockRequest = {
      params: {
        channelId: 'channel-1',
        messageId: 'message-1',
        imageId: 'image-1',
      },
    };

    mockResponse = {
      locals: {
        user: {
          id: 'user-1',
          name: 'Test User',
        },
      },
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      sendFile: vi.fn(),
    };
  });

  describe('getMessageImage', () => {
    it('should successfully return image file when image exists and belongs to the specified message', async () => {
      const mockImage = {
        id: 'image-1',
        messageId: 'message-1',
        filename: 'test.jpg',
      };

      vi.mocked(imagesService.getImage).mockResolvedValue(mockImage as any);

      await messagesController.getMessageImage(mockRequest, mockResponse);

      expect(imagesService.getImage).toHaveBeenCalledWith('image-1');
      expect(mockResponse.sendFile).toHaveBeenCalledWith('test.jpg', {
        root: '/uploads',
      });
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should return 404 when image record does not exist in database', async () => {
      vi.mocked(imagesService.getImage).mockResolvedValue(null);

      await messagesController.getMessageImage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Image not found');
      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should return 404 when image belongs to a different message than requested', async () => {
      const mockImage = {
        id: 'image-1',
        messageId: 'different-message',
        filename: 'test.jpg',
      };

      vi.mocked(imagesService.getImage).mockResolvedValue(mockImage as any);

      await messagesController.getMessageImage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Image not found');
      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should return 404 when image record exists but has no filename (not yet uploaded)', async () => {
      const mockImage = {
        id: 'image-1',
        messageId: 'message-1',
        filename: null,
      };

      vi.mocked(imagesService.getImage).mockResolvedValue(mockImage as any);

      await messagesController.getMessageImage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'Image has not been uploaded yet',
      );
      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should return 404 when image record exists but physical file is missing from filesystem', async () => {
      const mockImage = {
        id: 'image-1',
        messageId: 'message-1',
        filename: 'test.jpg',
      };

      vi.mocked(imagesService.getImage).mockResolvedValue(mockImage as any);
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await messagesController.getMessageImage(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Image file not found');
      expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });

    it('should propagate errors when imagesService.getImage throws an exception', async () => {
      vi.mocked(imagesService.getImage).mockRejectedValue(new Error('Database error'));

      await expect(messagesController.getMessageImage(mockRequest, mockResponse))
        .rejects.toThrow('Database error');
    });
  });

});
