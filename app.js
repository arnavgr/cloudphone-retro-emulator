'use strict';

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
  gbc:     { core: 'gambatte',     exts: ['.gbc', '.gb'],  label: 'GBC',  cls: 'gbc',  landscape: false, smallLandscape: true },
  gba:     { core: 'mgba',         exts: ['.gba'],         label: 'GBA',  cls: 'gba',  landscape: false, smallLandscape: true },
  nes:     { core: 'nestopia',     exts: ['.nes'],         label: 'NES',  cls: 'nes',  landscape: true,  smallLandscape: true },
  snes:    { core: 'snes9x',       exts: ['.sfc', '.smc'], label: 'SNES', cls: 'snes', landscape: true,  smallLandscape: true },
  psx:     { core: 'pcsx_rearmed', exts: ['.chd'],         label: 'PS1',  cls: 'ps1',  landscape: true,  smallLandscape: true },
  gg:      { core: 'segaGG',       exts: ['.gg'],          label: 'GG',   cls: 'gg',   landscape: false, smallLandscape: true },
  sms:     { core: 'segaMS',       exts: ['.sms'],         label: 'SMS',  cls: 'sms',  landscape: true,  smallLandscape: true },
  genesis: { core: 'segaMD',       exts: ['.md', '.bin', '.gen'], label: 'GEN', cls: 'gen', landscape: true, smallLandscape: true },
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
// BIOS REGISTRY
// ══════════════════════════════════════════════════════════════
const BIOS_REGISTRY = {
  pcsx_rearmed: {
    ejsVar: 'EJS_biosUrl',
    files: [
      'psxonpsp660.bin',
      'scph5501.bin',
      'scph1001.bin',
      'scph7001.bin',
      'scph5502.bin',
      'scph5500.bin'
    ],
    required: false
  }
};

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

const _BTNS = { a: 'enter', b: '1', start: 'escape', select: '3' };
const _BTNS_EXT = { ..._BTNS, x: '4', y: '2', l: '5', r: '6' };

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
  { key: '6', action: 'R' }
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

// Folder created by the app (drive.file) for manual exports only.
const SAVE_FOLDER_NAME = 'cloudphone-emulator-saves';

// Google Picker API key
const PICKER_API_KEY = 'AIzaSyBXEs-NFca5LOW0Y-mzn48hvTuCGR1pIF4';

// Google OAuth Web Client ID — same Cloud project as PICKER_API_KEY / setAppId.
const GOOGLE_OAUTH_CLIENT_ID = '924408688373-brjd67ahhkib1s3d5cplpaamscb3loe1.apps.googleusercontent.com';

// Known BIOS filenames — if a .bin file matches, it's a BIOS not a Genesis ROM.
const BIOS_FILENAMES = new Set([
  // North America (NTSC-U)
  'scph1001.bin', 'scph5501.bin', 'scph7001.bin', 'scph7501.bin', 'scph101.bin',

  // Europe (PAL)
  'scph1002.bin', 'scph5502.bin', 'scph7002.bin', 'scph7502.bin', 'scph102.bin',

  // Japan (NTSC-J)
  'scph1000.bin', 'scph3000.bin', 'scph5000.bin', 'scph5500.bin', 'scph7000.bin', 'scph100.bin',

  // PSP Universal (PCSX ReARMed preferred)
  'psxonpsp660.bin'
]);

// Extension → system. .bin handled separately in _classifyPickedFile.
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
};

// ══════════════════════════════════════════════════════════════
// CACHE
// romIndex is persisted to appDataFolder as JSON.
// All Drive file IDs (ROMs, BIOS, saves) live in the index —
// no folder scanning ever happens at runtime.
// ══════════════════════════════════════════════════════════════
const _cache = {
  romIndex: null,   // { version, saveFolderId, roms[], bios[], saves[] }
  indexFileId: null, // appDataFolder file ID for the index JSON
  romBlobs: {},     // driveFileId → objectURL
  biosBlobs: {},    // driveFileId → objectURL
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
let _romOptions = [];

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
      'position:fixed;top:0;left:0;z-index:999999;display:flex;flex-direction:column;background:rgba(4,4,8,0.97);border:1px solid #00ff41;padding:0;font-family:monospace;color:#00ff41;' +
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
  const res = await window.driveApiFetch(
    `${DRIVE_API}/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function driveWriteAppFile(filename, bytes, existingId = null) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const boundary = 'emu_mp_boundary';

  if (existingId) {
    const res = await window.driveApiFetch(
      `${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: blob
      }
    );
    return res.ok;
  }

  const meta = JSON.stringify({
    name: filename,
    parents: ['appDataFolder']
  });

  const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;

  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);

  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    }
  );

  return res.ok;
}

