/**
 * Vercel Edge Middleware — same-origin API proxy.
 *
 * Runs on Vercel's edge network before any rewrite rules.
 * Intercepts every /api/v1/* request and forwards it to the real API
 * backend, injecting the Vercel protection-bypass secret so that
 * Vercel Authentication on the API deployment is never triggered
 * from the browser.
 *
 * In local development this file is never executed; Vite's dev server
 * is configured with a proxy in vite.config.ts instead.
 */

export const config = {
  matcher: '/api/v1/:path*',
  runtime: 'nodejs',
};

export default async function middleware(request: Request): Promise<Response> {
  const apiOrigin = process.env.API_ORIGIN;

  // API_ORIGIN is only set in deployed Vercel environments.
  // During local dev Vite handles the proxy, so this should never be reached.
  if (!apiOrigin) {
    return new Response(JSON.stringify({ error: 'API_ORIGIN is not configured.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, apiOrigin);

  const headers = new Headers(request.headers);
  // Remove the forwarded host so the API sees its own hostname.
  headers.delete('host');

  // Bypass Vercel Authentication on the API deployment.
  const bypassSecret = process.env.VERCEL_API_BYPASS_SECRET;
  if (bypassSecret) {
    headers.set('x-vercel-protection-bypass', bypassSecret);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const response = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Required for streaming request bodies (e.g. file uploads).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit);

  return response;
}
