import { setTimeout } from 'node:timers/promises';

const [url, kind] = process.argv.slice(2);
if (!url?.startsWith('https://') || !['api', 'web'].includes(kind)) {
  throw new Error('Usage: check-deployment-health.mjs https://host/path api|web');
}
const headers = process.env.HEALTH_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': process.env.HEALTH_BYPASS_SECRET }
  : {};
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    const response = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error('Unexpected HTTP status');
    if (kind === 'api') {
      if ((await response.json()).status !== 'ok') throw new Error('Unexpected API response');
    } else if (!(await response.text()).includes('id="root"')) {
      throw new Error('Unexpected web response');
    }
    console.log(`${kind} health check passed`);
    process.exit(0);
  } catch {
    console.log(`${kind} health check attempt ${attempt}/12 failed`);
    if (attempt < 12) await setTimeout(5000);
  }
}
process.exitCode = 1;
