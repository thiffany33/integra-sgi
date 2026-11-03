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
// Errors never include the raw value: only the scheme (when "://" exists) and length.
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

// `vercel pull` masks Sensitive variables, so neither DIRECT_URL nor DATABASE_URL
// can be compared from the pulled file. DB_IDENTITY is a NON-sensitive Vercel
// variable holding only "host/database" (no user, no password), e.g.
// ep-xxxx.region.aws.neon.tech/neondb. It must match the migration target.
check(Boolean(api.DB_IDENTITY), 'Vercel DB_IDENTITY (host/database, non-sensitive) is required');
check(
  api.DB_IDENTITY.trim().toLowerCase().replace('-pooler', '') ===
    dbIdentity(process.env.DIRECT_URL, 'GitHub DIRECT_URL').toLowerCase(),
  'GitHub DIRECT_URL must point to the same database as Vercel DB_IDENTITY',
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
