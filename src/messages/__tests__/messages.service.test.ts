import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all the modules before importing the service
vi.mock('../../database/data-source', () => {
  const mockMessageRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockImageRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
  };

  return {
    dataSource: {
      getRepository: vi.fn().mockImplementation((entity) => {
        const entityName = typeof entity === 'function' ? entity.name : entity;
        if (entityName === 'Message') {
          return mockMessageRepository;
        }
        if (entityName === 'Image' || entityName === 'Image2') {
          return mockImageRepository;
        }
        return mockMessageRepository;
      }),
    },
  };
});

vi.mock('../../channels/channels.service', () => ({
  getGeneralChannel: vi.fn(),
  getChannelMembers: vi.fn(),
  getUnwrappedChannelKeyMap: vi.fn(),
  getUnwrappedChannelKey: vi.fn(),
}));

vi.mock('../../users/users.service', () => ({
  getUserImagesMap: vi.fn(),
  getUserProfilePicture: vi.fn(),
  getUserProfilePicturesMap: vi.fn(),
}));

vi.mock('../../pub-sub/pub-sub.service', () => ({
  publish: vi.fn(),
}));

vi.mock('../../common/common.utils', () => ({
  sanitizeText: vi.fn((text?: string) => text?.trim() || ''),
}));

vi.mock('../message.entity', () => ({
  Message: function Message() {},
}));

vi.mock('../../images/entities/image.entity', () => ({
  Image: function Image() {},
}));

vi.mock('../../users/user.entity', () => ({
  User: function User() {},
}));

// Import the service after mocks
import * as channelsService from '../../channels/channels.service';
import { sanitizeText } from '../../common/common.utils';
import { dataSource } from '../../database/data-source';
import { Image } from '../../images/entities/image.entity';
import * as pubSubService from '../../pub-sub/pub-sub.service';
import * as usersService from '../../users/users.service';
import * as messagesService from '../messages.service';

// Mock data constants
const mockUser = {
  id: 'user-1',
  name: 'Test User',
  displayName: 'Test User',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
} as any;

