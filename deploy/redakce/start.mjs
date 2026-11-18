// Dev nasazení redakce: připraví git repozitář s obsahem, po každém uložení
// commit → build → přepnutí WWW_DIR/current → push, a spustí Node server redakce.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const APP_DIR = process.env.APP_DIR ?? '/app';
const REPO_DIR = process.env.REPO_DIR ?? '/srv/repo';
const WWW_DIR = process.env.WWW_DIR ?? '/srv/www';
const GIT_REMOTE = process.env.GIT_REMOTE ?? '';
const GIT_BRANCH = process.env.GIT_BRANCH ?? 'redakce-dev';
const GIT_PUSH = process.env.GIT_PUSH === 'true';
const DEBOUNCE_MS = Number(process.env.PUBLISH_DEBOUNCE_MS ?? 3000);
const KEEP_RELEASES = 3;

const log = (...args) => console.log('[redakce]', ...args);
if (!process.env.GIT_SSH_COMMAND) delete process.env.GIT_SSH_COMMAND;

function run(cmd, args, { cwd = REPO_DIR, env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`${cmd} ${args.join(' ')}: ${out.trim().split('\n').slice(-15).join('\n')}`))));
  });
}
const git = (...args) => run('git', args);

async function prepareRepo() {
  if (!existsSync(path.join(REPO_DIR, '.git'))) {
    if (GIT_REMOTE) {
      log(`klonuji ${GIT_REMOTE} (${GIT_BRANCH})`);
      try {
        await run('git', ['clone', '--branch', GIT_BRANCH, GIT_REMOTE, REPO_DIR], { cwd: '/' });
      } catch {
        // Větev na GitHubu zatím není, vznikne prvním pushem.
        await fs.rm(REPO_DIR, { recursive: true, force: true });
        await run('git', ['clone', GIT_REMOTE, REPO_DIR], { cwd: '/' });
        await git('checkout', '-q', '-b', GIT_BRANCH);
      }
    } else {
      log('GIT_REMOTE není nastavené, zakládám lokální repozitář ze zdrojáků image');
      await fs.cp(APP_DIR, REPO_DIR, {
        recursive: true,
        filter: (src) => !/^(node_modules|dist|\.astro|\.git|inspo)(\/|$)/.test(path.relative(APP_DIR, src)),
      });
      await git('init', '-q', '-b', GIT_BRANCH);
      await git('add', '-A');
      await git('-c', 'user.name=hkfree redakce', '-c', 'user.email=redakce@hkfree.org', 'commit', '-q', '-m', 'Výchozí obsah');
    }
  }
  await git('config', 'user.name', process.env.GIT_COMMITTER_NAME ?? 'hkfree redakce');
  await git('config', 'user.email', process.env.GIT_COMMITTER_EMAIL ?? 'redakce@hkfree.org');
  // Závislosti z image; symlink nesmí do gitu.
  const modules = path.join(REPO_DIR, 'node_modules');
  if (!existsSync(modules)) await fs.symlink(path.join(APP_DIR, 'node_modules'), modules);
  const exclude = path.join(REPO_DIR, '.git/info/exclude');
  await fs.mkdir(path.dirname(exclude), { recursive: true });
  const excluded = existsSync(exclude) ? await fs.readFile(exclude, 'utf8') : '';
  if (!/^\/node_modules$/m.test(excluded)) await fs.appendFile(exclude, '\n/node_modules\n');
}

async function build() {
  await run(process.execPath, [path.join(REPO_DIR, 'node_modules/astro/bin/astro.mjs'), 'build'], {
    env: { REDAKCE: '', ASTRO_TELEMETRY_DISABLED: '1' },
  });
  const releases = path.join(WWW_DIR, 'releases');
  const name = new Date().toISOString().replace(/[:.]/g, '-');
  await fs.mkdir(releases, { recursive: true });
  await fs.cp(path.join(REPO_DIR, 'dist'), path.join(releases, name), { recursive: true });
  // Relativní, nginx má volume připojené jinde.
  const tmp = path.join(WWW_DIR, `.current-${name}`);
  await fs.symlink(path.join('releases', name), tmp);
  await fs.rename(tmp, path.join(WWW_DIR, 'current'));
  const old = (await fs.readdir(releases)).sort().slice(0, -KEEP_RELEASES);
  await Promise.all(old.map((dir) => fs.rm(path.join(releases, dir), { recursive: true, force: true })));
  log(`zveřejněno ${name}`);
}

