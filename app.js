'use strict';
// ── app.js — RetroEmu CloudPhone Edition ─────────────────────────────────────

// ══════════════════════════════════════════════════════════════
// SCREEN CLASS DETECTION
// ══════════════════════════════════════════════════════════════
const _SW = window.screen.width;
const _SH = window.screen.height;

const SCREEN = {
  w: _SW,
  h: _SH,
  isSmall: Math.min(_SW, _SH) <= 160,
  toString() {
    return `${_SW}×${_SH} (${this.isSmall ? 'small' : 'standard'})`;
  },
};

// ══════════════════════════════════════════════════════════════
// SYSTEM REGISTRY
// ══════════════════════════════════════════════════════════════
const SYSTEMS = {
  gbc:     { core: 'gambatte',     exts: ['.gbc', '.gb'],          label: 'GBC',  cls: 'gbc',  landscape: false, smallLandscape: true },
  gba:     { core: 'mgba',         exts: ['.gba'],                 label: 'GBA',  cls: 'gba',  landscape: false, smallLandscape: true },
  nes:     { core: 'nestopia',     exts: ['.nes'],                 label: 'NES',  cls: 'nes',  landscape: true,  smallLandscape: true },
  snes:    { core: 'snes9x',       exts: ['.sfc', '.smc'],         label: 'SNES', cls: 'snes', landscape: true,  smallLandscape: true },
  psx:     { core: 'pcsx_rearmed', exts: ['.chd'],                 label: 'PS1',  cls: 'ps1',  landscape: true,  smallLandscape: true },
  gg:      { core: 'segaGG',       exts: ['.gg'],                  label: 'GG',   cls: 'gg',   landscape: false, smallLandscape: true },
  sms:     { core: 'segaMS',       exts: ['.sms'],                 label: 'SMS',  cls: 'sms',  landscape: true,  smallLandscape: true },
  genesis: { core: 'segaMD',       exts: ['.md', '.bin', '.gen'],  label: 'GEN',  cls: 'gen',  landscape: true,  smallLandscape: true },
};

const SYS_COLORS = {
  gbc: '#7cfc00',
  gba: '#ffd700',
  nes: '#ff6b6b',
  snes: '#a78bfa',
  psx: '#60a5fa',
  gg: '#fb923c',
  sms: '#f87171',
  genesis: '#e879f9',
};

const SYS_ORDER = ['gbc', 'gba', 'nes', 'snes', 'psx', 'genesis', 'sms', 'gg'];

function _resolveLandscape(sys) {
  if (SCREEN.isSmall) return sys.smallLandscape !== undefined ? sys.smallLandscape : sys.landscape;
  return sys.landscape;
}

// ══════════════════════════════════════════════════════════════
// CONTROLS
// ══════════════════════════════════════════════════════════════
function _pad(dpad, { a, b, x = '', y = '', start, select, l = '', r = '', l2 = '', r2 = '' }) {
  return {
    0: { value: b },
    1: { value: y },
    2: { value: select },
    3: { value: start },
    4: { value: dpad[0] },
    5: { value: dpad[1] },
    6: { value: dpad[2] },
    7: { value: dpad[3] },
    8: { value: a },
    9: { value: x },
    10: { value: l },
    11: { value: r },
    12: { value: l2 },
    13: { value: r2 },
    14: { value: '' },
    15: { value: '' },
    24: { value: '' },
    25: { value: '' },
    26: { value: '' },
    27: { value: '' },
    28: { value: '' },
    29: { value: '' },
  };
}

const _P = ['up arrow', 'down arrow', 'left arrow', 'right arrow'];
const _L = ['right arrow', 'left arrow', 'up arrow', 'down arrow'];

const _BTNS = {
  a: 'enter',
  b: '1',
  start: 'escape',
  select: '3',
};

const _BTNS_EXT = {
  ..._BTNS,
  x: '4',
  y: '2',
  l: '5',
  r: '6',
};

const CONTROLS = {
  gambatte:     { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS) },
  mgba:         { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  nestopia:     { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS) },
  snes9x:       { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  pcsx_rearmed: { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  gearsystem:   { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS) },
  segaMS:       { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS) },
  segaMD:       { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
};

function getControls(core, landscape) {
  const set = CONTROLS[core] || CONTROLS['gambatte'];
  return landscape ? set.landscape : set.portrait;
}