// Write bytes to a visible Drive file the app owns (drive.file).
// Kept for compatibility / manual export only.
async function _driveWriteOwnedFile(fileId, bytes) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: blob
    }
  );
  return res.ok;
}

// Create a new visible file in a folder the app owns.
async function _driveCreateOwnedFile(filename, parentId, bytes) {
  const boundary = 'emu_battery_boundary';

  const meta = JSON.stringify({
    name: filename,
    parents: [parentId]
  });

  const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;

  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);

  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.id || null;
}

// ══════════════════════════════════════════════════════════════
// SAFE BATTERY SAVE STORAGE
// Active save + backup live in appDataFolder.
// The user-picked .sav is treated as a source file, never auto-overwritten.
// ══════════════════════════════════════════════════════════════
function _safeSaveName(name) {
  return String(name || 'save').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function _batteryActiveName(romFile) {
  return (window.currentUser?.id || 'anon') + '__battery_active__' + _safeSaveName(romFile) + '.sav';
}

function _batteryBackupName(romFile) {
  return (window.currentUser?.id || 'anon') + '__battery_backup__' + _safeSaveName(romFile) + '.sav';
}

function _getSaveEntry(romFile) {
  return _cache.romIndex?.saves?.find(s => s.romFile === romFile) || null;
}

async function _downloadDriveBytes(fileId) {
  if (!fileId) return null;

  try {
    const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
    if (!res.ok) return null;

    const buf = await res.arrayBuffer();
    if (!buf || buf.byteLength === 0) return null;

    return new Uint8Array(buf);
  } catch (err) {
    dbg('_downloadDriveBytes ERR: ' + err.message);
    return null;
  }
}

async function _driveDeleteFile(fileId) {
  if (!fileId) return false;

  try {
    const res = await window.driveApiFetch(
      `${DRIVE_API}/files/${fileId}?supportsAllDrives=true`,
      { method: 'DELETE' }
    );

    return res.ok || res.status === 404;
  } catch (err) {
    dbg('_driveDeleteFile ERR: ' + err.message);
    return false;
  }
}

// Returns file ID, not just boolean
async function _writeAppFileBytes(filename, bytes, existingId = null) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });

  if (existingId) {
    const res = await window.driveApiFetch(
      `${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: blob
      }
    );

    if (res.ok) return existingId;

    dbg('appData PATCH failed (' + res.status + ') — recreating ' + filename);
  }

  const boundary = 'emu_appdata_boundary';

  const meta = JSON.stringify({
    name: filename,
    parents: ['appDataFolder']
  });

  const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;

  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);

  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.id || null;
}

async function _downloadSaveEntryBytes(entry) {
  if (!entry) return null;

  const activeBytes = entry.activeId ? await _downloadDriveBytes(entry.activeId) : null;
  if (activeBytes) return activeBytes;

  const backupBytes = entry.backupId ? await _downloadDriveBytes(entry.backupId) : null;
  if (backupBytes) return backupBytes;

  const legacyBytes = entry.legacyId ? await _downloadDriveBytes(entry.legacyId) : null;
  if (legacyBytes) return legacyBytes;

  const oldBytes = entry.id ? await _downloadDriveBytes(entry.id) : null;
  if (oldBytes) return oldBytes;

  return null;
}

async function _migrateSavesToAppData() {
  if (!_cache.romIndex?.saves?.length) return;

  let changed = false;

  for (const s of _cache.romIndex.saves) {
    if (s.v === 2) continue;

    const oldId = s.id || s.legacyId || null;

    if (s.id) {
      s.legacyId = s.id;
      s.sourceId = s.sourceId || s.id;
      delete s.id;
    }

    s.v = 2;

    if (!s.activeId && s.legacyId) {
      try {
        const bytes = await _downloadDriveBytes(s.legacyId);

        if (bytes?.byteLength) {
          s.activeId = await _writeAppFileBytes(_batteryActiveName(s.romFile), bytes, null) || null;
          s.backupId = await _writeAppFileBytes(_batteryBackupName(s.romFile), bytes, null) || null;
          s.migratedAt = Date.now();
          dbg('Migrated old battery save to appData for: ' + s.romFile);
        }
      } catch (err) {
        dbg('Save migration ERR: ' + err.message);
      }
    }

    changed = true;
  }

  if (changed) {
    await _saveRomIndex();
  }
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
// Structure: { version, saveFolderId, roms[], bios[], saves[] }
//   roms[]:  { id, name, file, system, core, label, cls, landscape }
//   bios[]:  { id, file }
//   saves[]: { romFile, v, activeId, backupId, sourceId, legacyId, ... }
// ══════════════════════════════════════════════════════════════
function _indexKey() {
  return (window.currentUser?.id || 'anon') + '_rom_index_v1';
}

function _emptyIndex() {
  return {
    version: 1,
    saveFolderId: null,
    roms: [],
    bios: [],
    saves: []
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
    _cache.romIndex.bios = _cache.romIndex.bios || [];
    _cache.romIndex.saves = _cache.romIndex.saves || [];

    await _migrateSavesToAppData();

    dbg(
      'ROM index: ' +
      _cache.romIndex.roms.length + ' ROMs / ' +
      _cache.romIndex.bios.length + ' BIOS / ' +
      _cache.romIndex.saves.length + ' saves'
    );

    _rebuildRomsFromIndex();

    if (ROMS.length === 0) _showEmptyState();
    else _buildRomList();

    // Background validation
    if (_cache.romIndex.roms.length > 0) {
      _validateRomIndex().then(() => {
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

// Silently checks if ROMs still exist in Drive and removes ghosts.
async function _validateRomIndex() {
  if (!_cache.romIndex || _cache.romIndex.roms.length === 0) return;

  let removedCount = 0;
  const validRoms = [];

  for (const rom of _cache.romIndex.roms) {
    try {
      const res = await window.driveApiFetch(
        `${DRIVE_API}/files/${rom.id}?fields=id,trashed&supportsAllDrives=true`
      );

      if (res.ok) {
        const data = await res.json();

        if (!data.trashed) {
          validRoms.push(rom);
        } else {
          removedCount++;
        }
      } else if (res.status === 404) {
        removedCount++;
      } else {
        validRoms.push(rom);
      }
    } catch (err) {
      validRoms.push(rom);
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
// Now used only for manual EXPORT SAVE.
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
  const lower = name.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));

  // .bin is ambiguous: BIOS filenames win, otherwise Genesis ROM
  if (ext === '.bin') {
    return BIOS_FILENAMES.has(lower)
      ? { type: 'bios', system: null }
      : { type: 'rom', system: 'genesis' };
  }

  // Check known BIOS filenames for other extensions
  if (BIOS_FILENAMES.has(lower)) return { type: 'bios', system: null };

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
        onerror: reject
      });
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://apis.google.com/js/api.js';
    s.onload = () =>
      gapi.load('picker', {
        callback: () => {
          _gapiReady = true;
          resolve();
        },
        onerror: reject
      });
    s.onerror = () => reject(new Error('gapi script blocked — check network'));
    document.head.appendChild(s);
  });
}

// Google Identity Services — fresh pre-Picker reauth
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

// mode: 'roms' (add ROMs + BIOS) | 'save' (import a .sav for one ROM)
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
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMode(google.picker.DocsViewMode.LIST);

    const builder = new google.picker.PickerBuilder()
      .setOAuthToken(token)
      .setDeveloperKey(PICKER_API_KEY)
      .setAppId('924408688373')
      .setOrigin(window.location.origin)
      .setTitle(mode === 'save' ? 'SELECT SAVE FILE for ' + (forRom?.name || '') : 'SELECT ROM & BIOS FILES (multi-select)')
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

    _setSelectorStatus('IMPORTING SAVE...');

    try {
      const bytes = await _downloadDriveBytes(doc.id);

      if (!bytes?.byteLength) {
        throw new Error('EMPTY OR UNREADABLE SAVE');
      }

      let entry = _getSaveEntry(forRom.file);

      if (!entry) {
        entry = {
          romFile: forRom.file,
          v: 2,
          activeId: null,
          backupId: null,
          sourceId: null,
          legacyId: null
        };
        _cache.romIndex.saves.push(entry);
      }

      // Backup the imported file once, so we can restore it later
      const backupId = await _writeAppFileBytes(
        _batteryBackupName(forRom.file),
        bytes,
        entry.backupId || null
      );

      // Active working copy
      const activeId = await _writeAppFileBytes(
        _batteryActiveName(forRom.file),
        bytes,
        entry.activeId || null
      );

      if (!activeId) {
        throw new Error('FAILED TO WRITE ACTIVE SAVE');
      }

      entry.activeId = activeId;
      if (backupId) entry.backupId = backupId;

      entry.sourceId = doc.id;
      entry.sourceName = doc.name;
      entry.v = 2;
      entry.updatedAt = Date.now();

      await _saveRomIndex();

      _setSelectorStatus('SAVE IMPORTED — ORIGINAL NOT MODIFIED');
      dbg('Save imported safely: ' + doc.name + ' → ' + forRom.file);
      _rebuildRomDots();
    } catch (err) {
      dbg('Import save ERR: ' + err.message);
      _setSelectorStatus('SAVE IMPORT FAILED');
    }

    return;
  }

  // ── ROM / BIOS mode ──────────────────────────────────────────
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const skippedNames = [];

  for (const doc of docs) {
    const { type, system } = _classifyPickedFile(doc.name);

    if (type === 'unknown') {
      skipped++;
      skippedNames.push(doc.name);
      continue;
    }

    if (type === 'bios') {
      const existing = _cache.romIndex.bios.find(
        b => b.file.toLowerCase() === doc.name.toLowerCase()
      );

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

      const byName = _cache.romIndex.roms.find(
        r => r.file.toLowerCase() === doc.name.toLowerCase()
      );

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
// BIOS LOADING — from index
// ══════════════════════════════════════════════════════════════
async function _loadBios(core) {
  const config = BIOS_REGISTRY[core];
  if (!config) return true;

  if (!_cache.romIndex) return false;

  const entry = _cache.romIndex.bios.find(b =>
    config.files.some(f => f.toLowerCase() === b.file.toLowerCase())
  );

  if (!entry) {
    dbg('No matching BIOS found for ' + core + ' — falling back to HLE');
    delete window[config.ejsVar];
    return !config.required;
  }

  try {
    const url = await driveDownloadBlob(entry.id, _cache.biosBlobs, 'BIOS ' + entry.file);
    window[config.ejsVar] = url;
    dbg('BIOS active: ' + entry.file + ' → ' + config.ejsVar);
    return true;
  } catch (err) {
    dbg('BIOS download error (' + entry.file + '): ' + err.message);
    delete window[config.ejsVar];
    return !config.required;
  }
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
// BATTERY SAVE — SAFE APPDATA WORKING COPY
// File IDs live in romIndex.saves[].
// On launch: download active copy, inject into Emscripten FS.
// On exit + every 5 min: extract SRAM, write active appData copy.
// The original Picker-selected file is never automatically overwritten.
// ══════════════════════════════════════════════════════════════
async function _cloudBatteryDownload(romFile) {
  if (!_cache.romIndex) return null;

  const entry = _getSaveEntry(romFile);
  if (!entry) {
    dbg('No battery save in index for: ' + romFile);
    return null;
  }

  try {
    let source = 'active';
    let bytes = entry.activeId ? await _downloadDriveBytes(entry.activeId) : null;

    if (!bytes && entry.backupId) {
      bytes = await _downloadDriveBytes(entry.backupId);
      source = 'backup';
    }

    if (!bytes && entry.legacyId) {
      bytes = await _downloadDriveBytes(entry.legacyId);
      source = 'legacy';
    }

    if (!bytes && entry.id) {
      bytes = await _downloadDriveBytes(entry.id);
      source = 'legacy';
    }

    if (!bytes?.byteLength) {
      dbg('No usable battery save bytes for: ' + romFile);
      return null;
    }

    // If active copy was missing, recreate it from backup/legacy
    if (source !== 'active') {
      const activeId = await _writeAppFileBytes(
        _batteryActiveName(romFile),
        bytes,
        entry.activeId || null
      );

      if (activeId) {
        entry.activeId = activeId;
        await _saveRomIndex();
        dbg('Recreated active battery save from ' + source + ' for: ' + romFile);
      }
    }

    dbg('Battery DL: ' + bytes.byteLength + 'B');
    return bytes;
  } catch (err) {
    dbg('Battery DL ERR: ' + err.message);
    return null;
  }
}

async function _cloudBatteryUpload(romFile, bytes) {
  if (!_cache.romIndex) return false;

  await _ensureFreshToken();

  let entry = _getSaveEntry(romFile);

  if (!entry) {
    entry = {
      romFile,
      v: 2,
      activeId: null,
      backupId: null,
      sourceId: null,
      legacyId: null
    };
    _cache.romIndex.saves.push(entry);
  }

  const activeId = await _writeAppFileBytes(
    _batteryActiveName(romFile),
    bytes,
    entry.activeId || null
  );

  if (!activeId) {
    dbg('Battery UL FAILED for: ' + romFile);
    return false;
  }

  entry.activeId = activeId;
  entry.v = 2;
  entry.updatedAt = Date.now();

  await _saveRomIndex();

  dbg('Battery UL OK (appData active) for: ' + romFile);
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
        } catch {}
      }, 200);
    } else {
      dbg('Battery save active in SRAM (' + live.byteLength + 'B)');
    }
  }, 20);
}

// ══════════════════════════════════════════════════════════════
// SAFE SAVE MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════
async function _exportBatterySaveToDrive(rom) {
  const entry = _getSaveEntry(rom.file);

  if (!entry) {
    _setSelectorStatus('NO SAVE TO EXPORT');
    return;
  }

  const bytes = await _downloadSaveEntryBytes(entry);

  if (!bytes?.byteLength) {
    _setSelectorStatus('EXPORT FAILED — NO DATA');
    return;
  }

  const folderId = await _ensureSaveFolder();

  if (!folderId) {
    _setSelectorStatus('EXPORT FAILED — NO FOLDER');
    return;
  }

  const base = rom.file.replace(/\.[^.]+$/, '');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${base}.export-${ts}.sav`;

  const newId = await _driveCreateOwnedFile(filename, folderId, bytes);

  if (!newId) {
    _setSelectorStatus('EXPORT FAILED');
    return;
  }

  entry.exportedId = newId;
  entry.exportedAt = Date.now();

  await _saveRomIndex();

  _setSelectorStatus('EXPORTED TO DRIVE');
  dbg('Exported active save to Drive: ' + filename);
}

async function _restoreBatteryBackup(rom) {
  const entry = _getSaveEntry(rom.file);

  if (!entry?.backupId) {
    _setSelectorStatus('NO BACKUP AVAILABLE');
    return;
  }

  const bytes = await _downloadDriveBytes(entry.backupId);

  if (!bytes?.byteLength) {
    _setSelectorStatus('RESTORE FAILED — NO DATA');
    return;
  }

  const activeId = await _writeAppFileBytes(
    _batteryActiveName(rom.file),
    bytes,
    entry.activeId || null
  );

  if (!activeId) {
    _setSelectorStatus('RESTORE FAILED');
    return;
  }

  entry.activeId = activeId;
  entry.updatedAt = Date.now();

  await _saveRomIndex();
  _rebuildRomDots();

  _setSelectorStatus('RESTORED FROM BACKUP');
  dbg('Restored battery backup for: ' + rom.file);
}

async function _deleteBatterySave(rom) {
  if (!_cache.romIndex) return;

  const entry = _getSaveEntry(rom.file);

  if (!entry) {
    _setSelectorStatus('NO SAVE TO DELETE');
    return;
  }

  // Delete only app-managed copies, not the user's original source file
  if (entry.activeId) await _driveDeleteFile(entry.activeId);
  if (entry.backupId) await _driveDeleteFile(entry.backupId);

  _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.romFile !== rom.file);

  await _saveRomIndex();
  _rebuildRomDots();

  _setSelectorStatus('SAVE DELETED — ORIGINAL FILE UNTOUCHED');
  dbg('Deleted battery save entry for: ' + rom.file);
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
  _filteredRoms = _activeCategory === 'all'
    ? [...ROMS]
    : ROMS.filter(r => r.system === _activeCategory);
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
    block: 'nearest'
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
    const saveDot = hasSave ? '<span class="rom-save-dot"></span>' : '';

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
    list.innerHTML = `<div class="rom-list-msg">NO ROMS YET<br><br>Press <span class="msg-gold">+</span> to pick ROM files<br>directly from your Google Drive.<br><br><span style="color:var(--text-mut);font-size:7px;line-height:2;">Select any .gb .gbc .gba .nes .sfc<br>.chd .gg .sms .md files — or BIOS<br>files like scph1001.bin for PS1.</span></div>`;
  }
}

