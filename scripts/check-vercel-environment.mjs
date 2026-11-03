import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

const target = process.env.DEPLOY_BRANCH === 'main' ? 'production' : 'preview';
const appEnv = target === 'production' ? 'production' : 'homolog';
const root = process.env.GITHUB_WORKSPACE;
const api = parse(readFileSync(`${root}/api-source/.vercel/.env.${target}.local`));
const web = parse(readFileSync(`${root}/web-source/.vercel/.env.${target}.local`));

// Do not print values: assert.equal would include secrets in its failure output.
function check(condition, message) {
  assert(condition, message);
}

// Reduces a Postgres URL to "host/database", ignoring credentials, query string
// and Neon's "-pooler" suffix, so pooled and direct URLs of the same branch match.
// Uses a regex instead of new URL() so passwords with special characters, stray
// quotes or whitespace do not break parsing. Errors never include the raw value:
// only the scheme (when "://" exists) and the length are reported.
function dbIdentity(url, label) {
  const cleaned = String(url).trim().replace(/^['"]|['"]$/g, '');
  const match = cleaned.match(/^postgres(?:ql)?:\/\/(?:.*@)?([^/:?#]+)(?::\d+)?\/([^?#]+)/);
  if (!match) {
    const scheme = cleaned.includes('://')
      ? cleaned.split('://')[0].slice(0, 25).replace(/[^\w+.-]/g, '?')
      : 'none';
    throw new assert.AssertionError({
      message: `${label} is not a valid database URL (scheme: "${scheme}", len: ${cleaned.length})`,
    });
  }
  const [, host, db] = match;
  return `${host.replace('-pooler', '')}/${db}`;
}

check(Boolean(process.env.DIRECT_URL), 'GitHub DIRECT_URL is required');
check(Boolean(api.DATABASE_URL), 'Vercel DATABASE_URL is required');

// TEMPORARY DIAGNOSTIC: remove after finding why Vercel DATABASE_URL is rejected.
// Prints only shape information, never host, user or password.
const v = String(api.DATABASE_URL);
console.log('len:', v.length);
console.log('scheme:', v.includes('://') ? JSON.stringify(v.split('://')[0].slice(0, 25)) : 'none');
console.log('has "://":', v.includes('://'));
console.log('contains "DATABASE_URL=":', v.includes('DATABASE_URL='));
console.log('has newline:', /[\r\n]/.test(v));
console.log('has "@":', v.includes('@'));
console.log('path after host:', /:\/\/[^/]*\/[^?#\s]+/.test(v));

// Sensitive Vercel variables are never written by `vercel pull`, so we cannot
// compare DIRECT_URL strings. Instead, verify that migrations (GitHub DIRECT_URL)
// and the app (Vercel DATABASE_URL) point to the same Neon host + database.
check(
  dbIdentity(api.DATABASE_URL, 'Vercel DATABASE_URL') ===
    dbIdentity(process.env.DIRECT_URL, 'GitHub DIRECT_URL'),
  'GitHub DIRECT_URL must point to the same database as Vercel DATABASE_URL',
);

check(api.APP_ENV === appEnv, 'Incorrect API APP_ENV');
check(api.NODE_ENV === 'production', 'API NODE_ENV must be production');
check(api.APP_URL === `https://${process.env.WEB_DOMAIN}`, 'APP_URL must use the stable web domain');
check(api.FRONTEND_URL === api.APP_URL, 'FRONTEND_URL must match APP_URL');
check(web.VITE_API_URL === '/api/v1', 'VITE_API_URL must use the same-origin API proxy');
check(Boolean(process.env.API_BYPASS_SECRET), 'GitHub API bypass secret is required');
check(
  web.VERCEL_API_BYPASS_SECRET === process.env.API_BYPASS_SECRET,
  'Web Vercel API bypass secret must match the GitHub Environment secret',
);

for (const key of [
  'DATABASE_URL',
  'SESSION_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
]) {
  check(Boolean(api[key]), `Missing API variable: ${key}`);
}

console.log('Deployment environment and migration target are consistent');
