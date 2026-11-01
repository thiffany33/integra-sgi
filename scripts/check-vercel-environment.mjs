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
check(Boolean(process.env.DIRECT_URL), 'GitHub DIRECT_URL is required');
check(api.DIRECT_URL === process.env.DIRECT_URL, 'GitHub and Vercel DIRECT_URL must match');
check(api.APP_ENV === appEnv, 'Incorrect API APP_ENV');
check(api.NODE_ENV === 'production', 'API NODE_ENV must be production');
check(api.APP_URL === `https://${process.env.WEB_DOMAIN}`, 'APP_URL must use the stable web domain');
check(api.FRONTEND_URL === api.APP_URL, 'FRONTEND_URL must match APP_URL');
check(web.VITE_API_URL === `https://${process.env.API_DOMAIN}/api/v1`, 'VITE_API_URL must use the stable API domain');
for (const key of ['DATABASE_URL', 'SESSION_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION']) {
  check(Boolean(api[key]), `Missing API variable: ${key}`);
}
console.log('Deployment environment and migration target are consistent');