// ══════════════════════════════════════════════════════════════
// ROM OPTIONS OVERLAY
// Triggered by * key on selector screen.
// Dynamic options:
// LAUNCH / IMPORT SAVE / RESTORE BACKUP / EXPORT SAVE / DELETE SAVE / REMOVE FROM LIST
// ══════════════════════════════════════════════════════════════
function _getRomOptions(rom) {
  const entry = rom ? _getSaveEntry(rom.file) : null;

  const opts = ['LAUNCH', 'IMPORT SAVE'];

  if (entry?.backupId) opts.push('RESTORE BACKUP');
  if (entry) opts.push('EXPORT SAVE');
  if (entry) opts.push('DELETE SAVE');

  opts.push('REMOVE FROM LIST');

  return opts;
}

function _showRomOptions() {
  const rom = _filteredRoms[_romIndex];
  if (!rom) return;

  _romOptionsIndex = 0;
  _romOptions = _getRomOptions(rom);

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

  _romOptions.forEach((label, i) => {
    const el = document.createElement('div');
    el.className = 'rom-option-item' + (i === _romOptionsIndex ? ' selected' : '');
    el.textContent = label;
    grid.appendChild(el);
  });
}

function _navigateRomOptions(dir) {
  if (!_romOptions.length) return;
  _romOptionsIndex = (_romOptionsIndex + dir + _romOptions.length) % _romOptions.length;
  _renderRomOptions();
}