describe('Messages Service', () => {
  let mockMessageRepository: any;
  let mockImageRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mocked repositories
    mockMessageRepository = vi.mocked(dataSource.getRepository)('Message');
    mockImageRepository = vi.mocked(dataSource.getRepository)('Image');
  });

  describe('getMessages', () => {
    it('should fetch messages for a channel and format them correctly', async () => {
      const mockMessages = [
        {
          id: 'message-1',
          userId: 'user-1',
          channelId: 'channel-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          user: { id: 'user-1', name: 'Test User', displayName: 'Test User' },
          images: [
            {
              id: 'image-1',
              filename: 'test.jpg',
              createdAt: new Date('2023-01-01'),
            },
            {
              id: 'image-2',
              filename: null,
              createdAt: new Date('2023-01-01'),
            },
          ],
        },
      ];

      // Mock the query builder chain
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(mockMessages),
        getRawAndEntities: vi.fn().mockResolvedValue({
          entities: mockMessages,
          raw: [],
        }),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(channelsService.getUnwrappedChannelKeyMap).mockResolvedValue(
        {},
      );
      vi.mocked(usersService.getUserProfilePicturesMap).mockResolvedValue({
        'user-1': {
          id: 'profile-1',
          userId: 'user-1',
          imageType: 'profile-picture',
        } as Image,
      });

      const result = await messagesService.getMessages('channel-1', 10, 20);

      expect(mockMessageRepository.createQueryBuilder).toHaveBeenCalledWith(
        'message',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'message.id',
        'message.ciphertext',
        'message.keyId',
        'message.tag',
        'message.iv',
        'message.createdAt',
      ]);
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith([
        'messageUser.id',
        'messageUser.name',
        'messageUser.displayName',
      ]);
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith([
        'messageImage.id',
        'messageImage.filename',
        'messageImage.createdAt',
      ]);
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'message.user',
        'messageUser',
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'message.images',
        'messageImage',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'message.channelId = :channelId',
        { channelId: 'channel-1' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'message.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);

      expect(result[0].images).toEqual([
        {
          id: 'image-1',
          isPlaceholder: false,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'image-2',
          isPlaceholder: true,
          createdAt: new Date('2023-01-01'),
        },
      ]);
    });
  });

  describe('createMessage', () => {
    it('should create a message with image placeholders and publish to channel members', async () => {
      const messageData = {
        body: '  Test message  ',
        channelId: 'channel-1',
        imageCount: 2,
      };

      const mockImagePlaceholders = [
        { id: 'image-1', createdAt: new Date('2023-01-01') },
        { id: 'image-2', createdAt: new Date('2023-01-01') },
      ];

      mockMessageRepository.save.mockResolvedValue({
        id: 'message-1',
        userId: 'user-1',
        channelId: 'channel-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      });
      mockImageRepository.create.mockImplementation((data: any) => ({
        messageId: data.messageId,
      }));
      mockImageRepository.save.mockResolvedValue(mockImagePlaceholders);
      vi.mocked(sanitizeText).mockReturnValue('Test message');
      vi.mocked(channelsService.getUnwrappedChannelKey).mockResolvedValue({
        id: 'key-1',
        channelId: 'channel-1',
        wrappedKey: Buffer.alloc(32),
        tag: Buffer.alloc(16),
        iv: Buffer.alloc(12),
        unwrappedKey: Buffer.alloc(32),
        messages: [],
        polls: [],
        channel: {} as any,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      });
      vi.mocked(channelsService.getChannelMembers).mockResolvedValue([
        {
          id: 'member-1',
          userId: 'user-1',
          channelId: 'channel-1',
          lastMessageReadId: null,
          user: mockUser,
          channel: {} as any,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
        {
          id: 'member-2',
          userId: 'user-2',
          channelId: 'channel-1',
          lastMessageReadId: null,
          user: {} as any,
          channel: {} as any,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
      ]);
      vi.mocked(usersService.getUserProfilePicture).mockResolvedValue({
        id: 'profile-1',
      } as any);

      const result = await messagesService.createMessage(
        'channel-1',
        messageData,
        mockUser,
      );

      expect(sanitizeText).toHaveBeenCalledWith('  Test message  ');
      expect(mockMessageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          channelId: 'channel-1',
          keyId: 'key-1',
          ciphertext: expect.any(Buffer),
          iv: expect.any(Buffer),
          tag: expect.any(Buffer),
        }),
      );

      expect(mockImageRepository.create).toHaveBeenCalledTimes(2);
      expect(result.images).toHaveLength(2);
      expect(result.images[0].isPlaceholder).toBe(true);

      expect(pubSubService.publish).toHaveBeenCalledWith(
        'new-message-channel-1-user-2',
        {
          type: 'message',
          message: expect.objectContaining({
            body: 'Test message',
            user: {
              id: 'user-1',
              name: 'Test User',
              displayName: 'Test User',
              profilePicture: {
                id: 'profile-1',
              },
            },
            images: expect.arrayContaining([
              expect.objectContaining({
                id: 'image-1',
                isPlaceholder: true,
              }),
              expect.objectContaining({
                id: 'image-2',
                isPlaceholder: true,
              }),
            ]),
          }),
        },
      );
    });
  });

  describe('saveMessageImage', () => {
    it('should save image and publish to channel members', async () => {
      const messageId = 'message-1';
      const imageId = 'image-1';
      const filename = 'test.jpg';

      const mockExistingMessage = {
        id: messageId,
        channelId: 'channel-1',
      };

      const mockSavedImage = {
        id: imageId,
        filename,
      };

      mockMessageRepository.findOne.mockResolvedValue(mockExistingMessage);
      mockImageRepository.save.mockResolvedValue(mockSavedImage);
      vi.mocked(channelsService.getChannelMembers).mockResolvedValue([
        {
          id: 'member-1',
          userId: 'user-1',
          channelId: 'channel-1',
          lastMessageReadId: null,
          user: mockUser,
          channel: {} as any,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
        {
          id: 'member-2',
          userId: 'user-2',
          channelId: 'channel-1',
          lastMessageReadId: null,
          user: {} as any,
          channel: {} as any,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        } as any,
      ]);

      const result = await messagesService.saveMessageImage(
        messageId,
        imageId,
        filename,
        mockUser,
      );

      expect(mockMessageRepository.findOne).toHaveBeenCalledWith({
        where: { id: messageId },
      });

      expect(mockImageRepository.save).toHaveBeenCalledWith({
        id: imageId,
        filename,
      });

      expect(pubSubService.publish).toHaveBeenCalledWith(
        'new-message-channel-1-user-2',
        {
          type: 'image',
          isPlaceholder: false,
          messageId,
          imageId,
        },
      );

      expect(result).toEqual(mockSavedImage);
    });
  });
});
