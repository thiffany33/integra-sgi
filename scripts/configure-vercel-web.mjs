import { readFileSync, writeFileSync } from 'node:fs';

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
