// ── Cloudflare Pages Function: token-refresh ────────────────────────────────
// Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your 
// Cloudflare Pages Dashboard -> Settings -> Environment Variables.
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

  // ── Parse body ────────────────────────────────────────────────────────────
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
        client_id:     env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type:    'refresh_token',
      }),
    });
  } catch (err) {
    return jsonError('Google token endpoint unreachable: ' + err.message, 502, request);
  }

  const googleData = await googleRes.json();

  if (!googleRes.ok || !googleData.access_token) {
    // Don't leak Google's raw error message — just pass the error field
    return new Response(
      JSON.stringify({ error: googleData.error || 'token_refresh_failed' }),
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
  // Reflect the origin so the browser accepts the response.
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