// ══════════════════════════════════════════════════════════════
// KEYBIND DEFINITIONS
// ══════════════════════════════════════════════════════════════
const _KP = [
  { key: '↑↓←→', action: 'D-PAD' },
  { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' },
  { key: 'ESC', action: 'START' },
  { key: '3', action: 'SELECT' },
];

const _KP_EXT = [
  ..._KP,
  { key: '2', action: 'Y' },
  { key: '4', action: 'X' },
  { key: '5', action: 'L' },
  { key: '6', action: 'R' },
];

const _KL = [
  { key: '↑', action: '→ RIGHT' },
  { key: '↓', action: '→ LEFT' },
  { key: '←', action: '→ UP' },
  { key: '→', action: '→ DOWN' },
  { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' },
  { key: 'ESC', action: 'START' },
  { key: '3', action: 'SELECT' },
  { key: '2', action: 'Y' },
  { key: '4', action: 'X' },
  { key: '5', action: 'L' },
  { key: '6', action: 'R' },
];

const _KL_GEN = [
  { key: '↑', action: '→ RIGHT' },
  { key: '↓', action: '→ LEFT' },
  { key: '←', action: '→ UP' },
  { key: '→', action: '→ DOWN' },
  { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' },
  { key: '4', action: 'C' },
  { key: '5', action: 'X' },
  { key: '6', action: 'Y/Z' },
  { key: 'ESC', action: 'START' },
  { key: '3', action: 'MODE' },
];

const _KP_GEN = [
  { key: '↑↓←→', action: 'D-PAD' },
  { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' },
  { key: '4', action: 'C' },
  { key: '5', action: 'X' },
  { key: '6', action: 'Y/Z' },
  { key: 'ESC', action: 'START' },
  { key: '3', action: 'MODE' },
];

const _KMETA = [
  { section: true, label: 'SYSTEM' },
  { key: '7', action: 'LOAD STATE' },
  { key: '9', action: 'SAVE STATE' },
  { key: '0', action: 'CONTROLS' },
  { key: 'RSK', action: 'EXIT' },
];

function getKeybinds(rom) {
  const ls = rom.landscape;

  switch (rom.folder) {
    case 'gbc':
      return [...(ls ? _KL : _KP), ..._KMETA];
    case 'gba':
      return [..._KP, ..._KMETA];
    case 'gg':
      return [...(ls ? _KL_GEN : _KP_GEN), ..._KMETA];
    case 'sms':
      return [...(ls ? _KL : _KP), ..._KMETA];
    case 'genesis':
      return [..._KL_GEN, ..._KMETA];
    case 'nes':
    case 'snes':
    case 'psx':
      return [..._KL, ..._KMETA];
    default:
      return [..._KP, ..._KMETA];
  }
}

function _genericKeybinds() {
  return [
    { section: true, label: 'PORTRAIT SYSTEMS' },
    { key: '↑↓←→', action: 'D-PAD' },
    { key: 'ENTER', action: 'A' },
    { key: '1', action: 'B' },
    { key: '2', action: 'Y' },
    { key: '4', action: 'X' },
    { key: 'ESC', action: 'START' },
    { key: '3', action: 'SELECT' },
    { key: '5', action: 'L' },
    { key: '6', action: 'R' },

    { section: true, label: 'LANDSCAPE — D-PAD REMAPPED' },
    { key: '↑', action: '→ RIGHT' },
    { key: '↓', action: '→ LEFT' },
    { key: '←', action: '→ UP' },
    { key: '→', action: '→ DOWN' },
    ..._KMETA,
  ];
}

// ══════════════════════════════════════════════════════════════
// DRIVE CONFIG
// ══════════════════════════════════════════════════════════════
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

// Folder created by the app (drive.file) to store visible battery saves.
const SAVE_FOLDER_NAME = 'cloudphone-emulator-saves';

// ── Google Picker API key ─────────────────────────
const PICKER_API_KEY = 'AIzaSyBXEs-NFca5LOW0Y-mzn48hvTuCGR1pIF4';

// ── Google OAuth Web Client ID — SAME Cloud project as PICKER_API_KEY / setAppId.
const GOOGLE_OAUTH_CLIENT_ID = '924408688373-brjd67ahhkib1s3d5cplpaamscb3loe1.apps.googleusercontent.com';

// ── File classification ────────────────────────────────────────────────────────
// Extension → system.
const SYSTEM_BY_EXT = {
  '.gb': 'gbc',
  '.gbc': 'gbc',
  '.gba': 'gba',
  '.nes': 'nes',
  '.sfc': 'snes',
  '.smc': 'snes',
  '.chd': 'psx',
  '.gg': 'gg',
  '.sms': 'sms',
  '.md': 'genesis',
  '.gen': 'genesis',
  '.bin': 'genesis',
};

// ── BIOS classification & registry ───────────────────────────────────────────
// Recognized SCPH regional revisions plus a couple of generic BIOS names.
const PSX_BIOS_NAMES = [
  'scph1001.bin',
  'scph1000.bin',
  'scph1002.bin',
  'scph101.bin',
  'scph5500.bin',
  'scph5501.bin',
  'scph5502.bin',
  'scph7000.bin',
  'scph7001.bin',
  'scph7002.bin',
  'scph9001.bin',
];

const BIOS_FILENAMES = new Set([
  ...PSX_BIOS_NAMES,
  'gba_bios.bin',
  'bios.bin',
]);

// Which cores need which BIOS files.
// expectedBytes is used to warn on truncated/corrupted dumps that can boot
// fine but break BIOS-level features like the memory-card manager.
const BIOS_REGISTRY = {
  pcsx_rearmed: [{
    names: PSX_BIOS_NAMES,
    preferred: 'scph1001.bin',
    ejsVar: 'EJS_biosUrl',
    required: true,
    expectedBytes: 524288, // 512KB standard PS1 BIOS size
  }],
};

// Trim + lowercase + strip all spaces, used for case/space-insensitive name comparisons.
function _normName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, '');
}

// BIOS-specific normalization: also ignore - and _ so SCPH-1001.bin / SCPH_1001.bin work.
function _normBiosName(name) {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

// Accept exact known BIOS names plus common PSX BIOS variants/typos:
// scph1001.bin, SCPH-1001.bin, SCPH_1001.bin, spch1001.bin, scpx1001.bin, etc.
function _isPsxBiosName(name) {
  const n = _normBiosName(name);
  if (!n) return false;

  if (PSX_BIOS_NAMES.some(x => _normBiosName(x) === n)) return true;

  return /^(scph|spch|scpx|scp)\d{3,5}.*\.bin$/.test(n);
}

// ══════════════════════════════════════════════════════════════
// CACHE
// romIndex is persisted to appDataFolder as JSON.
// All Drive file IDs (ROMs, saves, BIOS) live in the index —
// no folder scanning ever happens at runtime.
// ══════════════════════════════════════════════════════════════
const _cache = {
  romIndex: null,    // { version, saveFolderId, roms[], saves[], bios[] }
  indexFileId: null, // appDataFolder file ID for the index JSON
  romBlobs: {},      // driveFileId → objectURL (cached ROM downloads)
  biosBlobs: {},     // driveFileId → objectURL (cached BIOS downloads)
};

// ══════════════════════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════════════════════
let ROMS = [];
let _filteredRoms = [];
let _activeCategory = 'all';
let _romIndex = 0;
let _currentSlot = 0;
const MAX_SLOTS = 4;
let _currentRom = null;
let _saveConfirmPending = false;
let _isLandscape = false;
let _gapiReady = false;
let _romOptionsIndex = 0;
const _log = [];

// ══════════════════════════════════════════════════════════════
// LOGGING
// ══════════════════════════════════════════════════════════════
function dbg(msg) {
  const ts = new Date().toTimeString().slice(0, 8);
  _log.push('[' + ts + '] ' + msg);
  if (_log.length > 200) _log.shift();

  const el = document.getElementById('debug-log');
  if (el) {
    el.textContent = _log.join('\n');
    el.scrollTop = el.scrollHeight;
  }
}

function toggleDebug() {
  let el = document.getElementById('debug-overlay');

  if (!el) {
    el = document.createElement('div');
    el.id = 'debug-overlay';
    el.style.cssText =
      'position:fixed;top:0;left:0;z-index:999999;display:flex;flex-direction:column;' +
      'background:rgba(4,4,8,0.97);border:1px solid #00ff41;padding:0;font-family:monospace;color:#00ff41;' +
      (_isLandscape
        ? 'width:100vh;height:100vw;transform:rotate(90deg);transform-origin:top left;margin-left:100vw;'
        : 'width:100vw;height:100vh;');

    el.innerHTML =
      '<div style="color:#ffd700;letter-spacing:2px;padding:6px 8px;border-bottom:1px solid #1a1a30;flex-shrink:0;font-size:9px;">DEBUG — press 8 to close</div>' +
      '<pre id="debug-log" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;white-space:pre-wrap;word-break:break-all;margin:0;' +
      (_isLandscape ? 'font-size:7px;' : 'font-size:9px;') +
      'padding:6px 8px;"></pre>';

    document.body.appendChild(el);
  }

  const isVisible = el.style.display !== 'none';
  el.style.display = isVisible ? 'none' : 'flex';

  if (!isVisible) {
    const logEl = document.getElementById('debug-log');
    if (logEl) {
      logEl.textContent = _log.join('\n') || 'No logs yet.';
      setTimeout(() => {
        logEl.scrollTop = logEl.scrollHeight;
      }, 0);
    }
  }
}

function setLandscape(on) {
  _isLandscape = on;
  document.body.classList.toggle('landscape', on);
  dbg('Landscape: ' + on);
}

// ══════════════════════════════════════════════════════════════
// DRIVE API HELPERS
// Only the primitives needed with drive.file + drive.appdata.
// No folder scanning — everything goes through file IDs in the index.
// ══════════════════════════════════════════════════════════════
async function _driveGet(path) {
  const res = await window.driveApiFetch(DRIVE_API + path);
  if (!res.ok) throw new Error('Drive GET ' + path + ' → ' + res.status);
  return res.json();
}

async function driveCreateFolder(name, parentId) {
  const res = await window.driveApiFetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    }),
  });

  if (!res.ok) {
    dbg('driveCreateFolder ERR: ' + res.status);
    return null;
  }

  const data = await res.json();
  dbg('Created folder: ' + name + ' → ' + data.id);
  return data.id || null;
}

