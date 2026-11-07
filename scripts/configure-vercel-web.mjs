import { readFileSync, writeFileSync } from 'node:fs';

// Sent with every web response. The SPA loads only its own bundle; profile photos come from the
// signed Neon Storage URLs, and nothing may frame the app (clickjacking).
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.neon.tech",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // Isolates the window from pages it opens. COEP is left out: it would block profile photos from Neon Storage.
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export const ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

export function createWebRoutingConfig(baseConfig, apiDomain) {
  let parsed;
  try {
    parsed = new URL(`https://${apiDomain}`);
  } catch {
    throw new Error('API_DOMAIN must be a hostname');
  }
  if (parsed.hostname !== apiDomain) throw new Error('API_DOMAIN must be a hostname without a scheme or path');
  if (!parsed.hostname.endsWith('.vercel.app') || parsed.hostname === 'vercel.app') {
    throw new Error('API_DOMAIN must be a Vercel app domain');
  }

  const { rewrites: _rewrites, routes: _routes, ...projectConfig } = baseConfig;
  return {
    ...projectConfig,
    routes: [
      // `routes` cannot be combined with reliable `headers` matching, so a first pass sets them.
      { src: '^/(.*)$', headers: SECURITY_HEADERS, continue: true },
      // Vite puts only content-hashed files in /assets, so a browser may keep them for good.
      { src: '^/assets/(.*)$', headers: { 'Cache-Control': ASSET_CACHE_CONTROL }, continue: true },
      {
        src: '^/api/(.*)$',
        dest: `https://${parsed.hostname}/api/$1`,
        transforms: [{
          type: 'request.headers',
          op: 'set',
          target: { key: 'x-vercel-protection-bypass' },
          args: '$VERCEL_API_BYPASS_SECRET',
          env: ['VERCEL_API_BYPASS_SECRET'],
        }],
      },
      { handle: 'filesystem' },
      // A hash from an older deploy must not fall through to index.html under the immutable header.
      { src: '^/assets/(.*)$', status: 404, headers: { 'Cache-Control': 'no-store' } },
      { src: '^(.*)$', dest: '/index.html' },
    ],
    headers: [
      ...(projectConfig.headers ?? []),
      {
        source: '/api/:path*',
        headers: [{ key: 'x-vercel-enable-rewrite-caching', value: '0' }],
      },
    ],
  };
}

if (process.argv[1]?.endsWith('/configure-vercel-web.mjs')) {
  const [configPath, apiDomain] = process.argv.slice(2);
  if (!configPath || !apiDomain) {
    throw new Error('Usage: node scripts/configure-vercel-web.mjs <frontend/vercel.json> <api-domain>');
  }
  const baseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  const configured = createWebRoutingConfig(baseConfig, apiDomain);
  writeFileSync(configPath, `${JSON.stringify(configured, null, 2)}\n`);
}
