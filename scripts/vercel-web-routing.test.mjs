import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWebRoutingConfig } from './configure-vercel-web.mjs';

const baseConfig = {
  rewrites: [{ source: '/(.*)', destination: '/index.html' }],
  framework: 'vite',
};

test('routes API requests through the stable Vercel API alias and injects its bypass secret server-side', () => {
  const config = createWebRoutingConfig(baseConfig, 'integra-sgi-api-git-homolog-example.vercel.app');

  assert.deepEqual(config.routes[0], {
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
  assert.deepEqual(config.routes[1], { handle: 'filesystem' });
  assert.deepEqual(config.routes[2], { src: '^(.*)$', dest: '/index.html' });
  assert.deepEqual(config.headers, [{
    source: '/api/:path*',
    headers: [{ key: 'x-vercel-enable-rewrite-caching', value: '0' }],
  }]);
  assert.equal(JSON.stringify(config).includes('secret-value'), false);
});

test('rejects API targets outside Vercel app domains', () => {
  assert.throws(() => createWebRoutingConfig(baseConfig, 'api.example.com'), /must be a Vercel app domain/);
  assert.throws(() => createWebRoutingConfig(baseConfig, 'https://api.vercel.app'), /must be a hostname/);
});
