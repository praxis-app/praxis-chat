import { spawnSync } from 'node:child_process';

const composeArgs = ['compose', '-f', 'docker-compose.e2e.yml'];

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
};

const cleanup = () => {
  spawnSync('docker', [...composeArgs, 'down', '-v', '--remove-orphans'], {
    stdio: 'inherit',
    env: process.env,
  });
};

try {
  run('docker', [...composeArgs, 'down', '-v', '--remove-orphans']);
  run('docker', [...composeArgs, 'up', '-d', '--wait']);
  run('npx', ['playwright', 'test', ...process.argv.slice(2)]);
} finally {
  cleanup();
}
