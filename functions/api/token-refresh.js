// ── Cloudflare Pages Function: token-refresh (Auto-Sanitizing) ──────────────
// This version automatically strips hidden leading/trailing spaces at runtime.
// ────────────────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(request),
      status: 204,
    });
  }

  if (request.method !== 'POST') {
    return jsonError('Method not allowed', 405, request);
  }

  // ── Environment Verification ──────────────────────────────────────────────
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return jsonError(
      `CONFIG ERROR: Missing environment variables. ID: ${!!env.GOOGLE_CLIENT_ID}, Secret: ${!!env.GOOGLE_CLIENT_SECRET}`,
      401,
      request
    );
  }

  if (env.GOOGLE_CLIENT_ID === 'undefined' || env.GOOGLE_CLIENT_SECRET === 'undefined') {
    return jsonError("CONFIG ERROR: Environment variables evaluated as literal 'undefined' string.", 401, request);
  }

  // ── Auto-Sanitization Step ────────────────────────────────────────────────
  // Automatically strips out quote marks or whitespace traps from the dashboard
  const cleanClientId = env.GOOGLE_CLIENT_ID.replace(/['"]/g, '').trim();
  const cleanClientSecret = env.GOOGLE_CLIENT_SECRET.replace(/['"]/g, '').trim();

  // ── Parse Body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400, request);
  }

  const { refresh_token } = body;
  if (!refresh_token || typeof refresh_token !== 'string') {
    return jsonError('Missing refresh_token', 400, request);
  }

  // ── Exchange with Google ──────────────────────────────────────────────────
  let googleRes;
  try {
    googleRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     cleanClientId,
        client_secret: cleanClientSecret,
        refresh_token: refresh_token,
        grant_type:    'refresh_token',
      }),
    });
  } catch (err) {
    return jsonError('Google token endpoint unreachable: ' + err.message, 502, request);
  }

  const googleData = await googleRes.json();

  if (!googleRes.ok || !googleData.access_token) {
    return new Response(
      JSON.stringify({ 
        error: googleData.error || 'token_refresh_failed',
        details: googleData.error_description || 'No description provided'
      }),
      {
        status: googleRes.status || 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
      }
    );
  }

  // ── Return fresh token ────────────────────────────────────────────────────
  return new Response(
    JSON.stringify({
      access_token: googleData.access_token,
      expires_in:   googleData.expires_in || 3600,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    }
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  };
}

function jsonError(message, status, request) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    }
  );
}