/** Commit všech změn; autor = první redaktor, ostatní jako Co-authored-by. */
async function commit(authors) {
  await git('add', '-A');
  const files = (await git('diff', '--cached', '--name-only')).split('\n').filter(Boolean);
  if (!files.length) return false;
  // src/content/aktuality/ples/foto.jpg -> aktuality/ples, src/data/dokumenty.json -> dokumenty
  const entry = (f) => f.replace(/^(src\/(content|data)|public)\//, '').replace(/\.(md|ya?ml|json)$/, '').split('/').slice(0, 2).join('/');
  const entries = [...new Set(files.map(entry))];
  const message = `Redakce: ${entries.slice(0, 3).join(', ')}${entries.length > 3 ? ` a další (${entries.length})` : ''}`;
  const unique = [...new Map(authors.filter(Boolean).map((a) => [a.email, a])).values()];
  const trailers = unique.slice(1).map((a) => `Co-authored-by: ${a.name} <${a.email}>`);
  const args = ['commit', '-q', '-m', message, ...(trailers.length ? ['-m', trailers.join('\n')] : [])];
  if (unique[0]) args.push(`--author=${unique[0].name} <${unique[0].email}>`);
  await git(...args);
  log(message);
  return true;
}

async function sync() {
  if (!GIT_PUSH || !GIT_REMOTE) return;
  const exists = (await git('ls-remote', '--heads', 'origin', GIT_BRANCH)) !== '';
  if (exists) {
    try {
      await git('pull', '-q', '--rebase', 'origin', GIT_BRANCH);
    } catch (error) {
      await git('rebase', '--abort').catch(() => {});
      throw new Error(`Nepodařilo se sloučit změny z GitHubu: ${error.message}`);
    }
  }
  await git('push', '-q', 'origin', `HEAD:${GIT_BRANCH}`);
}

const status = { state: 'idle', message: undefined, publishedAt: undefined };
let pendingAuthors = [];
let timer;
let running = false;
let rerun = false;

async function publish() {
  if (running) return void (rerun = true);
  running = true;
  status.state = 'building';
  const authors = pendingAuthors;
  pendingAuthors = [];
  try {
    await commit(authors);
    let syncError;
    try {
      await sync();
    } catch (error) {
      syncError = error;
    }
    await build();
    status.publishedAt = new Date().toISOString();
    if (syncError) throw syncError;
    status.state = 'idle';
    status.message = undefined;
  } catch (error) {
    status.state = 'error';
    status.message = error.message;
    console.error('[redakce] zveřejnění selhalo:', error.message);
  } finally {
    running = false;
    if (rerun) {
      rerun = false;
      publish();
    }
  }
}

globalThis.__hkfreeRedakce = {
  notify(user) {
    pendingAuthors.push(user);
    if (status.state !== 'building') status.state = 'pending';
    clearTimeout(timer);
    timer = setTimeout(publish, DEBOUNCE_MS);
  },
  status: () => ({ ...status }),
};

// Node jako PID 1 nemá výchozí obsluhu signálů.
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => process.exit(0));

if (process.env.AUTH_MODE === 'dev') {
  console.warn('[redakce] POZOR: AUTH_MODE=dev, do redakce se dostane každý bez hesla. Jen pro uzavřenou síť.');
}

await prepareRepo();
log('úvodní build');
await publish();
process.chdir(REPO_DIR);
process.env.HOST = process.env.REDAKCE_HOST ?? '0.0.0.0';
process.env.PORT = process.env.REDAKCE_PORT ?? '4321';
await import(path.join(APP_DIR, 'dist/server/entry.mjs'));
