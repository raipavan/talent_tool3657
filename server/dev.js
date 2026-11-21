import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('[Dev] Starting TalentPool365 CMS Backend + Vite Frontend...');

const api = spawn(process.execPath, [path.join(__dirname, 'index.js')], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '4050' },
});

const web = spawn(npmCmd, ['run', 'dev:web'], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  shell: isWin,
  env: process.env,
});

const shutdown = () => {
  api.kill();
  web.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

api.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[Dev] CMS Backend exited with code ${code}`);
  }
});

web.on('exit', (code) => {
  api.kill();
  process.exit(code ?? 0);
});
