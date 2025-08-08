import 'reflect-metadata';
import { vi } from 'vitest';

// Global test setup for backend tests
vi.mock('../database/data-source');
vi.mock('../channels/channels.service');
vi.mock('../pub-sub/pub-sub.service');
vi.mock('../common/common.utils');
