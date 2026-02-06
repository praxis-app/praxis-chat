import { spawnSync } from 'node:child_process';

const composeArgs = ['compose', '-f', 'docker-compose.e2e.yml'];

const run = (command: string, args: string[]) => {
  return spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });
};

const getExitCode = (status: number | null) => {
  return status ?? 1;
};

const cleanup = () => {
  return run('docker', [...composeArgs, 'down', '-v', '--remove-orphans']);
};

let exitCode = 0;

try {
  const teardownBeforeStart = run('docker', [
    ...composeArgs,
    'down',
    '-v',
    '--remove-orphans',
  ]);
  if (teardownBeforeStart.status !== 0) {
    console.error('Failed to reset E2E Docker services before test startup.');
    exitCode = getExitCode(teardownBeforeStart.status);
  }

  if (exitCode === 0) {
    const startup = run('docker', [...composeArgs, 'up', '-d', '--wait']);
    if (startup.status !== 0) {
      console.error('Failed to start E2E Docker services.');
      exitCode = getExitCode(startup.status);
    }
  }

  if (exitCode === 0) {
    const testRun = run('npx', ['playwright', 'test', ...process.argv.slice(2)]);
    exitCode = getExitCode(testRun.status);
  }
} finally {
  const teardown = cleanup();
  if (teardown.status !== 0) {
    console.error('Failed to clean up E2E Docker services.');
    if (exitCode === 0) {
      exitCode = getExitCode(teardown.status);
    }
  }
}

process.exit(exitCode);
