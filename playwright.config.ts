import { defineConfig, devices } from '@playwright/test';

const clientPort = 3400;
const apiPort = 3410;
const dbPort = 55432;
const redisPort = 56379;

const serverEnv = [
  'NODE_ENV=development',
  `VITE_SERVER_PORT=${apiPort}`,
  'DB_SCHEMA=postgres',
  'DB_USERNAME=postgres',
  'DB_PASSWORD=postgres',
  'DB_HOST=127.0.0.1',
  `DB_PORT=${dbPort}`,
  'REDIS_HOST=127.0.0.1',
  `REDIS_PORT=${redisPort}`,
  'REDIS_PASSWORD=redis',
  'ENABLE_LLM_FEATURES=false',
].join(' ');

const clientEnv = [
  `CLIENT_PORT=${clientPort}`,
  `VITE_SERVER_PORT=${apiPort}`,
].join(' ');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${clientPort}`,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `${serverEnv} npm run typeorm:run && ${serverEnv} npm run start`,
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `${clientEnv} npm run start:client`,
      url: `http://127.0.0.1:${clientPort}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