async function _confirmRomOption() {
  const rom = _filteredRoms[_romIndex];
  if (!rom) {
    _closeRomOptions();
    return;
  }

  const choice = _romOptions[_romOptionsIndex];

  // Simple confirmation for destructive action
  if (choice === 'DELETE SAVE') {
    _romOptions = ['CONFIRM DELETE SAVE', 'CANCEL'];
    _romOptionsIndex = 0;
    _renderRomOptions();
    return;
  }

  if (choice === 'CANCEL') {
    _closeRomOptions();
    return;
  }

  _closeRomOptions();

  if (choice === 'LAUNCH') {
    launchRom(_romIndex);
  } else if (choice === 'IMPORT SAVE') {
    await openPicker('save', rom);
  } else if (choice === 'RESTORE BACKUP') {
    await _restoreBatteryBackup(rom);
  } else if (choice === 'EXPORT SAVE') {
    await _exportBatterySaveToDrive(rom);
  } else if (choice === 'CONFIRM DELETE SAVE') {
    await _deleteBatterySave(rom);
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
    ['RSK', 'EXIT']
  ]
    .map(([k, a]) => `<div class="hint-row"><span class="hint-key">${k}</span><span class="hint-action">${a}</span></div>`)
    .join('');
}

function ensureLoadingMsg() {
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
    'position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;color:#00ff41;font-family:"Press Start 2P",monospace;font-size:8px;letter-spacing:2px;flex-direction:column;gap:14px;z-index:10;text-align:center;padding:16px;';

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

  // Clear global BIOS attachment so it doesn't leak into other cores
  delete window.EJS_biosUrl;

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
    } catch {}
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

    if (err.message.includes('404')) {
      _cache.romIndex.roms = _cache.romIndex.roms.filter(r => r.id !== rom.fileId);
      await _saveRomIndex();
      _rebuildRomsFromIndex();
      _buildRomList();
      _setSelectorStatus('REMOVED: ' + rom.name.toUpperCase() + ' (NOT IN DRIVE)');
    } else {
      _setSelectorStatus('ROM DL FAILED', 4000);
    }

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
    } catch {}
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

  const biosLoaded = await _loadBios(rom.core);

  if (!biosLoaded) {
    dbg('WARNING: Starting ' + rom.name + ' without a BIOS (HLE mode)');
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
    3: {}
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
      dbg('EJS instance created');
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

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.className = 'ejs-script';
    script.onerror = () => {
      dbg('EJS loader.js FAILED');

      const lm = document.getElementById('loading-msg');
      if (lm) lm.innerHTML = 'EMULATOR LOAD FAILED<br><span style="font-size:8px;color:#555">Check your connection</span>';
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
    // On selector: RSK closes rom-options if open
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
    // ROM options overlay navigation
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

      if (_filteredRoms.length === 0) return;

      if (isCatBtn || isHeaderBtn) _focusRomItem(_romIndex);
      else if (isRomItem && _romIndex < _filteredRoms.length - 1) _updateSelection(_romIndex + 1);

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

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

  // Preload GIS and gapi so popups aren't blocked by browser gesture timeouts
  _loadGis().catch(e => dbg('GIS preload failed: ' + e.message));
  _loadGapi().catch(e => dbg('gapi preload failed: ' + e.message));

  _loadRomIndex();
};
