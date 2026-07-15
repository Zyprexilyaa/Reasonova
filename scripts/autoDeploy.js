const { exec } = require('child_process');
const { watch } = require('fs');
const { resolve } = require('path');

const watchedPaths = [
  'frontend',
  'backend/functions/src',
  'backend/functions/package.json',
  'frontend/package.json',
  'package.json',
  'firebase.json',
  'render.yaml',
];

const debounceMs = 5000;
let debounceTimer = null;
let isRunning = false;

function log(message) {
  process.stdout.write(`[auto-deploy] ${message}\n`);
}

function runCommand(command) {
  return new Promise((resolvePromise, rejectPromise) => {
    const proc = exec(command, { shell: true, cwd: resolve(__dirname, '..') });
    proc.stdout.on('data', data => process.stdout.write(data));
    proc.stderr.on('data', data => process.stderr.write(data));
    proc.on('close', code => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Command failed with exit code ${code}: ${command}`));
      }
    });
  });
}

async function hasStagedChanges() {
  try {
    await runCommand('git diff --cached --quiet');
    return false;
  } catch {
    return true;
  }
}

async function buildPushDeploy() {
  if (isRunning) {
    log('A deployment run is already in progress. Skipping this trigger.');
    return;
  }

  isRunning = true;
  log('Change detected. Running build, git push, and deploy sequence...');

  try {
    await runCommand('npm run build');
    log('Build finished. Staging tracked changes...');
    await runCommand('git add -u');

    const hasChanges = await hasStagedChanges();
    if (hasChanges) {
      const message = `auto build deploy: ${new Date().toISOString()}`;
      await runCommand(`git commit -m "${message}"`);
      log('Committed changes. Pushing to origin/master...');
      await runCommand('git push origin master');
    } else {
      log('No tracked changes to commit. Skipping git commit/push.');
    }

    log('Deploying to Firebase...');
    await runCommand('npm run deploy');
    log('Auto deploy sequence completed successfully.');
  } catch (error) {
    log(`Auto deploy sequence failed: ${error.message}`);
  } finally {
    isRunning = false;
  }
}

function triggerBuild() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(buildPushDeploy, debounceMs);
}

const resolvedPaths = watchedPaths.map(p => resolve(__dirname, '..', p));
for (const watchPath of resolvedPaths) {
  try {
    watch(watchPath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        log(`Detected ${eventType} in ${watchPath}/${filename}`);
        triggerBuild();
      }
    });
    log(`Watching ${watchPath}`);
  } catch (error) {
    log(`Failed to watch path ${watchPath}: ${error.message}`);
  }
}

log('Auto-deploy watcher started. Waiting for code changes...');
