import { config } from 'zod';

// The site's CSP forbids eval. Without this, Zod probes `new Function` on startup, which the
// browser reports as a CSP violation on every page even though Zod then falls back safely.
config({ jitless: true });
