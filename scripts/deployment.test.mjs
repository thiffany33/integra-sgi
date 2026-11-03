import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercise publication ordering without network, credentials, or real deployments.
function simulate(branch, failHealth = false) {
  const root = mkdtempSync(join(tmpdir(), 'integra-deploy-test-'));
  try {
    for (const dir of ['api-source', 'web-source', 'vercel-cli/node_modules/.bin', 'bin']) {
      mkdirSync(join(root, dir), { recursive: true });
    }
    const log = join(root, 'calls');
    writeFileSync(join(root, 'vercel-cli/node_modules/.bin/vercel'), `#!/bin/bash
printf '%s:%s\\n' "$VERCEL_PROJECT_ID" "$*" >> "$CALL_LOG"
if [[ "$1" == deploy ]]; then echo "https://$VERCEL_PROJECT_ID.example.test"; fi
`, { mode: 0o755 });
    writeFileSync(join(root, 'bin/node'), `#!/bin/bash
printf 'health:%s\\n' "$*" >> "$CALL_LOG"
if [[ "$FAIL_HEALTH" == yes ]]; then exit 1; fi
`, { mode: 0o755 });
    const result = spawnSync('bash', [resolve('scripts/deploy-vercel.sh')], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${root}/bin:${process.env.PATH}`, GITHUB_WORKSPACE: root,
        RUNNER_TEMP: root, DEPLOY_BRANCH: branch, DEPLOY_SHA: 'validated-sha',
        VERCEL_TOKEN: 'fake', API_PROJECT_ID: 'api', WEB_PROJECT_ID: 'web',
        API_DOMAIN: 'integra-sgi-api-git-homolog-example.vercel.app',
        WEB_DOMAIN: 'integra-sgi-web-git-homolog-example.vercel.app',
        GITHUB_STEP_SUMMARY: join(root, 'summary'), CALL_LOG: log,
        FAIL_HEALTH: failHealth ? 'yes' : 'no' },
    });
    return { status: result.status, calls: readFileSync(log, 'utf8').trim().split('\n') };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('production stages and checks API before promotion and web publication', () => {
  const { status, calls } = simulate('main');
  assert.equal(status, 0);
  assert.match(calls[0], /^api:deploy --prebuilt --yes --skip-domain --prod /);
  assert.match(calls[1], /^health:.*https:\/\/api\.example\.test\/api\/v1\/health api$/);
  assert.match(calls[2], /^api:promote /);
  assert.match(calls[3], /^health:/);
  assert.match(calls[4], /^web:deploy /);
  assert.match(calls[6], /^web:promote /);
  assert.match(calls[8], /^health:.*https:\/\/integra-sgi-web-git-homolog-example\.vercel\.app\/api\/v1\/health api$/);
  assert.equal(calls.length, 9);
});

test('homolog uses preview and assigns each stable alias', () => {
  const { status, calls } = simulate('homolog');
  assert.equal(status, 0);
  assert(!calls.some(call => call.includes('--prod') || call.includes(':promote')));
  assert.match(calls[2], /^api:alias set https:\/\/api.example.test integra-sgi-api-git-homolog-example\.vercel\.app /);
  assert.match(calls[6], /^web:alias set https:\/\/web.example.test integra-sgi-web-git-homolog-example\.vercel\.app /);
});

test('failed API health blocks domain changes and frontend publication', () => {
  const { status, calls } = simulate('main', true);
  assert.notEqual(status, 0);
  assert.equal(calls.length, 2);
  assert(!calls.some(call => call.startsWith('web:') || call.includes(':promote')));
});

// `vercel pull` masks Sensitive variables, so the Vercel side exposes the migration
// target through the non-sensitive DB_IDENTITY ("host/database"), not through URLs.
function checkEnvironment(directUrl, { dbIdentity = 'db.example.test/app' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'integra-env-test-'));
  try {
    for (const project of ['api', 'web']) mkdirSync(join(root, `${project}-source/.vercel`), { recursive: true });
    writeFileSync(join(root, 'api-source/.vercel/.env.production.local'), [
      'APP_ENV=production', 'NODE_ENV=production',
      `DB_IDENTITY=${dbIdentity}`,
      'DATABASE_URL=fake',
      'APP_URL=https://integra-sgi-web.vercel.app', 'FRONTEND_URL=https://integra-sgi-web.vercel.app',
      ...['SESSION_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM', 'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'].map(key => `${key}=fake`),
    ].join('\n'));
    writeFileSync(join(root, 'web-source/.vercel/.env.production.local'),
      'VITE_API_URL=/api/v1\nVERCEL_API_BYPASS_SECRET=fake-api-bypass');
    return spawnSync(process.execPath, [resolve('scripts/check-vercel-environment.mjs')], {
      encoding: 'utf8', env: { ...process.env, GITHUB_WORKSPACE: root, DEPLOY_BRANCH: 'main',
        API_DOMAIN: 'integra-sgi-api.vercel.app', WEB_DOMAIN: 'integra-sgi-web.vercel.app',
        API_BYPASS_SECRET: 'fake-api-bypass', DIRECT_URL: directUrl },
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('migration target must match the Vercel runtime configuration without leaking credentials', () => {
  const result = checkEnvironment('postgresql://other-sensitive-password@wrong.example.test/app');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /GitHub DIRECT_URL must point to the same database as Vercel DB_IDENTITY/);
  assert(!`${result.stdout}${result.stderr}`.includes('sensitive-password'));
});

test('consistent production URLs and variables pass the migration gate', () => {
  assert.equal(checkEnvironment('postgresql://sensitive-password@db.example.test/app').status, 0);
});

test('pooled host and query string still match the same database', () => {
  const url = 'postgresql://sensitive-password@db-pooler.example.test/app?sslmode=require&channel_binding=require';
  assert.equal(checkEnvironment(url).status, 0);
});

test('same host with a different database name is rejected', () => {
  const result = checkEnvironment('postgresql://sensitive-password@db.example.test/other');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must point to the same database as Vercel DB_IDENTITY/);
});

test('invalid DIRECT_URL fails without leaking its value', () => {
  const result = checkEnvironment('not-a-url-secret-value');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /GitHub DIRECT_URL is not a valid database URL/);
  assert(!`${result.stdout}${result.stderr}`.includes('secret-value'));
});