// Download a Drive file by ID, cache the object URL.
// Retries up to 3× with forced token refresh on auth errors.
async function driveDownloadBlob(fileId, cacheMap, label = 'file') {
  if (cacheMap[fileId]) return cacheMap[fileId];

  let lastErr;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);

      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (!buf || buf.byteLength === 0) throw new Error('Empty response body');

        dbg('Downloaded ' + label + ' (' + fileId + '): ' + buf.byteLength + 'B');

        const url = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }));
        cacheMap[fileId] = url;
        return url;
      }

      // 404 → file gone from Drive. Don't retry; surface clearly.
      if (res.status === 404) {
        throw new Error('File not found in Drive (404). It may have been deleted or moved. Open * → REMOVE FROM LIST, then re-add it with +.');
      }

      // Auth errors → force token refresh and retry
      if (res.status === 401 || res.status === 403) {
        dbg(label + ' download auth ' + res.status + ' (attempt ' + (attempt + 1) + ') — forcing token refresh');

        window._providerToken = null;
        const fresh = await window.getDriveToken();
        if (!fresh) throw new Error('Token refresh failed — sign out and sign in again.');

        lastErr = new Error('Auth error ' + res.status + ' (will retry)');
        await new Promise(r => setTimeout(r, 600));
        continue;
      }

      // Other 5xx / network → retry with backoff
      if (res.status >= 500) {
        lastErr = new Error('Drive server error ' + res.status);
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }

      // Anything else — bail
      throw new Error('Drive download HTTP ' + res.status);
    } catch (err) {
      // driveApiFetch itself can throw (network, INSUFFICIENT_PERMISSIONS, etc.)
      if (err.message === 'INSUFFICIENT_PERMISSIONS') {
        throw new Error('Insufficient permissions. Sign out and sign in again, then re-pick the file with +.');
      }

      lastErr = err;

      if (attempt < 2) {
        dbg(label + ' download retry in 1s: ' + err.message);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastErr || new Error(label + ' download failed');
}

// appDataFolder operations (drive.appdata scope — save states + index).
async function driveFindAppFile(filename) {
  const q = encodeURIComponent(`name='${filename}' and trashed=false`);
  const res = await window.driveApiFetch(`${DRIVE_API}/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`);

  if (!res.ok) return null;

  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function driveWriteAppFile(filename, bytes, existingId = null) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const boundary = 'emu_mp_boundary';

  if (existingId) {
    const res = await window.driveApiFetch(`${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: blob,
    });
    return res.ok;
  }

  const meta = JSON.stringify({
    name: filename,
    parents: ['appDataFolder'],
  });

  const pre =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;

  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);

  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(`${DRIVE_UPLOAD}/files?uploadType=multipart`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });

  return res.ok;
}

// Write bytes to a visible Drive file the app owns (drive.file).
// Used only for battery saves.
async function _driveWriteOwnedFile(fileId, bytes) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });

  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: blob,
    }
  );

  return res.ok;
}

// Create a new visible file in a folder the app owns.
async function _driveCreateOwnedFile(filename, parentId, bytes) {
  const boundary = 'emu_battery_boundary';

  const meta = JSON.stringify({
    name: filename,
    parents: [parentId],
  });

  const pre =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;

  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);

  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(`${DRIVE_UPLOAD}/files?uploadType=multipart`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.id || null;
}

// ══════════════════════════════════════════════════════════════
// PROACTIVE TOKEN REFRESH
// ══════════════════════════════════════════════════════════════
let _tokenLastRefreshed = Date.now();

async function _ensureFreshToken() {
  const AGE_MS = Date.now() - _tokenLastRefreshed;
  if (AGE_MS < 50 * 60 * 1000) return;

  dbg('Token age: ' + Math.round(AGE_MS / 60000) + 'min — proactive refresh');

  window._providerToken = null;
  const token = await window.getDriveToken();

  if (token) {
    _tokenLastRefreshed = Date.now();
    dbg('Proactive refresh OK');
  } else {
    dbg('Proactive refresh FAILED');
  }
}

function _markTokenFresh() {
  _tokenLastRefreshed = Date.now();
}

const _origOnAuthSuccess = window.onAuthSuccess;
window.onAuthSuccess = function(user) {
  _markTokenFresh();
  if (typeof _origOnAuthSuccess === 'function') _origOnAuthSuccess(user);
};

// ══════════════════════════════════════════════════════════════
// ROM INDEX — appDataFolder
// Single JSON blob storing all Drive file IDs.
// Structure: { version, saveFolderId, roms[], saves[], bios[] }
//   roms[]:  { id, name, file, system, core, label, cls, landscape }
//   saves[]: { id, romFile }  ← battery saves
//   bios[]:  { id, file }     ← BIOS files
// ══════════════════════════════════════════════════════════════
function _indexKey() {
  return (window.currentUser?.id || 'anon') + '_rom_index_v1';
}

function _emptyIndex() {
  return {
    version: 1,
    saveFolderId: null,
    roms: [],
    saves: [],
    bios: [],
  };
}

async function _loadRomIndex() {
  _setRomListMsg('LOADING...');

  try {
    const key = _indexKey();
    const fileId = await driveFindAppFile(key);

    if (!fileId) {
      _cache.indexFileId = null;
      _cache.romIndex = _emptyIndex();
      dbg('ROM index: not found — fresh start');
      _showEmptyState();
      return;
    }

    _cache.indexFileId = fileId;

    const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
    if (!res.ok) throw new Error('Index DL failed: ' + res.status);

    _cache.romIndex = await res.json();
    _cache.romIndex.roms = _cache.romIndex.roms || [];
    _cache.romIndex.saves = _cache.romIndex.saves || [];
    _cache.romIndex.bios = _cache.romIndex.bios || [];

    // Auto-fix: move any misclassified BIOS files from roms[] to bios[].
    const misclassifiedRoms = _cache.romIndex.roms.filter(r => {
      const { type } = _classifyPickedFile(r.file);
      return type === 'bios';
    });

    if (misclassifiedRoms.length > 0) {
      _cache.romIndex.roms = _cache.romIndex.roms.filter(r => {
        const { type } = _classifyPickedFile(r.file);
        return type !== 'bios';
      });

      for (const rom of misclassifiedRoms) {
        const existing = _cache.romIndex.bios.find(b => _normName(b.file) === _normName(rom.file));
        if (existing) {
          existing.id = rom.id;
        } else {
          _cache.romIndex.bios.push({ id: rom.id, file: rom.file });
        }
      }

      // If a BIOS file was previously imported as a battery save by mistake,
      // remove that bad save reference.
      const biosIds = new Set(_cache.romIndex.bios.map(b => b.id));
      _cache.romIndex.saves = _cache.romIndex.saves.filter(s => !biosIds.has(s.id));

      dbg('Auto-fixed ' + misclassifiedRoms.length + ' misclassified BIOS file(s)');
      await _saveRomIndex();
    }

    dbg(
      'ROM index: ' +
      _cache.romIndex.roms.length + ' ROMs / ' +
      _cache.romIndex.saves.length + ' saves / ' +
      _cache.romIndex.bios.length + ' BIOS'
    );

    _rebuildRomsFromIndex();

    if (ROMS.length === 0) _showEmptyState();
    else _buildRomList();

    // Trigger background validation.
    if (_cache.romIndex.roms.length > 0) {
      _validateRomIndex().then(() => {
        // Rebuild list again if any ghosts were removed.
        if (ROMS.length !== _cache.romIndex.roms.length) {
          _buildRomList();
        }
      });
    }
  } catch (err) {
    dbg('_loadRomIndex ERR: ' + err.message);
    _setRomListMsg('INDEX ERROR: ' + err.message);
  }
}

// ── Background Validation ────────────────────────────────────────
// Silently checks if ROMs still exist in Drive and removes ghosts.
async function _validateRomIndex() {
  if (!_cache.romIndex || _cache.romIndex.roms.length === 0) return;

  let removedCount = 0;
  const validRoms = [];

  for (const rom of _cache.romIndex.roms) {
    try {
      // We only request the id and trashed status to save bandwidth.
      const res = await window.driveApiFetch(`${DRIVE_API}/files/${rom.id}?fields=id,trashed&supportsAllDrives=true`);

      if (res.ok) {
        const data = await res.json();

        if (!data.trashed) {
          validRoms.push(rom); // File exists and is not in trash.
        } else {
          removedCount++; // File is in trash.
        }
      } else if (res.status === 404) {
        removedCount++; // File is completely gone.
      } else {
        validRoms.push(rom); // Transient error (5xx, etc.) — assume valid to be safe.
      }
    } catch (err) {
      validRoms.push(rom); // Network error — assume valid to be safe.
    }
  }

  if (removedCount > 0) {
    _cache.romIndex.roms = validRoms;
    await _saveRomIndex();
    _rebuildRomsFromIndex();

    dbg('Validation removed ' + removedCount + ' missing ROM(s)');
    _setSelectorStatus('REMOVED ' + removedCount + ' MISSING ROM' + (removedCount > 1 ? 'S' : ''));
  } else {
    dbg('Validation: All ROMs exist in Drive');
  }
}

async function _saveRomIndex() {
  if (!_cache.romIndex) return false;

  await _ensureFreshToken();

  const bytes = new TextEncoder().encode(JSON.stringify(_cache.romIndex));
  const ok = await driveWriteAppFile(_indexKey(), bytes, _cache.indexFileId || null);

  if (ok && !_cache.indexFileId) {
    _cache.indexFileId = await driveFindAppFile(_indexKey());
    dbg('ROM index: created → ' + _cache.indexFileId);
  } else {
    dbg('ROM index: ' + (ok ? 'saved OK' : 'save FAILED'));
  }

  return ok;
}

function _rebuildRomsFromIndex() {
  if (!_cache.romIndex) return;

  ROMS = _cache.romIndex.roms.map(r => ({
    name: r.name,
    file: r.file,
    fileId: r.id,
    core: r.core,
    label: r.label,
    cls: r.cls,
    landscape: r.landscape,
    system: r.system,
    folder: r.system, // alias — getKeybinds uses .folder
  }));
}

// Ensure the visible saves/ folder exists (created once, ID stored in index).
async function _ensureSaveFolder() {
  if (_cache.romIndex?.saveFolderId) return _cache.romIndex.saveFolderId;

  const folderId = await driveCreateFolder(SAVE_FOLDER_NAME, null);

  if (folderId && _cache.romIndex) {
    _cache.romIndex.saveFolderId = folderId;
    await _saveRomIndex();
  }

  return folderId || null;
}

// ══════════════════════════════════════════════════════════════
// FILE CLASSIFICATION
// ══════════════════════════════════════════════════════════════
function _classifyPickedFile(name) {
  const lower = _normName(name);
  const ext = lower.slice(lower.lastIndexOf('.'));

  const isBios =
    _isPsxBiosName(name) ||
    BIOS_FILENAMES.has(lower);

  if (ext === '.bin') {
    return isBios
      ? { type: 'bios', system: null }
      : { type: 'rom', system: 'genesis' };
  }

  if (isBios) return { type: 'bios', system: null };

  const system = SYSTEM_BY_EXT[ext];
  if (!system) return { type: 'unknown', system: null };

  return { type: 'rom', system };
}

// ══════════════════════════════════════════════════════════════
// GOOGLE PICKER
// ══════════════════════════════════════════════════════════════
async function _loadGapi() {
  if (_gapiReady) return;

  await new Promise((resolve, reject) => {
    if (window.gapi) {
      gapi.load('picker', {
        callback: () => {
          _gapiReady = true;
          resolve();
        },
        onerror: reject,
      });
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://apis.google.com/js/api.js';
    s.onload = () => gapi.load('picker', {
      callback: () => {
        _gapiReady = true;
        resolve();
      },
      onerror: reject,
    });
    s.onerror = () => reject(new Error('gapi script blocked — check network'));
    document.head.appendChild(s);
  });
}

// ── Google Identity Services — fresh pre-Picker reauth ──────────────────────
let _gisReady = false;

async function _loadGis() {
  if (_gisReady) return;

  await new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      _gisReady = true;
      resolve();
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => {
      _gisReady = true;
      resolve();
    };
    s.onerror = () => reject(new Error('GIS script blocked — check network'));
    document.head.appendChild(s);
  });
}

let _gisTokenClient = null;

function _refreshDriveAuthForPicker() {
  return new Promise((resolve) => {
    if (!GOOGLE_OAUTH_CLIENT_ID || GOOGLE_OAUTH_CLIENT_ID.startsWith('PUT_YOUR')) {
      dbg('GIS pre-picker reauth skipped');
      resolve(window._providerToken);
      return;
    }

    try {
      // Create a fresh client every time so the callback resolves the current Promise.
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (resp) => {
          if (resp?.access_token) {
            window._providerToken = resp.access_token;
            dbg('GIS pre-picker reauth OK — token refreshed');
            resolve(resp.access_token);
          } else {
            dbg('GIS pre-picker reauth returned no token — using existing token');
            resolve(window._providerToken);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      dbg('GIS pre-picker reauth ERR: ' + err.message);
      resolve(window._providerToken);
    }
  });
}

// mode: 'roms' (add ROMs) | 'save' (import a .sav for one ROM)
//
// _pickerOpen gates the document-level keydown handler so that arrow-key input
// isn't swallowed by the still-focused rom-list underneath while the Picker —
// or Google's own cookie-consent dialog on top of it — is showing.
window._pickerOpen = false;

function _focusPickerFrame() {
  const frame = document.querySelector('.picker-dialog iframe, .picker-dialog-frame, .picker.modal-dialog iframe');
  if (frame && typeof frame.focus === 'function') frame.focus();
}

async function openPicker(mode = 'roms', forRom = null) {
  if (!PICKER_API_KEY) {
    _setSelectorStatus('SET PICKER_API_KEY IN APP.JS');
    return;
  }

  if (!window._providerToken) {
    _setSelectorStatus('NOT SIGNED IN');
    return;
  }

  _setSelectorStatus('OPENING PICKER...');

  try {
    await _loadGapi();
  } catch (err) {
    _setSelectorStatus('PICKER LOAD FAILED');
    dbg('gapi ERR: ' + err.message);
    return;
  }

  let token = window._providerToken;

  try {
    await _loadGis();
    token = await _refreshDriveAuthForPicker();
  } catch (err) {
    dbg('GIS load ERR (continuing with existing token): ' + err.message);
  }

  const _prevFocused = document.activeElement;

  return new Promise((resolve) => {
    // LIST mode + includeFolders → folders appear at the top of every listing.
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMode(google.picker.DocsViewMode.LIST);

    const builder = new google.picker.PickerBuilder()
      .setOAuthToken(token)
      .setDeveloperKey(PICKER_API_KEY)
      .setAppId('924408688373')
      .setOrigin(window.location.origin)
      .setTitle(mode === 'save' ? 'SELECT SAVE FILE for ' + (forRom?.name || '') : 'SELECT ROM FILES (multi-select)')
      .addView(view)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setCallback(async (data) => {
        const action = data[google.picker.Response.ACTION];

        if (action === google.picker.Action.PICKED) {
          window._pickerOpen = false;
          if (_prevFocused && typeof _prevFocused.focus === 'function') _prevFocused.focus();

          const docs = data[google.picker.Response.DOCUMENTS];
          await _processPickedFiles(docs, mode, forRom);
          resolve(docs);
        } else if (action === google.picker.Action.CANCEL) {
          window._pickerOpen = false;
          if (_prevFocused && typeof _prevFocused.focus === 'function') _prevFocused.focus();

          _setSelectorStatus('SELECT ROM');
          resolve(null);
        }
      });

    builder.build().setVisible(true);

    window._pickerOpen = true;

    // Give the iframe a beat to mount, then try to steal focus into it.
    setTimeout(_focusPickerFrame, 300);
    setTimeout(_focusPickerFrame, 1000);
  });
}

window.openPicker = openPicker;

async function _processPickedFiles(docs, mode, forRom) {
  if (!_cache.romIndex) {
    _cache.romIndex = _emptyIndex();
  }

  // ── Save import mode ─────────────────────────────────────────
  if (mode === 'save' && forRom) {
    if (!docs.length) return;

    const doc = docs[0];
    const { type } = _classifyPickedFile(doc.name);

    // Intercept BIOS files.
    if (type === 'bios') {
      _cache.romIndex.roms = _cache.romIndex.roms.filter(
        r => r.id !== doc.id && _normName(r.file) !== _normName(doc.name)
      );

      // If this BIOS file was previously imported as a save by mistake, clear it.
      _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.id !== doc.id);

      const existing = _cache.romIndex.bios.find(b => _normName(b.file) === _normName(doc.name));
      if (existing) {
        existing.id = doc.id;
      } else {
        _cache.romIndex.bios.push({ id: doc.id, file: doc.name });
      }

      await _saveRomIndex();

      _setSelectorStatus('BIOS IMPORTED — RESTART GAME');
      dbg('BIOS imported via Save picker: ' + doc.name + ' → ' + doc.id);
      return;
    }

    // Prevent PS1 BIOS-style .bin files from being attached as battery saves.
    if (
      type === 'rom' &&
      _normName(doc.name).endsWith('.bin') &&
      forRom.core === 'pcsx_rearmed'
    ) {
      _setSelectorStatus('PS1 .BIN IS NOT A SAVE — USE + FOR BIOS');
      dbg('Rejected .bin as PS1 save: ' + doc.name);
      return;
    }

    // Replace existing save entry for this ROM.
    _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.romFile !== forRom.file);
    _cache.romIndex.saves.push({ id: doc.id, romFile: forRom.file });

    await _saveRomIndex();

    _setSelectorStatus('SAVE IMPORTED — LAUNCH TO USE');
    dbg('Save imported: ' + doc.name + ' → ' + forRom.file);
    _rebuildRomDots();
    return;
  }

  // ── ROM mode ─────────────────────────────────────────────────
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const skippedNames = [];

  for (const doc of docs) {
    const { type, system } = _classifyPickedFile(doc.name);
    dbg('Classifying ' + doc.name + ' -> ' + type + (system ? ' (' + system + ')' : ''));

    if (type === 'unknown') {
      skipped++;
      skippedNames.push(doc.name);
      continue;
    }

    if (type === 'bios') {
      // If it was previously in roms[] (misclassified), remove it.
      _cache.romIndex.roms = _cache.romIndex.roms.filter(
        r => r.id !== doc.id && _normName(r.file) !== _normName(doc.name)
      );

      // If this BIOS file was previously imported as a save by mistake, clear it.
      _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.id !== doc.id);

      const existing = _cache.romIndex.bios.find(b => _normName(b.file) === _normName(doc.name));
      if (existing) {
        existing.id = doc.id;
        updated++;
      } else {
        _cache.romIndex.bios.push({ id: doc.id, file: doc.name });
        added++;
      }

      dbg('BIOS: ' + doc.name + ' → ' + doc.id);
      continue;
    }

    if (type === 'rom') {
      const sys = SYSTEMS[system];
      if (!sys) {
        skipped++;
        skippedNames.push(doc.name);
        continue;
      }

      const byId = _cache.romIndex.roms.find(r => r.id === doc.id);
      if (byId) {
        updated++;
        continue;
      }

      const byName = _cache.romIndex.roms.find(r => _normName(r.file) === _normName(doc.name));
      if (byName) {
        byName.id = doc.id;
        updated++;
        continue;
      }

      const displayName = doc.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

      _cache.romIndex.roms.push({
        id: doc.id,
        name: displayName,
        file: doc.name,
        system,
        core: sys.core,
        label: sys.label,
        cls: sys.cls,
        landscape: _resolveLandscape(sys),
      });

      added++;
      dbg('ROM: ' + doc.name + ' [' + system + '] → ' + doc.id);
    }
  }

  if (skippedNames.length) dbg('Skipped: ' + skippedNames.join(', '));

  await _saveRomIndex();
  _rebuildRomsFromIndex();
  _buildRomList();

  const parts = [];
  if (added) parts.push(added + ' ADDED');
  if (updated) parts.push(updated + ' UPDATED');
  if (skipped) parts.push(skipped + ' SKIPPED');

  _setSelectorStatus(parts.join(' · ') || 'NO CHANGES');
}

// ══════════════════════════════════════════════════════════════
// SAVE STATE — CLOUD (appDataFolder)
// ══════════════════════════════════════════════════════════════
function _saveKey(gameName) {
  const uid = window.currentUser?.id || 'anon';
  const base = gameName.replace(/\.[^.]+$/, '');
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '');
  const slotSuffix = _currentSlot === 0 ? '' : `_slot${_currentSlot}`;
  return uid + '_' + safe + slotSuffix + '.state';
}

async function _cloudSaveExists(gameName) {
  try {
    return !!(await driveFindAppFile(_saveKey(gameName)));
  } catch {
    return false;
  }
}

async function _cloudDownload(gameName) {
  const filename = _saveKey(gameName);
  dbg('DL save: ' + filename);

  try {
    const fileId = await driveFindAppFile(filename);
    if (!fileId) {
      dbg('No cloud save');
      return null;
    }

    const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
    if (!res.ok) {
      dbg('DL HTTP ' + res.status);
      return null;
    }

    const buf = await res.arrayBuffer();
    dbg('DL save: ' + buf.byteLength + 'B');

    return new Uint8Array(buf);
  } catch (err) {
    dbg('DL save ERR: ' + err.message);
    return null;
  }
}

async function _cloudUpload(gameName, bytes) {
  const filename = _saveKey(gameName);
  dbg('UL save: ' + filename + ' (' + bytes.byteLength + 'B)');

  await _ensureFreshToken();

  try {
    const existingId = await driveFindAppFile(filename);
    const ok = await driveWriteAppFile(filename, bytes, existingId);

    if (ok) {
      _tokenLastRefreshed = Date.now();
      dbg('UL save: OK');
    } else {
      dbg('UL save: FAILED');
    }

    return ok;
  } catch (err) {
    dbg('UL save ERR: ' + err.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// BATTERY SAVE — VISIBLE DRIVE (drive.file)
// File IDs live in romIndex.saves[].
// On launch: download by ID, inject into Emscripten FS.
// On exit + every 5 min: extract SRAM, PATCH or create.
// ══════════════════════════════════════════════════════════════
async function _cloudBatteryDownload(romFile) {
  if (!_cache.romIndex) return null;

  const entry = _cache.romIndex.saves.find(s => s.romFile === romFile);
  if (!entry) {
    dbg('No battery save in index for: ' + romFile);
    return null;
  }

  try {
    const res = await window.driveApiFetch(`${DRIVE_API}/files/${entry.id}?alt=media`);

    if (!res.ok) {
      if (res.status === 404) {
        dbg('Battery DL 404 — removing stale index entry');
        _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.romFile !== romFile);
        await _saveRomIndex();
      }
      return null;
    }

    const buf = await res.arrayBuffer();
    dbg('Battery DL: ' + buf.byteLength + 'B');

    return new Uint8Array(buf);
  } catch (err) {
    dbg('Battery DL ERR: ' + err.message);
    return null;
  }
}

// ── BIOS loader ───────────────────────────────────────────────────────────
// Looks up the BIOS file(s) declared in BIOS_REGISTRY for the given core,
// downloads them from Drive, assigns the object URL to the matching EJS_*
// global, and runs an optional size sanity-check.
//
// Returns true if every required BIOS was found and downloaded; false otherwise.
async function _loadBios(core) {
  const required = BIOS_REGISTRY[core];
  if (!required) return true;
  if (!_cache.romIndex) return false;

  let allOk = true;

  for (const { names, preferred, ejsVar, required: req, expectedBytes } of required) {
    const entry = _cache.romIndex.bios.find(b =>
      names.some(n => _normName(b.file) === _normName(n)) ||
      _isPsxBiosName(b.file)
    );

    if (!entry) {
      dbg((req ? 'REQUIRED' : 'optional') + ' BIOS missing: ' + (preferred || names[0]));
      if (req) allOk = false;
      continue;
    }

    try {
      const url = await driveDownloadBlob(entry.id, _cache.biosBlobs, 'BIOS ' + entry.file);
      window[ejsVar] = url;
      dbg('BIOS set ' + ejsVar + ' ← ' + entry.file);

      if (expectedBytes) {
        try {
          const blob = await (await fetch(url)).blob(); // local blob: URL — no network hit
          if (blob.size !== expectedBytes) {
            dbg(
              'WARNING: BIOS ' + entry.file + ' is ' + blob.size + 'B, expected ' + expectedBytes +
              'B — file may be truncated/corrupted. Boot can still succeed while BIOS-level features like the memory card manager misbehave.'
            );
          }
        } catch (_) {
          // sanity check only, non-fatal
        }
      }
    } catch (err) {
      dbg('BIOS DL ERR ' + (entry?.file || preferred) + ': ' + err.message);
      if (req) allOk = false;
    }
  }

  return allOk;
}

async function _cloudBatteryUpload(romFile, bytes) {
  if (!_cache.romIndex) return false;

  await _ensureFreshToken();

  const entry = _cache.romIndex.saves.find(s => s.romFile === romFile);

  if (entry) {
    // PATCH existing file (app-owned or Picker-opened)
    const ok = await _driveWriteOwnedFile(entry.id, bytes);

    if (ok) {
      dbg('Battery UL PATCH OK');
      return true;
    }

    // 404 / failure → file deleted from Drive, fall through to create
    dbg('Battery UL PATCH failed — will recreate');
    _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.romFile !== romFile);
  }

  // Create new file in the saves folder
  const saveFolderId = await _ensureSaveFolder();
  if (!saveFolderId) {
    dbg('Battery UL: no save folder');
    return false;
  }

  const filename = romFile.replace(/\.[^.]+$/, '') + '.sav';
  const newId = await _driveCreateOwnedFile(filename, saveFolderId, bytes);

  if (!newId) {
    dbg('Battery UL create FAILED');
    return false;
  }

  _cache.romIndex.saves.push({ id: newId, romFile });
  await _saveRomIndex();

  dbg('Battery UL created: ' + newId);
  return true;
}

async function _extractAndUploadBattery(rom) {
  if (!window.EJS_emulator || !rom) return;

  try {
    const gm = window.EJS_emulator.gameManager;
    const FS = window.EJS_emulator.Module?.FS;

    if (!gm || !FS || typeof gm.getSaveFilePath !== 'function') return;

    try {
      gm.saveSaveFiles();
    } catch {}

    await new Promise(r => setTimeout(r, 100));

    const savePath = gm.getSaveFilePath();
    if (!savePath) return;

    const srm = FS.readFile(savePath);
    if (!srm?.byteLength) return;

    const isBlank = [...srm.slice(0, 64)].every(b => b === 0x00 || b === 0xFF);
    if (isBlank) {
      dbg('Battery extract: blank SRAM, skipping');
      return;
    }

    dbg('Battery extract: ' + srm.byteLength + 'B, uploading');
    await _cloudBatteryUpload(rom.file, srm);
  } catch (err) {
    dbg('_extractAndUploadBattery ERR: ' + err.message);
  }
}

function _injectBatterySave(rom) {
  let done = false;
  const deadline = Date.now() + 120000;

  const poll = setInterval(async () => {
    if (done || Date.now() > deadline) {
      clearInterval(poll);
      return;
    }

    const FS = window.EJS_emulator?.Module?.FS;
    const gm = window.EJS_emulator?.gameManager;

    if (!FS || !gm || typeof gm.getSaveFilePath !== 'function') return;

    done = true;
    clearInterval(poll);

    const bytes = await _cloudBatteryDownload(rom.file);
    if (!bytes?.byteLength) {
      dbg('No battery save to inject');
      return;
    }

    const savePath = gm.getSaveFilePath();
    dbg('Injecting battery save → ' + savePath);

    const parts = savePath.split('/').filter(Boolean);
    let built = '';

    for (let i = 0; i < parts.length - 1; i++) {
      built += '/' + parts[i];
      try {
        FS.mkdir(built);
      } catch {}
    }

    FS.writeFile(savePath, bytes);

    try {
      gm.loadSaveFiles();
    } catch {}

    await new Promise(r => setTimeout(r, 300));

    const live = gm.getSaveFile?.();
    const isEmpty = !live || [...live.slice(0, 32)].every(b => b === 0x00 || b === 0xFF);

    if (isEmpty) {
      dbg('SRAM empty after loadSaveFiles — restarting core');
      setTimeout(() => {
        try {
          gm.restart();
        } catch (_) {}
      }, 200);
    } else {
      dbg('Battery save active in SRAM (' + live.byteLength + 'B)');
    }
  }, 20);
}

// ══════════════════════════════════════════════════════════════
// CATEGORY SYSTEM
// ══════════════════════════════════════════════════════════════
function _buildCategoryBar() {
  const bar = document.getElementById('category-bar');
  if (!bar) return;

  bar.innerHTML = '';

  const counts = {};
  ROMS.forEach(r => {
    counts[r.system] = (counts[r.system] || 0) + 1;
  });

  const allBtn = document.createElement('button');
  allBtn.className = 'cat-btn' + (_activeCategory === 'all' ? ' active' : '');
  allBtn.dataset.cat = 'all';
  allBtn.style.setProperty('--cat-color', '#00ff41');
  allBtn.innerHTML = `ALL <span class="cat-count">${ROMS.length}</span>`;
  allBtn.addEventListener('click', () => _setCategory('all'));
  bar.appendChild(allBtn);

  for (const sys of SYS_ORDER) {
    if (!counts[sys]) continue;

    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (_activeCategory === sys ? ' active' : '');
    btn.dataset.cat = sys;
    btn.style.setProperty('--cat-color', SYS_COLORS[sys] || '#00ff41');
    btn.innerHTML = `${SYSTEMS[sys].label} <span class="cat-count">${counts[sys]}</span>`;
    btn.addEventListener('click', () => _setCategory(sys));
    bar.appendChild(btn);
  }
}

function _filterRoms() {
  _filteredRoms = _activeCategory === 'all' ? [...ROMS] : ROMS.filter(r => r.system === _activeCategory);
}

function _setCategory(cat) {
  _activeCategory = cat;
  _filterRoms();
  _buildCategoryBar();
  _buildFilteredList();
  _romIndex = 0;

  document.querySelector('.cat-btn.active')?.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });
}

function _cycleCategory(direction) {
  const buttons = [...(document.querySelectorAll('.cat-btn') || [])];
  if (!buttons.length) return;

  const cur = buttons.findIndex(b => b.dataset.cat === _activeCategory);
  let n = cur + direction;

  if (n < 0) n = buttons.length - 1;
  if (n >= buttons.length) n = 0;

  const cat = buttons[n]?.dataset.cat;
  if (cat && cat !== _activeCategory) _setCategory(cat);
}

function _buildFilteredList() {
  const list = document.getElementById('rom-list');
  list.innerHTML = '';

  if (!_filteredRoms.length) {
    const label = _activeCategory === 'all' ? null : SYSTEMS[_activeCategory]?.label;

    list.innerHTML = label
      ? `<div class="rom-list-msg">NO ${label} ROMS<br><br>Press <span class="msg-gold">+</span> and pick<br><span class="msg-highlight">${SYSTEMS[_activeCategory]?.exts?.join(' / ') || ''}</span> files</div>`
      : `<div class="rom-list-msg">NO ROMS<br><br>Press <span class="msg-gold">+</span> to import<br>ROMs from Drive</div>`;

    return;
  }

  _filteredRoms.forEach((rom, i) => {
    const btn = document.createElement('button');
    btn.className = 'rom-item' + (i === 0 ? ' selected' : '');
    btn.dataset.sys = rom.system;
    btn.style.setProperty('--sys-color', SYS_COLORS[rom.system] || '#00ff41');
    btn.style.setProperty('--rom-delay', i < 8 ? `${i * 20}ms` : '0ms');

    const hasSave = !!(_cache.romIndex?.saves.some(s => s.romFile === rom.file));
    const saveDot = hasSave ? ' <span class="rom-save-dot"></span>' : '';

    btn.innerHTML = `<span class="rom-name">${rom.name}</span>${saveDot}<span class="rom-badge ${rom.cls}">${rom.label}</span>`;
    btn.addEventListener('click', () => launchRom(i));

    list.appendChild(btn);
  });

  _romIndex = 0;
}

// Rebuild just the save dots without rebuilding the whole list.
function _rebuildRomDots() {
  const items = document.querySelectorAll('.rom-item');

  items.forEach((btn, i) => {
    const rom = _filteredRoms[i];
    if (!rom) return;

    const hasSave = !!(_cache.romIndex?.saves.some(s => s.romFile === rom.file));
    const existing = btn.querySelector('.rom-save-dot');

    if (hasSave && !existing) {
      const dot = document.createElement('span');
      dot.className = 'rom-save-dot';
      btn.querySelector('.rom-name')?.after(dot);
    } else if (!hasSave && existing) {
      existing.remove();
    }
  });
}

// ══════════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════════
function _showEmptyState() {
  const bar = document.getElementById('category-bar');
  if (bar) bar.innerHTML = '';

  const list = document.getElementById('rom-list');
  if (list) {
    list.innerHTML =
      `<div class="rom-list-msg">NO ROMS YET<br><br>Press <span class="msg-gold">+</span> to pick ROM files<br>directly from your Google Drive.<br><br>` +
      `<span style="color:var(--text-mut);font-size:7px;line-height:2;">Select any .gb .gbc .gba .nes .sfc<br>.chd .gg .sms .md .bin files.</span></div>`;
  }
}

// ══════════════════════════════════════════════════════════════
// ROM OPTIONS OVERLAY
// Triggered by * key on selector screen.
// Options: LAUNCH / IMPORT SAVE / REMOVE FROM LIST
// ══════════════════════════════════════════════════════════════
const ROM_OPTIONS = ['LAUNCH', 'IMPORT SAVE', 'REMOVE FROM LIST'];

function _showRomOptions() {
  const rom = _filteredRoms[_romIndex];
  if (!rom) return;

  _romOptionsIndex = 0;

  const overlay = document.getElementById('rom-options-overlay');
  if (!overlay) return;

  document.getElementById('rom-options-title').textContent = rom.name.toUpperCase();
  _renderRomOptions();

  overlay.classList.add('visible');
}

function _closeRomOptions() {
  document.getElementById('rom-options-overlay')?.classList.remove('visible');
}

function _renderRomOptions() {
  const grid = document.getElementById('rom-options-list');
  if (!grid) return;

  grid.innerHTML = '';

  ROM_OPTIONS.forEach((label, i) => {
    const el = document.createElement('div');
    el.className = 'rom-option-item' + (i === _romOptionsIndex ? ' selected' : '');
    el.textContent = label;
    grid.appendChild(el);
  });
}

function _navigateRomOptions(dir) {
  _romOptionsIndex = (_romOptionsIndex + dir + ROM_OPTIONS.length) % ROM_OPTIONS.length;
  _renderRomOptions();
}

async function _confirmRomOption() {
  const rom = _filteredRoms[_romIndex];
  if (!rom) {
    _closeRomOptions();
    return;
  }

  const choice = ROM_OPTIONS[_romOptionsIndex];
  _closeRomOptions();

  if (choice === 'LAUNCH') {
    launchRom(_romIndex);
  } else if (choice === 'IMPORT SAVE') {
    await openPicker('save', rom);
  } else if (choice === 'REMOVE FROM LIST') {
    if (!_cache.romIndex) return;

    _cache.romIndex.roms = _cache.romIndex.roms.filter(r => r.id !== rom.fileId);

    await _saveRomIndex();
    _rebuildRomsFromIndex();

    if (ROMS.length === 0) _showEmptyState();
    else _buildRomList();

    _setSelectorStatus('REMOVED: ' + rom.name.toUpperCase());
  }
}

// ══════════════════════════════════════════════════════════════
// FOCUS MANAGEMENT
// ══════════════════════════════════════════════════════════════
function _focusRomItem(index) {
  const items = document.querySelectorAll('.rom-item');
  if (items[index]) {
    items[index].focus();
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

function _focusActiveCategory() {
  const activeCat = document.querySelector('.cat-btn.active');
  if (activeCat) {
    activeCat.focus();
    activeCat.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function _focusHeaderButton() {
  const addBtn = document.getElementById('add-roms-btn');
  if (addBtn?.offsetParent !== null) {
    addBtn.focus();
    return;
  }

  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn?.offsetParent !== null) {
    signOutBtn.focus();
  }
}

function _focusPrevHeaderBtn() {
  const f = document.activeElement?.id;
  if (f === 'sign-out-btn') {
    document.getElementById('add-roms-btn')?.focus();
  }
}

function _focusNextHeaderBtn() {
  const f = document.activeElement?.id;
  if (f === 'add-roms-btn') {
    document.getElementById('sign-out-btn')?.focus();
  }
}

function _initFocusSync() {
  document.getElementById('rom-list')?.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('rom-item')) {
      const items = [...document.querySelectorAll('.rom-item')];
      const index = items.indexOf(e.target);

      if (index >= 0 && index !== _romIndex) {
        _romIndex = index;
        items.forEach((el, i) => el.classList.toggle('selected', i === index));
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════
let _toastHideTimer = null;
let _selectorMsgTimer = null;

function _setSaveStatus(text, cls) {
  const el = document.getElementById('save-status');
  if (el) {
    el.textContent = text;
    el.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  const toast = document.getElementById('emu-toast');
  if (toast) {
    clearTimeout(_toastHideTimer);
    toast.classList.add('visible');
  }
}

function _hideToast() {
  document.getElementById('emu-toast')?.classList.remove('visible');
}

function _clearSaveStatus(delay = 2000) {
  clearTimeout(_toastHideTimer);
  _toastHideTimer = setTimeout(_hideToast, delay);
}

function _setSelectorStatus(msg, duration = 2500) {
  const el = document.getElementById('section-label');
  if (!el) return;

  el.textContent = msg;

  clearTimeout(_selectorMsgTimer);
  _selectorMsgTimer = setTimeout(() => {
    el.textContent = 'SELECT ROM';
  }, duration);
}

function _setRomListMsg(msg) {
  const el = document.getElementById('rom-list');
  if (el) el.innerHTML = `<div class="rom-list-msg">${msg}</div>`;

  const bar = document.getElementById('category-bar');
  if (bar) bar.innerHTML = '';
}

function _buildRomList() {
  _buildCategoryBar();
  _filterRoms();
  _buildFilteredList();

  requestAnimationFrame(() => _focusRomItem(0));
}

function _updateSelection(n) {
  n = Math.max(0, Math.min(n, _filteredRoms.length - 1));

  const items = document.querySelectorAll('.rom-item');
  items.forEach((el, i) => el.classList.toggle('selected', i === n));

  _romIndex = n;

  const item = items[n];
  if (item) {
    item.scrollIntoView({ block: 'nearest' });
    item.focus();
  }
}

function _renderPortraitHints() {
  const el = document.getElementById('key-hints');
  if (!el) return;

  el.innerHTML = [
    ['7', 'LOAD'],
    ['9', 'SAVE'],
    ['0', 'HELP'],
    ['RSK', 'EXIT'],
  ].map(([k, a]) => `<div class="hint-row"><span class="hint-key">${k}</span><span class="hint-action">${a}</span></div>`).join('');
}

function _ensureLoadingMsg() {
  let loadMsg = document.getElementById('loading-msg');

  if (!loadMsg) {
    const wrapper = document.getElementById('emulator-wrapper');
    if (!wrapper) return null;

    loadMsg = document.createElement('div');
    loadMsg.id = 'loading-msg';
    wrapper.appendChild(loadMsg);
  }

  loadMsg.innerHTML = '<div class="loading-spinner"></div><span>LOADING <span class="loading-dot"></span></span>';
  loadMsg.style.cssText =
    'position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;color:#00ff41;' +
    'font-family:"Press Start 2P",monospace;font-size:8px;letter-spacing:2px;flex-direction:column;gap:14px;z-index:10;text-align:center;padding:16px;';

  return loadMsg;
}

// ══════════════════════════════════════════════════════════════
// KEYBINDS POPUP
// ══════════════════════════════════════════════════════════════
function toggleKeybinds() {
  const overlay = document.getElementById('keybinds-overlay');
  if (!overlay) return;

  if (overlay.classList.contains('visible')) {
    overlay.classList.remove('visible');
  } else {
    _renderKeybindsGrid(_currentRom ? getKeybinds(_currentRom) : _genericKeybinds());
    overlay.classList.add('visible');
  }
}

function _renderKeybindsGrid(binds) {
  const grid = document.getElementById('keybinds-grid');
  if (!grid) return;

  grid.innerHTML = '';

  for (const entry of binds) {
    if (entry.section) {
      const el = document.createElement('div');
      el.className = 'keybinds-section';
      el.textContent = entry.label;
      grid.appendChild(el);
    } else {
      const el = document.createElement('div');
      el.className = 'keybinds-row';
      el.innerHTML = `<span class="keybinds-key">${entry.key}</span><span class="keybinds-action">${entry.action}</span>`;
      grid.appendChild(el);
    }
  }
}

// ══════════════════════════════════════════════════════════════
// SAVE CONFIRM
// ══════════════════════════════════════════════════════════════
let _saveConfirmTimer = null;

function _showSaveConfirm() {
  document.getElementById('save-confirm')?.classList.add('visible');
  _saveConfirmPending = true;
  _setSaveStatus('OVERRIDE?', 'warning');

  clearTimeout(_saveConfirmTimer);
  _saveConfirmTimer = setTimeout(() => {
    if (_saveConfirmPending) _dismissSaveConfirm();
  }, 5000);
}

function _dismissSaveConfirm() {
  clearTimeout(_saveConfirmTimer);
  document.getElementById('save-confirm')?.classList.remove('visible');
  _saveConfirmPending = false;
  _hideToast();
}

// ══════════════════════════════════════════════════════════════
// SAVE / LOAD (save states — appDataFolder)
// ══════════════════════════════════════════════════════════════
async function manualSave() {
  if (!_saveConfirmPending) {
    if (await _cloudSaveExists(window.EJS_gameName)) {
      _showSaveConfirm();
      return;
    }

    await _doSave();
    return;
  }

  _dismissSaveConfirm();
  await _doSave();
}

async function _doSave() {
  _setSaveStatus('SAVING...', 'saving');

  try {
    const gm = window.EJS_emulator?.gameManager;

    if (!gm || typeof gm.getState !== 'function') {
      _setSaveStatus('NO EMU', '');
      _clearSaveStatus();
      return;
    }

    const data = gm.getState();
    if (!data?.byteLength) {
      _setSaveStatus('NO DATA', '');
      _clearSaveStatus();
      return;
    }

    _setSaveStatus('UPLOADING...', 'saving');

    const ok = await _cloudUpload(window.EJS_gameName, data);
    _setSaveStatus(ok ? 'SAVED!' : 'UL ERR', ok ? 'active' : '');
  } catch (err) {
    dbg('_doSave ERR: ' + err.message);
    _setSaveStatus('ERR', '');
  }

  _clearSaveStatus();
}

async function manualLoad() {
  _setSaveStatus('LOADING...', 'saving');

  try {
    const gm = window.EJS_emulator?.gameManager;

    if (!gm || typeof gm.loadState !== 'function') {
      _setSaveStatus('NO EMU', '');
      _clearSaveStatus();
      return;
    }

    const bytes = await _cloudDownload(window.EJS_gameName);
    if (!bytes?.byteLength) {
      _setSaveStatus('NO SAVE', '');
      _clearSaveStatus();
      return;
    }

    gm.loadState(bytes);
    _setSaveStatus('LOADED!', 'active');
  } catch (err) {
    dbg('manualLoad ERR: ' + err.message);
    _setSaveStatus('LOAD ERR', '');
  }

  _clearSaveStatus();
}

// ══════════════════════════════════════════════════════════════
// EXIT
// ══════════════════════════════════════════════════════════════
async function exitRom() {
  _dismissSaveConfirm();
  document.getElementById('keybinds-overlay')?.classList.remove('visible');

  if (window._batteryAutoSave) {
    clearInterval(window._batteryAutoSave);
    window._batteryAutoSave = null;
  }

  if (window.EJS_emulator && _currentRom) {
    _setSaveStatus('SAVING...', 'saving');
    await _extractAndUploadBattery(_currentRom);
  }

  if (window.EJS_emulator) {
    try {
      window.EJS_emulator.gameManager?.pause();
    } catch (e) {}
  }

  delete window.EJS_emulator;

  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';

  for (const url of Object.values(_cache.romBlobs)) URL.revokeObjectURL(url);
  _cache.romBlobs = {};

  if (window._lastStateBlobUrl) {
    URL.revokeObjectURL(window._lastStateBlobUrl);
    window._lastStateBlobUrl = null;
  }

  setLandscape(false);
  _currentRom = null;

  clearTimeout(_toastHideTimer);
  _hideToast();

  document.getElementById('emulator-screen').style.display = 'none';
  document.getElementById('selector').style.display = 'flex';
  document.getElementById('scanlines').style.display = 'block';

  requestAnimationFrame(() => _focusRomItem(_romIndex));
}

// ══════════════════════════════════════════════════════════════
// LAUNCH
// ══════════════════════════════════════════════════════════════
async function launchRom(index) {
  const rom = _filteredRoms[index];
  if (!rom || !window.currentUser) return;

  _currentRom = rom;
  _saveConfirmPending = false;

  setLandscape(rom.landscape);

  document.getElementById('selector').style.display = 'none';
  document.getElementById('emulator-screen').style.display = 'flex';
  document.getElementById('emu-title').textContent = rom.name.toUpperCase();
  document.getElementById('scanlines').style.display = 'none';

  _setSaveStatus('ROM DL...', 'saving');

  const loadMsg = _ensureLoadingMsg();
  if (loadMsg) loadMsg.style.display = 'flex';

  if (!rom.landscape) _renderPortraitHints();

  let romUrl;

  try {
    romUrl = await driveDownloadBlob(rom.fileId, _cache.romBlobs, 'ROM ' + rom.file);
  } catch (err) {
    dbg('ROM DL ERR: ' + err.message);

    // If the file is missing (404), remove it from the index immediately.
    if (err.message.includes('404')) {
      _cache.romIndex.roms = _cache.romIndex.roms.filter(r => r.id !== rom.fileId);
      await _saveRomIndex();
      _rebuildRomsFromIndex();
      _buildRomList();
      _setSelectorStatus('REMOVED: ' + rom.name.toUpperCase() + ' (NOT IN DRIVE)');
    } else {
      // For network or auth errors, just show the error.
      const lm = document.getElementById('loading-msg');
      if (lm) {
        lm.innerHTML =
          'ROM DOWNLOAD FAILED<br>' +
          '<span style="font-size:7px;color:#888;max-width:240px;display:inline-block;line-height:1.6;margin-top:8px;">' +
          err.message +
          '</span><br>' +
          '<span style="font-size:8px;color:#555;margin-top:8px;">Press RSK to exit</span>';
      }

      _setSaveStatus('ROM ERR', '');
      return;
    }

    // Return to selector screen.
    document.getElementById('emulator-screen').style.display = 'none';
    document.getElementById('selector').style.display = 'flex';
    document.getElementById('scanlines').style.display = 'block';
    _hideToast();
    return;
  }

  _bootEJS(rom, romUrl);
}

// ══════════════════════════════════════════════════════════════
// EMULATORJS BOOT
// ══════════════════════════════════════════════════════════════
async function _bootEJS(rom, romUrl) {
  dbg('_bootEJS: "' + rom.name + '" core=' + rom.core + ' EJS=' + typeof window.EJS);

  if (window.EJS_emulator) {
    try {
      window.EJS_emulator.gameManager?.pause();
    } catch (e) {}
  }

  delete window.EJS_emulator;

  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';

  const loadMsg = _ensureLoadingMsg();
  if (loadMsg) loadMsg.style.display = 'flex';

  window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

  const _wrapperEl = document.getElementById('emulator-wrapper');
  const _measuredW = _wrapperEl?.offsetWidth || 0;
  const _measuredH = _wrapperEl?.offsetHeight || 0;

  window.EJS_canvasWidth = _measuredW || (_isLandscape ? SCREEN.h : SCREEN.w);
  window.EJS_canvasHeight = _measuredH || (_isLandscape ? SCREEN.w : SCREEN.h);

  dbg('Canvas: ' + window.EJS_canvasWidth + 'x' + window.EJS_canvasHeight);

  window.EJS_disableDatabases = true;
  window.EJS_core_options = { video_filter: 'none' };
  window.EJS_gameName = rom.file;

  // ── BIOS load + required-BIOS guard ───────────────────────────
  const biosOk = await _loadBios(rom.core);

  if (!biosOk) {
    dbg('Boot aborted: required BIOS unavailable for core ' + rom.core);

    const lm = document.getElementById('loading-msg');
    if (lm) {
      lm.innerHTML =
        'REQUIRED BIOS NOT FOUND<br>' +
        '<span style="font-size:7px;color:#888;max-width:240px;display:inline-block;line-height:1.6;margin-top:8px;">' +
        'This system needs a BIOS file added via +. Check it is still present in Drive.' +
        '</span><br>' +
        '<span style="font-size:8px;color:#555;margin-top:8px;">Press RSK to exit</span>';
      lm.style.display = 'flex';
    }

    _setSaveStatus('BIOS ERR', '');
    return;
  }

  const onGameStart = () => {
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.style.display = 'none';

    _setSaveStatus('NEW GAME', 'active');
    _clearSaveStatus();

    dbg('EJS_onGameStart fired');

    let attempts = 0;
    const findCanvas = setInterval(() => {
      const canvas = document.querySelector('canvas');

      if (canvas) {
        canvas.style.imageRendering = 'pixelated';
        canvas.style.transform = 'translateZ(0)';
        dbg('Canvas isolated');
        clearInterval(findCanvas);
      } else if (attempts++ > 50) {
        dbg('Canvas not found');
        clearInterval(findCanvas);
      }
    }, 100);

    if (window._batteryAutoSave) clearInterval(window._batteryAutoSave);

    window._batteryAutoSave = setInterval(async () => {
      if (!_currentRom || document.getElementById('emulator-screen')?.style.display === 'none') {
        clearInterval(window._batteryAutoSave);
        window._batteryAutoSave = null;
        return;
      }

      dbg('Battery auto-save...');
      await _extractAndUploadBattery(_currentRom);
    }, 5 * 60 * 1000);
  };

  const buttons = {
    playPause: false,
    restart: false,
    mute: false,
    settings: false,
    fullscreen: false,
    saveState: false,
    loadState: false,
    screenRecord: false,
    gamepad: false,
    cheat: false,
    volume: false,
    saveSavFiles: false,
    loadSavFiles: false,
    quickSave: false,
    quickLoad: false,
  };

  const defaultControls = {
    0: getControls(rom.core, rom.landscape),
    1: {},
    2: {},
    3: {},
  };

  _injectBatterySave(rom);

  if (typeof window.EJS === 'function') {
    const playerEl = document.getElementById('emulator-wrapper');
    if (!playerEl) {
      dbg('ERROR: #emulator-wrapper not found');
      return;
    }

    const config = {
      gameUrl: romUrl,
      core: rom.core,
      gameName: rom.file,
      startOnLoad: true,
      muted: true,
      color: '#00ff41',
      backgroundColor: '#000000',
      defaultControls,
      buttons,
      onGameStart,
    };

    if (window.EJS_biosUrl) config.biosUrl = window.EJS_biosUrl;

    try {
      new window.EJS(playerEl, config);
      dbg('EJS instance created' + (config.biosUrl ? ' (with BIOS)' : ' (no BIOS)'));
    } catch (e) {
      dbg('EJS constructor ERR: ' + e.message);
    }
  } else {
    window.EJS_player = '#emulator-wrapper';
    window.EJS_gameUrl = romUrl;
    window.EJS_gameName = rom.file;
    window.EJS_core = rom.core;
    window.EJS_startOnLoaded = true;
    window.EJS_muted = true;
    window.EJS_color = '#00ff41';
    window.EJS_backgroundColor = '#000000';
    window.EJS_onGameStart = onGameStart;
    window.EJS_defaultControls = defaultControls;
    window.EJS_Buttons = buttons;

    // biosUrl is set via window.EJS_biosUrl by _loadBios (if applicable)
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.className = 'ejs-script';
    script.onerror = () => {
      dbg('EJS loader.js FAILED');

      const lm = document.getElementById('loading-msg');
      if (lm) {
        lm.innerHTML = 'EMULATOR LOAD FAILED<br><span style="font-size:8px;color:#555">Check your connection</span>';
      }
    };

    document.body.appendChild(script);
  }
}

// ══════════════════════════════════════════════════════════════
// RSK — CloudPhone back event
// ══════════════════════════════════════════════════════════════
window.addEventListener('back', (e) => {
  const inEmu = document.getElementById('emulator-screen').style.display !== 'none';

  if (inEmu) {
    e.preventDefault();

    if (document.getElementById('keybinds-overlay')?.classList.contains('visible')) {
      toggleKeybinds();
      return;
    }

    if (_saveConfirmPending) {
      _dismissSaveConfirm();
      return;
    }

    if (document.getElementById('debug-overlay')?.style.display === 'flex') {
      toggleDebug();
      return;
    }

    exitRom();
  } else {
    // On selector: RSK closes rom-options if open.
    if (document.getElementById('rom-options-overlay')?.classList.contains('visible')) {
      e.preventDefault();
      _closeRomOptions();
    }
  }
});

// ══════════════════════════════════════════════════════════════
// KEYBOARD HANDLER
// ══════════════════════════════════════════════════════════════
window.addEventListener('keydown', (e) => {
  if (window._pickerOpen) return;

  if (e.key === 'Call') {
    e.stopImmediatePropagation();
    e.preventDefault();

    const inEmu = document.getElementById('emulator-screen').style.display !== 'none';

    if (inEmu) {
      _currentSlot = (_currentSlot + 1) % MAX_SLOTS;
      _setSaveStatus(`SLOT ${_currentSlot}`, 'active');
      _clearSaveStatus(1500);
    }
  }
}, true);

window.addEventListener('keyup', (e) => {
  if (e.key === 'Call') {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

document.addEventListener('keydown', (e) => {
  if (window._pickerOpen) return;

  const inSel = document.getElementById('selector').style.display !== 'none';
  const inEmu = document.getElementById('emulator-screen').style.display !== 'none';
  const romOptionsOpen = document.getElementById('rom-options-overlay')?.classList.contains('visible');

  if (inSel) {
    // ── ROM options overlay navigation ─────────────────────────
    if (romOptionsOpen) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        _navigateRomOptions(-1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _navigateRomOptions(1);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        _confirmRomOption();
        return;
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        _closeRomOptions();
        return;
      }

      return;
    }

    const f = document.activeElement;
    const isCatBtn = f?.classList.contains('cat-btn');
    const isRomItem = f?.classList.contains('rom-item');
    const isHeaderBtn = f?.closest('.selector-header') !== null;

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      // Guardrail: Do nothing if the list is empty to avoid focus trap.
      if (_filteredRoms.length === 0) return;

      if (isCatBtn || isHeaderBtn) _focusRomItem(_romIndex);
      else if (isRomItem && _romIndex < _filteredRoms.length - 1) _updateSelection(_romIndex + 1);

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      // Guardrail: Escape to header if the list is empty.
      if (_filteredRoms.length === 0) {
        _focusHeaderButton();
        return;
      }

      if (isRomItem) {
        if (_romIndex > 0) _updateSelection(_romIndex - 1);
        else _focusActiveCategory();
      } else if (isCatBtn) {
        _focusHeaderButton();
      }

      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();

      if (isHeaderBtn) {
        _focusPrevHeaderBtn();
      } else {
        _cycleCategory(-1);
        if (isCatBtn) _focusActiveCategory();
        else _focusRomItem(0);
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();

      if (isHeaderBtn) {
        _focusNextHeaderBtn();
      } else {
        _cycleCategory(1);
        if (isCatBtn) _focusActiveCategory();
        else _focusRomItem(0);
      }

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (isRomItem || isCatBtn || isHeaderBtn) f.click();
      else if (_filteredRoms.length > 0) launchRom(_romIndex);

      return;
    }

    if (e.key === '0') {
      e.preventDefault();
      _currentRom = null;
      toggleKeybinds();
      return;
    }

    if (e.key === '*') {
      e.preventDefault();
      if (_filteredRoms.length > 0) _showRomOptions();
      return;
    }
  }

  if (inEmu) {
    if (e.key === 'Call') {
      e.preventDefault();
      _currentSlot = (_currentSlot + 1) % MAX_SLOTS;
      _setSaveStatus(`SLOT ${_currentSlot}`, 'active');
      _clearSaveStatus(1500);
    }

    if (e.key === '7') {
      e.preventDefault();
      manualLoad();
    }

    if (e.key === '8') {
      e.preventDefault();
      toggleDebug();
    }

    if (e.key === '9') {
      e.preventDefault();
      manualSave();
    }

    if (e.key === '0') {
      e.preventDefault();
      toggleKeybinds();
    }

    if (_saveConfirmPending && !['7', '8', '9', '0'].includes(e.key)) {
      _dismissSaveConfirm();
    }
  }
});

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
_initFocusSync();

window.onAuthSuccess = function(user) {
  _markTokenFresh();

  dbg('Auth success: ' + user.name + ' | screen: ' + SCREEN.toString());

  document.getElementById('selector').style.display = 'flex';

  // Preload GIS and gapi so popups aren't blocked by browser gesture timeouts.
  _loadGis().catch(e => dbg('GIS preload failed: ' + e.message));
  _loadGapi().catch(e => dbg('gapi preload failed: ' + e.message));

  _loadRomIndex();
};
