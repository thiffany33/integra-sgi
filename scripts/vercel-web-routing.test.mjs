import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SECURITY_HEADERS, createWebRoutingConfig } from './configure-vercel-web.mjs';

const baseConfig = {
  rewrites: [{ source: '/(.*)', destination: '/index.html' }],
  framework: 'vite',
};

test('routes API requests through the stable Vercel API alias and injects its bypass secret server-side', () => {
  const config = createWebRoutingConfig(baseConfig, 'integra-sgi-api-git-homolog-example.vercel.app');

  assert.deepEqual(config.routes[1], {
    src: '^/api/(.*)$',
    dest: 'https://integra-sgi-api-git-homolog-example.vercel.app/api/$1',
    transforms: [{
      type: 'request.headers',
      op: 'set',
      target: { key: 'x-vercel-protection-bypass' },
      args: '$VERCEL_API_BYPASS_SECRET',
      env: ['VERCEL_API_BYPASS_SECRET'],
    }],
  });
  assert.deepEqual(config.routes[2], { handle: 'filesystem' });
  assert.deepEqual(config.routes[3], { src: '^(.*)$', dest: '/index.html' });
  assert.deepEqual(config.headers, [{
    source: '/api/:path*',
    headers: [{ key: 'x-vercel-enable-rewrite-caching', value: '0' }],
  }]);
  assert.equal(JSON.stringify(config).includes('secret-value'), false);
});

test('every web response carries the security headers before any other route', () => {
  const config = createWebRoutingConfig(baseConfig, 'integra-sgi-api.vercel.app');
  assert.deepEqual(config.routes[0], { src: '^/(.*)$', headers: SECURITY_HEADERS, continue: true });
  const csp = SECURITY_HEADERS['Content-Security-Policy'];
  for (const directive of ["frame-ancestors 'none'", "script-src 'self'", "object-src 'none'", 'img-src \'self\' data: https://*.neon.tech']) {
    assert.ok(csp.includes(directive), directive);
  }
  assert.equal(SECURITY_HEADERS['X-Frame-Options'], 'DENY');
  assert.equal(SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff');
});

test('rejects API targets outside Vercel app domains', () => {
  assert.throws(() => createWebRoutingConfig(baseConfig, 'api.example.com'), /must be a Vercel app domain/);
  assert.throws(() => createWebRoutingConfig(baseConfig, 'https://api.vercel.app'), /must be a hostname/);
});
