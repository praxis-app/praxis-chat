// API client for server endpoints

import { LocalStorageKeys } from '@/constants/shared.constants';
import { AuthRes, LoginReq, SignUpReq } from '@/types/auth.types';
import {
  ChannelRes,
  CreateChannelReq,
  FeedItemRes,
  UpdateChannelReq,
} from '@/types/channel.types';
import { ImageRes } from '@/types/image.types';
import {
  InstanceConfigReq,
  InstanceConfigRes,
} from '@/types/instance-config.types';
import { CreateInviteReq, InviteRes } from '@/types/invite.types';
import { MessageRes } from '@/types/message.types';
import { CreatePollReq, PollRes } from '@/types/poll.types';
import {
  CreateRoleReq,
  InstanceRoleRes,
  ServerRoleRes,
  UpdateInstanceRolePermissionsReq,
  UpdateServerRolePermissionsReq,
} from '@/types/role.types';
import { ServerConfigReq, ServerConfigRes } from '@/types/server-config.types';
import { ServerReq, ServerRes } from '@/types/server.types';
import {
  CurrentUserRes,
  UpdateUserProfileReq,
  UserProfileRes,
  UserRes,
} from '@/types/user.types';
import {
  CreateVoteReq,
  CreateVoteRes,
  PollOptionVoterRes,
  UpdateVoteReq,
  UpdateVoteRes,
} from '@/types/vote.types';
import axios, { AxiosInstance, AxiosResponse, Method } from 'axios';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: '/api' });
  }

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------

  login = async (data: LoginReq) => {
    const path = '/auth/login';
    return this.executeRequest<AuthRes>('post', path, {
      data,
    });
  };

  signUp = async (data: SignUpReq) => {
    const path = '/auth/signup';
    return this.executeRequest<AuthRes>('post', path, {
      data,
    });
  };

  createAnonSession = async (inviteToken?: string | null) => {
    const path = '/auth/anon';
    return this.executeRequest<AuthRes>('post', path, {
      data: { inviteToken },
    });
  };

  upgradeAnonSession = async (data: SignUpReq) => {
    const path = '/auth/anon';
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  logOut = async () => {
    const path = '/auth/logout';
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  getCurrentUser = async () => {
    const path = '/users/me';
    return this.executeRequest<{ user: CurrentUserRes }>('get', path);
  };

  getCurrentUserServers = async () => {
    const path = '/users/me/servers';
    return this.executeRequest<{ servers: ServerRes[] }>('get', path);
  };

  getUserProfile = async (userId: string) => {
    const path = `/users/${userId}/profile`;
    return this.executeRequest<{ user: UserProfileRes }>('get', path);
  };

  isFirstUser = async () => {
    const path = '/users/is-first';
    return this.executeRequest<{ isFirstUser: boolean }>('get', path);
  };

  getUserImage = (userId: string, imageId: string) => {
    const path = `/users/${userId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  updateUserProfile = async (data: UpdateUserProfileReq) => {
    const path = '/users/profile';
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  uploadUserProfilePicture = async (formData: FormData) => {
    const path = '/users/profile-picture';
    return this.executeRequest<{ image: ImageRes }>('post', path, {
      data: formData,
    });
  };

  uploadUserCoverPhoto = async (formData: FormData) => {
    const path = '/users/cover-photo';
    return this.executeRequest<{ image: ImageRes }>('post', path, {
      data: formData,
    });
  };

  // -------------------------------------------------------------------------
  // Channels & Messages
  // -------------------------------------------------------------------------

  getChannel = async (
    serverId: string,
    channelId: string,
    inviteToken?: string | null,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<{ channel: ChannelRes }>('get', path, {
      params: { inviteToken },
    });
  };

  getChannels = async (serverId: string, inviteToken?: string | null) => {
    const path = `/servers/${serverId}/channels`;
    return this.executeRequest<{ channels: ChannelRes[] }>('get', path, {
      params: { inviteToken },
    });
  };

  getJoinedChannels = async (serverId: string) => {
    const path = `/servers/${serverId}/channels/joined`;
    return this.executeRequest<{ channels: ChannelRes[] }>('get', path);
  };

  getChannelFeed = async (
    serverId: string,
    channelId: string,
    offset: number,
    limit: number,
    inviteToken?: string | null,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/feed`;
    return this.executeRequest<{ feed: FeedItemRes[] }>('get', path, {
      params: { offset, limit, inviteToken },
    });
  };

  createChannel = async (serverId: string, data: CreateChannelReq) => {
    const path = `/servers/${serverId}/channels`;
    return this.executeRequest<{ channel: ChannelRes }>('post', path, {
      data,
    });
  };

  updateChannel = async (
    serverId: string,
    channelId: string,
    data: UpdateChannelReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  deleteChannel = async (serverId: string, channelId: string) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<void>('delete', path);
  };

  sendMessage = async (
    serverId: string,
    channelId: string,
    body: string,
    imageCount: number,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages`;
    return this.executeRequest<{ message: MessageRes }>('post', path, {
      data: { body, imageCount },
    });
  };

  uploadMessageImage = async (
    serverId: string,
    channelId: string,
    messageId: string,
    imageId: string,
    formData: FormData,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages/${messageId}/images/${imageId}/upload`;
    return this.executeRequest<{ image: ImageRes }>('post', path, {
      data: formData,
    });
  };

  getMessageImage = (
    serverId: string,
    channelId: string,
    messageId: string,
    imageId: string,
    inviteToken?: string | null,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages/${messageId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, {
      responseType: 'blob',
      params: { inviteToken },
    });
  };

  // -------------------------------------------------------------------------
  // Polls & Votes
  // -------------------------------------------------------------------------

  createPoll = async (
    serverId: string,
    channelId: string,
    data: CreatePollReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls`;
    return this.executeRequest<{ poll: PollRes }>('post', path, {
      data,
    });
  };

  getPollImage = (
    serverId: string,
    channelId: string,
    pollId: string,
    imageId: string,
    inviteToken?: string | null,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, {
      responseType: 'blob',
      params: { inviteToken },
    });
  };

  createVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    data: CreateVoteReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes`;
    return this.executeRequest<{ vote: CreateVoteRes }>('post', path, {
      data,
    });
  };

  updateVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    voteId: string,
    data: UpdateVoteReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes/${voteId}`;
    return this.executeRequest<UpdateVoteRes>('put', path, {
      data,
    });
  };

  deleteVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    voteId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes/${voteId}`;
    return this.executeRequest<void>('delete', path);
  };

  getVotersByPollOption = async (
    serverId: string,
    channelId: string,
    pollId: string,
    pollOptionId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/options/${pollOptionId}/voters`;
    return this.executeRequest<{ voters: PollOptionVoterRes[] }>('get', path);
  };

  // -------------------------------------------------------------------------
  // Servers
  // -------------------------------------------------------------------------

  getServers = async () => {
    const path = '/servers';
    return this.executeRequest<{ servers: ServerRes[] }>('get', path);
  };

  getServerById = async (serverId: string) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getServerByInviteToken = async (inviteToken: string) => {
    const path = `/servers/invite/${inviteToken}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getServerMembers = async (serverId: string) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  getUsersEligibleForServer = async (serverId: string) => {
    const path = `/servers/${serverId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  getServerBySlug = async (slug: string) => {
    const path = `/servers/slug/${slug}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getDefaultServer = async () => {
    const path = '/servers/default';
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  createServer = async (data: ServerReq) => {
    const path = '/servers';
    return this.executeRequest<{ server: ServerRes }>('post', path, {
      data,
    });
  };

  updateServer = async (serverId: string, data: ServerReq) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<{ server: ServerRes }>('put', path, {
      data,
    });
  };

  deleteServer = async (serverId: string) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<void>('delete', path);
  };

  addServerMembers = async (serverId: string, userIds: string[]) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeServerMembers = async (serverId: string, userIds: string[]) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<void>('delete', path, {
      data: { userIds },
    });
  };

  joinServer = async (serverId: string, inviteToken: string) => {
    const path = `/servers/${serverId}/join`;
    return this.executeRequest<void>('post', path, {
      data: { inviteToken },
    });
  };

  // -------------------------------------------------------------------------
  // Server Configs
  // -------------------------------------------------------------------------

  getServerConfig = async (serverId: string) => {
    const path = `/servers/${serverId}/configs`;
    return this.executeRequest<{ serverConfig: ServerConfigRes }>('get', path);
  };

  isAnonymousUsersEnabled = async (serverId: string) => {
    const path = `/servers/${serverId}/configs/anon-enabled`;
    return this.executeRequest<{ anonymousUsersEnabled: boolean }>('get', path);
  };

  updateServerConfig = async (serverId: string, data: ServerConfigReq) => {
    const path = `/servers/${serverId}/configs`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  // -------------------------------------------------------------------------
  // Server Roles & Permissions
  // -------------------------------------------------------------------------

  getServerRole = async (serverId: string, serverRoleId: string) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<{ serverRole: ServerRoleRes }>('get', path);
  };

  getServerRoles = async (serverId: string) => {
    const path = `/servers/${serverId}/roles`;
    return this.executeRequest<{ serverRoles: ServerRoleRes[] }>('get', path);
  };

  getUsersEligibleForServerRole = async (
    serverId: string,
    serverRoleId: string,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  createServerRole = async (serverId: string, data: CreateRoleReq) => {
    const path = `/servers/${serverId}/roles`;
    return this.executeRequest<{ serverRole: ServerRoleRes }>('post', path, {
      data,
    });
  };

  updateServerRole = async (
    serverId: string,
    serverRoleId: string,
    data: CreateRoleReq,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  updateServerRolePermissions = async (
    serverId: string,
    serverRoleId: string,
    data: UpdateServerRolePermissionsReq,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/permissions`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  addServerRoleMembers = async (
    serverId: string,
    serverRoleId: string,
    userIds: string[],
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeServerRoleMember = async (
    serverId: string,
    serverRoleId: string,
    userId: string,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members/${userId}`;
    return this.executeRequest<void>('delete', path);
  };

  deleteServerRole = async (serverId: string, serverRoleId: string) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Instance Config
  // -------------------------------------------------------------------------

  getInstanceConfig = async () => {
    const path = `/instance/config`;
    return this.executeRequest<{ instanceConfig: InstanceConfigRes }>(
      'get',
      path,
    );
  };

  updateInstanceConfig = async (data: InstanceConfigReq) => {
    const path = `/instance/config`;
    return this.executeRequest<{ instanceConfig: InstanceConfigRes }>(
      'put',
      path,
      { data },
    );
  };

  // -------------------------------------------------------------------------
  // Instance Roles & Permissions
  // -------------------------------------------------------------------------

  getInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<{ instanceRole: InstanceRoleRes }>('get', path);
  };

  getInstanceRoles = async () => {
    const path = `/instance/roles`;
    return this.executeRequest<{ instanceRoles: InstanceRoleRes[] }>(
      'get',
      path,
    );
  };

  getUsersEligibleForInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  createInstanceRole = async (data: CreateRoleReq) => {
    const path = `/instance/roles`;
    return this.executeRequest<{ instanceRole: InstanceRoleRes }>(
      'post',
      path,
      { data },
    );
  };

  updateInstanceRole = async (instanceRoleId: string, data: CreateRoleReq) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  updateInstanceRolePermissions = async (
    instanceRoleId: string,
    data: UpdateInstanceRolePermissionsReq,
  ) => {
    const path = `/instance/roles/${instanceRoleId}/permissions`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  addInstanceRoleMembers = async (
    instanceRoleId: string,
    userIds: string[],
  ) => {
    const path = `/instance/roles/${instanceRoleId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeInstanceRoleMember = async (instanceRoleId: string, userId: string) => {
    const path = `/instance/roles/${instanceRoleId}/members/${userId}`;
    return this.executeRequest<void>('delete', path);
  };

  deleteInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Invites
  // -------------------------------------------------------------------------

  isValidInvite = async (token: string) => {
    const path = `/invites/validate/${token}`;
    return this.executeRequest<{ isValidInvite: boolean }>('get', path);
  };

  getInvites = async (serverId: string) => {
    const path = `/servers/${serverId}/invites`;
    return this.executeRequest<{ invites: InviteRes[] }>('get', path);
  };

  createInvite = async (serverId: string, data: CreateInviteReq) => {
    const path = `/servers/${serverId}/invites`;
    return this.executeRequest<{ invite: InviteRes }>('post', path, {
      data,
    });
  };

  deleteInvite = async (serverId: string, inviteId: string) => {
    const path = `/servers/${serverId}/invites/${inviteId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Misc.
  // -------------------------------------------------------------------------

  getHealth = async () => {
    return this.executeRequest<{ timestamp: string }>('get', '/health');
  };

  private async executeRequest<T>(
    method: Method,
    path: string,
    options?: {
      data?: unknown;
      params?: Record<string, unknown>;
      responseType?: AxiosResponse['config']['responseType'];
    },
  ): Promise<T> {
    try {
      const token = localStorage.getItem(LocalStorageKeys.AccessToken);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response: AxiosResponse<T> = await this.axiosInstance.request<T>({
        method,
        url: path,
        data: options?.data,
        params: options?.params,
        responseType: options?.responseType,
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(`API request error: ${error}`);
      throw error;
    }
  }
}

export const api = new ApiClient();
