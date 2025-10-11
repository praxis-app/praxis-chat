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
vi.mock('../users.service');

// Import after mocks
import * as usersService from '../users.service';
import * as usersController from '../users.controller';

describe('User Profile Authorization', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      params: {
        userId: 'user-2',
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
      json: vi.fn(),
    };
  });

  describe('getUserProfile', () => {
    it('should successfully return user profile when users share a channel', async () => {
      const mockUserProfile = {
        id: 'user-2',
        name: 'other-user',
        displayName: 'Other User',
        bio: 'Test bio',
        profilePicture: null,
        coverPhoto: null,
      };

      vi.mocked(usersService.hasSharedChannel).mockResolvedValue(true);
      vi.mocked(usersService.getUserProfile).mockResolvedValue(
        mockUserProfile as any,
      );

      await usersController.getUserProfile(mockRequest, mockResponse);

      expect(usersService.hasSharedChannel).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
      expect(usersService.getUserProfile).toHaveBeenCalledWith('user-2');
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUserProfile,
      });
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should return 403 when users do not share a channel', async () => {
      vi.mocked(usersService.hasSharedChannel).mockResolvedValue(false);

      await usersController.getUserProfile(mockRequest, mockResponse);

      expect(usersService.hasSharedChannel).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
      expect(usersService.getUserProfile).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.send).toHaveBeenCalledWith('Access denied');
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      vi.mocked(usersService.hasSharedChannel).mockResolvedValue(true);
      vi.mocked(usersService.getUserProfile).mockResolvedValue(null as any);

      await usersController.getUserProfile(mockRequest, mockResponse);

      expect(usersService.hasSharedChannel).toHaveBeenCalledWith(
        'user-1',
        'user-2',
      );
      expect(usersService.getUserProfile).toHaveBeenCalledWith('user-2');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('User not found');
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should allow viewing own profile', async () => {
      mockRequest.params.userId = 'user-1';

      const mockUserProfile = {
        id: 'user-1',
        name: 'test-user',
        displayName: 'Test User',
        bio: 'My bio',
        profilePicture: null,
        coverPhoto: null,
      };

      vi.mocked(usersService.hasSharedChannel).mockResolvedValue(true);
      vi.mocked(usersService.getUserProfile).mockResolvedValue(
        mockUserProfile as any,
      );

      await usersController.getUserProfile(mockRequest, mockResponse);

      expect(usersService.hasSharedChannel).toHaveBeenCalledWith(
        'user-1',
        'user-1',
      );
      expect(usersService.getUserProfile).toHaveBeenCalledWith('user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUserProfile,
      });
    });

    it('should propagate errors when hasSharedChannel throws an exception', async () => {
      vi.mocked(usersService.hasSharedChannel).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        usersController.getUserProfile(mockRequest, mockResponse),
      ).rejects.toThrow('Database error');
    });
  });
});
