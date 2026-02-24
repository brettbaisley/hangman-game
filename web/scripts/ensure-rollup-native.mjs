import { execSync } from 'node:child_process';

if (process.platform !== 'linux') {
  process.exit(0);
}

const libc = process.report?.getReport?.().header?.glibcVersionRuntime ? 'gnu' : 'musl';
const archToRollup = {
  x64: 'x64',
  arm64: 'arm64',
};

const rollupArch = archToRollup[process.arch];
if (!rollupArch) {
  process.exit(0);
}

const packageName = `@rollup/rollup-linux-${rollupArch}-${libc}`;
execSync(`npm install --no-save ${packageName}`, { stdio: 'inherit' });
