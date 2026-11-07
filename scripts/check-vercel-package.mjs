import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const root = process.argv[2];
assert(root, 'Provide the API .vercel/output directory');
assert.equal(JSON.parse(readFileSync(join(root, 'config.json'), 'utf8')).version, 3);
function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
const paths = files(join(root, 'functions'));
assert(!paths.some(path => /\/\.env(?:\.|$)/.test(path)), 'Environment files must not be packaged');
const configs = paths.filter(path => path.endsWith('/.vc-config.json'));
assert(configs.length > 0, 'No packaged function found');
for (const config of configs) {
  const value = JSON.parse(readFileSync(config, 'utf8'));
  assert.equal(value.runtime, 'nodejs22.x', 'Configure Node 22.x in Vercel');
}
for (const [label, pattern] of [
  ['compiled Nest module', /\/dist\/app\.module\.js$/],
  ['generated Prisma client', /\/generated\/prisma\/client\.js$/],
  ['shared workspace', /\/(?:@integra\/shared|packages\/shared)\/dist\//],
  ['PostgreSQL driver', /\/node_modules\/pg\//],
  ['Argon2 native binding', /argon2.*\.node$/],
]) {
  assert(paths.some(path => pattern.test(path)), `Missing ${label} in API package`);
}
console.log('API package contains Nest, Prisma, shared workspace, pg and native Argon2');
