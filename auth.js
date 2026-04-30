// ── auth.js — Google OAuth via Supabase (Drive Edition) ──────────────────────

const SUPABASE_URL = "https://dvaqqcqvgletpuqmfsxz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YXFxY3F2Z2xldHB1cW1mc3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTE4NzAsImV4cCI6MjA5MTI4Nzg3MH0.gLNT7QEVD7UJB7RT0hgpNCXIHYQXoNhW0_7kbYmDu4Q";

window.SUPABASE_URL      = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.currentUser       = null;

let _authReadyResolve;
window.authReady = new Promise(res => { _authReadyResolve = res; });
let _supabase = null;

// ── DOM Listeners & Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn  = document.getElementById('google-login-btn');
  const signOutBtn = document.getElementById('sign-out-btn');

  if (loginBtn)   loginBtn.addEventListener('click', signInWithGoogle);
  if (signOutBtn) signOutBtn.addEventListener('click', signOut);

  if (window.supabase) {
    initAuth();
  } else {
    setAuthStatus('Network blocked library load. Refresh.', 'err');
    _authReadyResolve(null);
  }
});

// CLOUDPHONE FIX: Enter key on auth screen triggers sign-in
document.addEventListener('keydown', (e) => {
  const authScreen = document.getElementById('auth-screen');
  if (authScreen && window.getComputedStyle(authScreen).display !== 'none') {
    if (e.key === 'Enter') { e.preventDefault(); signInWithGoogle(); }
  }
});

async function initAuth() {
  _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: sessionData } = await _supabase.auth.getSession();
  const session = sessionData?.session;

  if (session?.user) {
    // Check if this session has Drive scopes (provider_token present)
    if (!session.provider_token) {
      // Old session without Drive scopes — force re-auth
      dbgAuth('Session missing provider_token — needs re-auth for Drive scopes');
      await _supabase.auth.signOut();
      showAuthScreen();
      setAuthStatus('Please sign in again to enable Drive access.', 'err');
      _authReadyResolve(null);
      return;
    }
    window._providerToken = session.provider_token;
    window._providerRefreshToken = session.provider_refresh_token || null;
    handleSignedIn(session.user);
  } else {
    showAuthScreen();
    _authReadyResolve(null);
  }

  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      window._providerToken = session.provider_token || null;
      window._providerRefreshToken = session.provider_refresh_token || null;
      handleSignedIn(session.user);
    } else if (event === 'SIGNED_OUT') {
      handleSignedOut();
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Update provider token if it changed
      if (session.provider_token) {
        window._providerToken = session.provider_token;
        dbgAuth('Provider token refreshed');
      }
    }
  });
}

// ── Handlers ─────────────────────────────────────────────────────────────────
function handleSignedIn(user) {
  window.currentUser = {
    id:    user.id,
    email: user.email,
    name:  user.user_metadata?.full_name || user.email.split('@')[0]
  };
  window._supabaseClient = _supabase;
  dbgAuth('Signed in: ' + window.currentUser.name);
  dbgAuth('provider_token present: ' + !!window._providerToken);
  dbgAuth('provider_refresh_token present: ' + !!window._providerRefreshToken);
  hideAuthScreen();
  showUserBar();
  _authReadyResolve(window.currentUser);

  if (typeof window.onAuthSuccess === 'function') window.onAuthSuccess(window.currentUser);
}

function handleSignedOut() {
  window.currentUser       = null;
  window._providerToken    = null;
  window._providerRefreshToken = null;
  dbgAuth('Signed out');
  showAuthScreen();
  document.getElementById('selector').style.display        = 'none';
  document.getElementById('emulator-screen').style.display = 'none';
}

// ── Google sign-in — requests Drive scopes ───────────────────────────────────
async function signInWithGoogle() {
  if (!_supabase) { setAuthStatus('Auth not ready', 'err'); return; }
  setAuthStatus('Opening Google sign-in...', '');
  try {
    const { error } = await _supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // drive.readonly  = browse & download ROMs from user's Drive folders
        // drive.appdata   = read/write save states in hidden app folder
        scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.appdata',
        redirectTo: window.location.href.split('#')[0].split('?')[0],
        queryParams: {
          access_type: 'offline', // get a refresh_token so Drive access survives past 1hr
        },
      }
    });
    if (error) throw error;
  } catch (err) {
    dbgAuth('OAuth ERR: ' + err.message);
    setAuthStatus('Sign-in failed: ' + err.message, 'err');
  }
}

// ── Sign-out ──────────────────────────────────────────────────────────────────
async function signOut() {
  if (!_supabase) return;
  await _supabase.auth.signOut();
}

// ── Get a valid Drive token, refreshing if needed ────────────────────────────
// Call this before every Drive API request instead of reading window._providerToken directly
async function getDriveToken() {
  if (!_supabase) return null;

  // Try current token first (fast path)
  if (window._providerToken) return window._providerToken;

  // No token — try session refresh
  dbgAuth('No provider_token, attempting session refresh');
  try {
    const { data, error } = await _supabase.auth.refreshSession();
    if (error) throw error;
    if (data?.session?.provider_token) {
      window._providerToken = data.session.provider_token;
      dbgAuth('Token refreshed OK');
      return window._providerToken;
    }
  } catch (err) {
    dbgAuth('Token refresh ERR: ' + err.message);
  }
  return null;
}
window.getDriveToken = getDriveToken;

// Helper: makes a Drive API fetch, retries once after token refresh on 401
async function driveApiFetch(url, options = {}) {
  let token = await getDriveToken();
  if (!token) throw new Error('No Drive token available — please sign out and sign in again');

  const doFetch = (t) => fetch(url, {
    ...options,
    headers: { 'Authorization': 'Bearer ' + t, ...(options.headers || {}) }
  });

  let res = await doFetch(token);

  if (res.status === 401) {
    dbgAuth('Drive 401 — refreshing token and retrying');
    window._providerToken = null; // force refresh
    token = await getDriveToken();
    if (!token) throw new Error('Drive re-auth failed — please sign out and sign in again');
    res = await doFetch(token);
  }

  if (res.status === 403) {
    const body = await res.clone().json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason || '';
    if (reason === 'insufficientPermissions') {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }
  }

  return res;
}
window.driveApiFetch = driveApiFetch;

// Legacy Supabase token getter (still used by old save helpers during transition)
async function getAuthToken() {
  if (!_supabase) return SUPABASE_ANON_KEY;
  const { data } = await _supabase.auth.getSession();
  return data?.session?.access_token || SUPABASE_ANON_KEY;
}
window.getAuthToken = getAuthToken;

// ── UI helpers ────────────────────────────────────────────────────────────────
function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex';
  setTimeout(() => {
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) loginBtn.focus();
  }, 100);
}
function hideAuthScreen() { document.getElementById('auth-screen').style.display = 'none'; }

function showUserBar() {
  const bar = document.getElementById('auth-user-bar');
  if (!bar || !window.currentUser) return;
  bar.querySelector('.auth-user-name').textContent = window.currentUser.name.toUpperCase();
  bar.style.display = 'flex';
}

function setAuthStatus(msg, cls) {
  const el = document.getElementById('auth-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-status' + (cls ? ' ' + cls : '');
}

function dbgAuth(msg) {
  if (typeof dbg === 'function') dbg('[AUTH] ' + msg);
  else console.log('[AUTH]', msg);
}
