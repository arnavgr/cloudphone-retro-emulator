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
  { key: '#', action: 'FAST FORWARD' },
  { key: '*', action: 'MENU' },
  { key: '0', action: 'CONTROLS' },
  { key: 'RSK', action: 'EXIT' },
];

function getKeybinds(rom) {
  const ls = rom.landscape;
  switch (rom.folder) {
    case 'gbc':     return [...(ls ? _KL : _KP), ..._KMETA];
    case 'gba':     return [..._KP, ..._KMETA];
    case 'gg':      return [...(ls ? _KL_GEN : _KP_GEN), ..._KMETA];
    case 'sms':     return [...(ls ? _KL : _KP), ..._KMETA];
    case 'genesis': return [..._KL_GEN, ..._KMETA];
    case 'nes':
    case 'snes':
    case 'psx':     return [..._KL, ..._KMETA];
    default:        return [..._KP, ..._KMETA];
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
const SAVE_FOLDER_NAME = 'cloudphone-emulator-saves';
const PICKER_API_KEY = 'AIzaSyBXEs-NFca5LOW0Y-mzn48hvTuCGR1pIF4';
const GOOGLE_OAUTH_CLIENT_ID = '924408688373-brjd67ahhkib1s3d5cplpaamscb3loe1.apps.googleusercontent.com';

const BIOS_FILENAMES = new Set([
  'scph1001.bin', 'scph5501.bin', 'scph7001.bin', 'scph7501.bin', 'scph101.bin',
  'scph1002.bin', 'scph5502.bin', 'scph7002.bin', 'scph7502.bin', 'scph102.bin',
  'scph1000.bin', 'scph3000.bin', 'scph5000.bin', 'scph5500.bin', 'scph7000.bin', 'scph100.bin',
  'psxonpsp660.bin'
]);

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
// CACHE & APP STATE
// ══════════════════════════════════════════════════════════════
const _cache = {
  romIndex: null,   // { version, saveFolderId, roms[], bios[], saves[], states[], cheats{} }
  indexFileId: null,
  romBlobs: {},
  biosBlobs: {},
};

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
let _gisReady = false;
let _romOptionsIndex = 0;
let _romOptions = [];
let _inGameMenuOpen = false;
let _isFastForward = false;
const _log = [];

// ══════════════════════════════════════════════════════════════
// AUDIO ENGINE (AUTOPLAY RESUME & VOLUME CONTROLS)
// ══════════════════════════════════════════════════════════════
let _audioEnabled = (() => {
  try { return localStorage.getItem('emu_audio_pref') === '1'; } catch { return false; }
})();

let _audioVolume = (() => {
  try {
    const v = localStorage.getItem('emu_volume');
    return v !== null ? parseFloat(v) : 0.75;
  } catch { return 0.75; }
})();

const _trackedAudioContexts = new Set();
const _OrigAudioContext = window.AudioContext || window.webkitAudioContext;

if (_OrigAudioContext) {
  const PatchedAudioContext = function(...args) {
    const ctx = new _OrigAudioContext(...args);
    _trackedAudioContexts.add(ctx);
    return ctx;
  };
  PatchedAudioContext.prototype = _OrigAudioContext.prototype;
  try {
    window.AudioContext = PatchedAudioContext;
    if (window.webkitAudioContext) window.webkitAudioContext = PatchedAudioContext;
  } catch {}
}

function _unlockAudioContext() {
  try {
    if (_OrigAudioContext) {
      const tempCtx = new _OrigAudioContext();
      _trackedAudioContexts.add(tempCtx);
      tempCtx.resume().catch(() => {});
    }
  } catch {}
}

function _resumeAudio() {
  if (!_audioEnabled) return;
  for (const ctx of _trackedAudioContexts) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
}

function _applyAudioSettings() {
  const effectiveVol = _audioEnabled ? _audioVolume : 0;
  try {
    const gm = window.EJS_emulator?.gameManager;
    if (gm?.setVolume) {
      gm.setVolume(effectiveVol);
    } else if (window.EJS_emulator?.setVolume) {
      window.EJS_emulator.setVolume(effectiveVol);
    }
  } catch {}

  if (_audioEnabled) {
    _resumeAudio();
  }
}

function _adjustVolume(delta) {
  _audioVolume = Math.round(Math.max(0, Math.min(1, _audioVolume + delta)) * 100) / 100;
  if (!_audioEnabled && delta > 0) _audioEnabled = true;
  try {
    localStorage.setItem('emu_volume', _audioVolume.toString());
    localStorage.setItem('emu_audio_pref', _audioEnabled ? '1' : '0');
  } catch {}
  _applyAudioSettings();
}

function _toggleAudio() {
  _audioEnabled = !_audioEnabled;
  try { localStorage.setItem('emu_audio_pref', _audioEnabled ? '1' : '0'); } catch {}
  _applyAudioSettings();
}

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
        ? 'width:100vh;height:100vw;transform:rotate(90deg) translateZ(0);transform-origin:top left;margin-left:100vw;'
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
      setTimeout(() => { logEl.scrollTop = logEl.scrollHeight; }, 0);
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
// ══════════════════════════════════════════════════════════════
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

      if (res.status === 404) {
        throw new Error('File not found in Drive (404). Open * → REMOVE FROM LIST, then re-add with +.');
      }

      if (res.status === 401 || res.status === 403) {
        dbg(label + ' download auth ' + res.status + ' (attempt ' + (attempt + 1) + ') — forcing token refresh');
        window._providerToken = null;
        const fresh = await window.getDriveToken();
        if (!fresh) throw new Error('Token refresh failed — sign out and sign in again.');
        lastErr = new Error('Auth error ' + res.status + ' (will retry)');
        await new Promise(r => setTimeout(r, 600));
        continue;
      }

      if (res.status >= 500) {
        lastErr = new Error('Drive server error ' + res.status);
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }

      throw new Error('Drive download HTTP ' + res.status);
    } catch (err) {
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

  const meta = JSON.stringify({ name: filename, parents: ['appDataFolder'] });
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

async function _driveCreateOwnedFile(filename, parentId, bytes) {
  const boundary = 'emu_battery_boundary';
  const meta = JSON.stringify({ name: filename, parents: [parentId] });

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
// DELIMITER-SAFE STORAGE KEY GENERATORS
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

function _saveKey(gameName) {
  const uid = window.currentUser?.id || 'anon';
  const base = String(gameName).replace(/\.[^.]+$/, '');
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '');
  const slotSuffix = _currentSlot === 0 ? '' : '_slot' + _currentSlot;
  return uid + '_' + safe + slotSuffix + '.state';
}

function _stateKeysForRom(romFile) {
  const uid = window.currentUser?.id || 'anon';
  const base = String(romFile).replace(/\.[^.]+$/, '');
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '');
  const keys = [uid + '_' + safe + '.state'];
  for (let s = 1; s < MAX_SLOTS; s++) keys.push(uid + '_' + safe + '_slot' + s + '.state');
  return keys;
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
  const meta = JSON.stringify({ name: filename, parents: ['appDataFolder'] });
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

  if (changed) await _saveRomIndex();
}

// ══════════════════════════════════════════════════════════════
// TOKEN REFRESH
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

// ══════════════════════════════════════════════════════════════
// ROM INDEX — appDataFolder
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
    saves: [],
    states: [],
    cheats: {}
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
    _cache.romIndex.states = _cache.romIndex.states || [];
    _cache.romIndex.cheats = _cache.romIndex.cheats || {};

    await _migrateSavesToAppData();
    dbg('ROM index: ' + _cache.romIndex.roms.length + ' ROMs / ' + _cache.romIndex.saves.length + ' saves / ' + _cache.romIndex.states.length + ' states');

    _rebuildRomsFromIndex();
    if (ROMS.length === 0) _showEmptyState();
    else _buildRomList();

    if (_cache.romIndex.roms.length > 0) {
      _validateRomIndex().then(() => {
        if (ROMS.length !== _cache.romIndex.roms.length) _buildRomList();
      });
    }
  } catch (err) {
    dbg('_loadRomIndex ERR: ' + err.message);
    _setRomListMsg('INDEX ERROR: ' + err.message);
  }
}

async function _validateRomIndex() {
  if (!_cache.romIndex || _cache.romIndex.roms.length === 0) return;
  let removedCount = 0;
  const validRoms = [];

  for (const rom of _cache.romIndex.roms) {
    try {
      const res = await window.driveApiFetch(`${DRIVE_API}/files/${rom.id}?fields=id,trashed&supportsAllDrives=true`);
      if (res.ok) {
        const data = await res.json();
        if (!data.trashed) validRoms.push(rom);
        else removedCount++;
      } else if (res.status === 404) {
        removedCount++;
      } else {
        validRoms.push(rom);
      }
    } catch {
      validRoms.push(rom);
    }
  }

  if (removedCount > 0) {
    _cache.romIndex.roms = validRoms;
    await _saveRomIndex();
    _rebuildRomsFromIndex();
    _setSelectorStatus('REMOVED ' + removedCount + ' MISSING ROM' + (removedCount > 1 ? 'S' : ''));
  }
}

async function _saveRomIndex() {
  if (!_cache.romIndex) return false;
  await _ensureFreshToken();
  const bytes = new TextEncoder().encode(JSON.stringify(_cache.romIndex));
  const ok = await driveWriteAppFile(_indexKey(), bytes, _cache.indexFileId || null);

  if (ok && !_cache.indexFileId) {
    _cache.indexFileId = await driveFindAppFile(_indexKey());
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
    folder: r.system,
  }));
}

async function _ensureSaveFolder() {
  if (_cache.romIndex?.saveFolderId) return _cache.romIndex.saveFolderId;
  const folderId = await driveCreateFolder(SAVE_FOLDER_NAME, null);
  if (folderId && _cache.romIndex) {
    _cache.romIndex.saveFolderId = folderId;
    await _saveRomIndex();
  }
  return folderId || null;
}

function _classifyPickedFile(name) {
  const lower = name.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));

  if (ext === '.bin') {
    return BIOS_FILENAMES.has(lower)
      ? { type: 'bios', system: null }
      : { type: 'rom', system: 'genesis' };
  }
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
      gapi.load('picker', { callback: () => { _gapiReady = true; resolve(); }, onerror: reject });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://apis.google.com/js/api.js';
    s.onload = () => gapi.load('picker', { callback: () => { _gapiReady = true; resolve(); }, onerror: reject });
    s.onerror = () => reject(new Error('gapi script blocked'));
    document.head.appendChild(s);
  });
}

async function _loadGis() {
  if (_gisReady) return;
  await new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { _gisReady = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => { _gisReady = true; resolve(); };
    s.onerror = () => reject(new Error('GIS script blocked'));
    document.head.appendChild(s);
  });
}

function _refreshDriveAuthForPicker() {
  return new Promise((resolve) => {
    if (!GOOGLE_OAUTH_CLIENT_ID || GOOGLE_OAUTH_CLIENT_ID.startsWith('PUT_YOUR')) {
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
            resolve(resp.access_token);
          } else {
            resolve(window._providerToken);
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch {
      resolve(window._providerToken);
    }
  });
}

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
    await _loadGis();
  } catch (err) {
    _setSelectorStatus('PICKER LOAD FAILED');
    dbg('gapi ERR: ' + err.message);
    return;
  }

  let token = window._providerToken;
  try {
    token = await _refreshDriveAuthForPicker();
  } catch {}

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
      .setTitle(mode === 'save' ? 'SELECT SAVE FILE for ' + (forRom?.name || '') : 'SELECT ROM & BIOS FILES')
      .addView(view)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setCallback(async (data) => {
        const action = data[google.picker.Response.ACTION];
        if (action === google.picker.Action.PICKED) {
          window._pickerOpen = false;
          if (_prevFocused?.focus) _prevFocused.focus();
          const docs = data[google.picker.Response.DOCUMENTS];
          await _processPickedFiles(docs, mode, forRom);
          resolve(docs);
        } else if (action === google.picker.Action.CANCEL) {
          window._pickerOpen = false;
          if (_prevFocused?.focus) _prevFocused.focus();
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
  if (!_cache.romIndex) _cache.romIndex = _emptyIndex();

  if (mode === 'save' && forRom) {
    if (!docs.length) return;
    const doc = docs[0];
    _setSelectorStatus('IMPORTING SAVE...');
    try {
      const bytes = await _downloadDriveBytes(doc.id);
      if (!bytes?.byteLength) throw new Error('EMPTY SAVE');

      let entry = _getSaveEntry(forRom.file);
      if (!entry) {
        entry = { romFile: forRom.file, v: 2, activeId: null, backupId: null, sourceId: null, legacyId: null };
        _cache.romIndex.saves.push(entry);
      }

      const backupId = await _writeAppFileBytes(_batteryBackupName(forRom.file), bytes, entry.backupId || null);
      const activeId = await _writeAppFileBytes(_batteryActiveName(forRom.file), bytes, entry.activeId || null);
      if (!activeId) throw new Error('WRITE FAILED');

      entry.activeId = activeId;
      if (backupId) entry.backupId = backupId;
      entry.sourceId = doc.id;
      entry.sourceName = doc.name;
      entry.v = 2;
      entry.updatedAt = Date.now();

      await _saveRomIndex();
      _setSelectorStatus('SAVE IMPORTED SAFELY');
      _rebuildRomDots();
    } catch (err) {
      dbg('Import save ERR: ' + err.message);
      _setSelectorStatus('SAVE IMPORT FAILED');
    }
    return;
  }

  let added = 0;
  let updated = 0;

  for (const doc of docs) {
    const { type, system } = _classifyPickedFile(doc.name);
    if (type === 'unknown') continue;

    if (type === 'bios') {
      const existing = _cache.romIndex.bios.find(b => b.file.toLowerCase() === doc.name.toLowerCase());
      if (existing) { existing.id = doc.id; updated++; }
      else { _cache.romIndex.bios.push({ id: doc.id, file: doc.name }); added++; }
      continue;
    }

    if (type === 'rom') {
      const sys = SYSTEMS[system];
      if (!sys) continue;

      const byId = _cache.romIndex.roms.find(r => r.id === doc.id);
      if (byId) { updated++; continue; }

      const byName = _cache.romIndex.roms.find(r => r.file.toLowerCase() === doc.name.toLowerCase());
      if (byName) { byName.id = doc.id; updated++; continue; }

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
    }
  }

  await _saveRomIndex();
  _rebuildRomsFromIndex();
  _buildRomList();
  _setSelectorStatus((added ? added + ' ADDED ' : '') + (updated ? updated + ' UPDATED' : '') || 'NO CHANGES');
}

// ══════════════════════════════════════════════════════════════
// BIOS LOADING
// ══════════════════════════════════════════════════════════════
async function _loadBios(core) {
  const config = BIOS_REGISTRY[core];
  if (!config) return true;
  if (!_cache.romIndex) return false;

  const entry = _cache.romIndex.bios.find(b =>
    config.files.some(f => f.toLowerCase() === b.file.toLowerCase())
  );

  if (!entry) {
    delete window[config.ejsVar];
    return !config.required;
  }

  try {
    const url = await driveDownloadBlob(entry.id, _cache.biosBlobs, 'BIOS ' + entry.file);
    window[config.ejsVar] = url;
    return true;
  } catch {
    delete window[config.ejsVar];
    return !config.required;
  }
}

// ══════════════════════════════════════════════════════════════
// SAVE STATES (INDEXED APPDATAFOLDER)
// ══════════════════════════════════════════════════════════════
const _stateAbsent = new Set();

function _getStateEntry(key) {
  return _cache.romIndex?.states?.find(s => s.key === key) || null;
}

function _registerStateEntry(key, fileId) {
  if (!_cache.romIndex) return null;
  if (!_cache.romIndex.states) _cache.romIndex.states = [];
  let entry = _cache.romIndex.states.find(s => s.key === key);
  if (!entry) {
    entry = { key, fileId, slot: _currentSlot, updatedAt: Date.now() };
    _cache.romIndex.states.push(entry);
  } else {
    entry.fileId = fileId;
    entry.updatedAt = Date.now();
  }
  _saveRomIndex();
  return entry;
}

function _removeStateEntry(key) {
  if (!_cache.romIndex?.states) return;
  _cache.romIndex.states = _cache.romIndex.states.filter(s => s.key !== key);
}

async function _cloudSaveExists(gameName) {
  const key = _saveKey(gameName);
  if (_getStateEntry(key)) return true;
  if (_stateAbsent.has(key)) return false;

  try {
    const legacyId = await driveFindAppFile(key);
    if (legacyId) {
      _registerStateEntry(key, legacyId);
      return true;
    }
    _stateAbsent.add(key);
    return false;
  } catch {
    return false;
  }
}

async function _cloudDownload(gameName) {
  const key = _saveKey(gameName);
  try {
    let entry = _getStateEntry(key);
    if (!entry) {
      const legacyId = await driveFindAppFile(key);
      if (!legacyId) {
        _stateAbsent.add(key);
        return null;
      }
      entry = _registerStateEntry(key, legacyId);
    }

    const res = await window.driveApiFetch(`${DRIVE_API}/files/${entry.fileId}?alt=media`);
    if (!res.ok) {
      if (res.status === 404) {
        _removeStateEntry(key);
        _stateAbsent.add(key);
      }
      return null;
    }

    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch (err) {
    dbg('_cloudDownload ERR: ' + err.message);
    return null;
  }
}

async function _cloudUpload(gameName, bytes) {
  const key = _saveKey(gameName);
  await _ensureFreshToken();
  try {
    const entry = _getStateEntry(key);
    const fileId = await _writeAppFileBytes(key, bytes, entry?.fileId || null);
    if (!fileId) return false;

    if (entry) {
      entry.fileId = fileId;
      entry.slot = _currentSlot;
      entry.updatedAt = Date.now();
    } else {
      if (!_cache.romIndex.states) _cache.romIndex.states = [];
      _cache.romIndex.states.push({ key, fileId, slot: _currentSlot, updatedAt: Date.now() });
    }

    _stateAbsent.delete(key);
    await _saveRomIndex();
    _tokenLastRefreshed = Date.now();
    return true;
  } catch (err) {
    dbg('_cloudUpload ERR: ' + err.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// BATTERY SAVE & SRAM DIRTY CHECKING
// ══════════════════════════════════════════════════════════════
let _lastSramSnapshot = null;

function _updateSramSnapshot(bytes) {
  _lastSramSnapshot = bytes ? new Uint8Array(bytes) : null;
}

function _sramIsDirty(bytes) {
  const prev = _lastSramSnapshot;
  if (!prev || prev.byteLength !== bytes.byteLength) return true;
  const len = bytes.byteLength;
  const dvA = new DataView(bytes.buffer, bytes.byteOffset, len);
  const dvB = new DataView(prev.buffer, prev.byteOffset, len);
  const end4 = len - (len % 4);

  for (let i = 0; i < end4; i += 4) {
    if (dvA.getUint32(i) !== dvB.getUint32(i)) return true;
  }
  for (let i = end4; i < len; i++) {
    if (bytes[i] !== prev[i]) return true;
  }
  return false;
}

async function _cloudBatteryDownload(romFile) {
  if (!_cache.romIndex) return null;
  const entry = _getSaveEntry(romFile);
  if (!entry) return null;

  try {
    let source = 'active';
    let bytes = entry.activeId ? await _downloadDriveBytes(entry.activeId) : null;

    if (!bytes && entry.backupId) { bytes = await _downloadDriveBytes(entry.backupId); source = 'backup'; }
    if (!bytes && entry.legacyId) { bytes = await _downloadDriveBytes(entry.legacyId); source = 'legacy'; }

    if (!bytes?.byteLength) return null;

    if (source !== 'active') {
      const activeId = await _writeAppFileBytes(_batteryActiveName(romFile), bytes, entry.activeId || null);
      if (activeId) {
        entry.activeId = activeId;
        await _saveRomIndex();
      }
    }
    return bytes;
  } catch (err) {
    dbg('_cloudBatteryDownload ERR: ' + err.message);
    return null;
  }
}

async function _cloudBatteryUpload(romFile, bytes) {
  if (!_cache.romIndex) return false;
  await _ensureFreshToken();

  let entry = _getSaveEntry(romFile);
  if (!entry) {
    entry = { romFile, v: 2, activeId: null, backupId: null, sourceId: null, legacyId: null };
    _cache.romIndex.saves.push(entry);
  }

  const activeId = await _writeAppFileBytes(_batteryActiveName(romFile), bytes, entry.activeId || null);
  if (!activeId) return false;

  entry.activeId = activeId;
  entry.v = 2;
  entry.updatedAt = Date.now();
  await _saveRomIndex();
  return true;
}

async function _extractAndUploadBattery(rom) {
  if (!window.EJS_emulator || !rom) return;
  try {
    const gm = window.EJS_emulator.gameManager;
    const FS = window.EJS_emulator.Module?.FS;
    if (!gm || !FS || typeof gm.getSaveFilePath !== 'function') return;

    try { gm.saveSaveFiles(); } catch {}
    await new Promise(r => setTimeout(r, 100));

    const savePath = gm.getSaveFilePath();
    if (!savePath) return;

    const srm = FS.readFile(savePath);
    if (!srm?.byteLength) return;

    const isBlank = [...srm.slice(0, 64)].every(b => b === 0x00 || b === 0xFF);
    if (isBlank) return;

    if (!_sramIsDirty(srm)) {
      dbg('Battery extract: SRAM unchanged — upload skipped');
      return;
    }

    await _cloudBatteryUpload(rom.file, srm);
    _updateSramSnapshot(srm);
    dbg('Battery auto-save committed');
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
    if (!bytes?.byteLength) return;

    const savePath = gm.getSaveFilePath();
    const parts = savePath.split('/').filter(Boolean);
    let built = '';

    for (let i = 0; i < parts.length - 1; i++) {
      built += '/' + parts[i];
      try { FS.mkdir(built); } catch {}
    }

    FS.writeFile(savePath, bytes);
    _updateSramSnapshot(bytes);

    try { gm.loadSaveFiles(); } catch {}
    await new Promise(r => setTimeout(r, 300));

    const live = gm.getSaveFile?.();
    const isEmpty = !live || [...live.slice(0, 32)].every(b => b === 0x00 || b === 0xFF);

    if (isEmpty) {
      setTimeout(() => { try { gm.restart(); } catch {} }, 200);
    }
  }, 20);
}

// ══════════════════════════════════════════════════════════════
// EXPORT, BACKUP RESTORE, DELETE, AND GC
// ══════════════════════════════════════════════════════════════
async function _exportBatterySaveToDrive(rom) {
  const entry = _getSaveEntry(rom.file);
  if (!entry) { _setSelectorStatus('NO SAVE TO EXPORT'); return; }

  const bytes = await _downloadSaveEntryBytes(entry);
  if (!bytes?.byteLength) { _setSelectorStatus('EXPORT FAILED — NO DATA'); return; }

  const folderId = await _ensureSaveFolder();
  if (!folderId) { _setSelectorStatus('EXPORT FAILED — NO FOLDER'); return; }

  const base = rom.file.replace(/\.[^.]+$/, '');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${base}.export-${ts}.sav`;

  const newId = await _driveCreateOwnedFile(filename, folderId, bytes);
  if (!newId) { _setSelectorStatus('EXPORT FAILED'); return; }

  entry.exportedId = newId;
  entry.exportedAt = Date.now();
  await _saveRomIndex();
  _setSelectorStatus('EXPORTED TO DRIVE');
}

async function _restoreBatteryBackup(rom) {
  const entry = _getSaveEntry(rom.file);
  if (!entry?.backupId) { _setSelectorStatus('NO BACKUP AVAILABLE'); return; }

  const bytes = await _downloadDriveBytes(entry.backupId);
  if (!bytes?.byteLength) { _setSelectorStatus('RESTORE FAILED'); return; }

  const activeId = await _writeAppFileBytes(_batteryActiveName(rom.file), bytes, entry.activeId || null);
  if (!activeId) { _setSelectorStatus('RESTORE FAILED'); return; }

  entry.activeId = activeId;
  entry.updatedAt = Date.now();
  await _saveRomIndex();
  _rebuildRomDots();
  _setSelectorStatus('RESTORED FROM BACKUP');
}

async function _deleteBatterySave(rom) {
  if (!_cache.romIndex) return;
  const entry = _getSaveEntry(rom.file);
  if (!entry) { _setSelectorStatus('NO SAVE TO DELETE'); return; }

  if (entry.activeId) await _driveDeleteFile(entry.activeId);
  if (entry.backupId) await _driveDeleteFile(entry.backupId);

  _cache.romIndex.saves = _cache.romIndex.saves.filter(s => s.romFile !== rom.file);
  await _saveRomIndex();
  _rebuildRomDots();
  _setSelectorStatus('SAVE DELETED');
}

async function _gcRomArtifacts(rom) {
  if (!_cache.romIndex) return;
  let deleted = 0;

  const saveEntry = _getSaveEntry(rom.file);
  if (saveEntry) {
    if (saveEntry.activeId && await _driveDeleteFile(saveEntry.activeId)) deleted++;
    if (saveEntry.backupId && await _driveDeleteFile(saveEntry.backupId)) deleted++;
    _cache.romIndex.saves = (_cache.romIndex.saves || []).filter(s => s.romFile !== rom.file);
  }

  if (_cache.romIndex.cheats && _cache.romIndex.cheats[rom.file]) {
    delete _cache.romIndex.cheats[rom.file];
  }

  for (const key of _stateKeysForRom(rom.file)) {
    const st = _getStateEntry(key);
    if (st?.fileId) {
      if (await _driveDeleteFile(st.fileId)) deleted++;
    } else {
      let legacyId = null;
      try { legacyId = await driveFindAppFile(key); } catch {}
      if (legacyId && await _driveDeleteFile(legacyId)) deleted++;
    }
    _removeStateEntry(key);
  }
  dbg('GC: ' + deleted + ' artifact(s) pruned for ' + rom.file);
}

// ══════════════════════════════════════════════════════════════
// FAST FORWARD
// ══════════════════════════════════════════════════════════════
function _toggleFastForward() {
  const gm = window.EJS_emulator?.gameManager;
  if (!gm) return;

  _isFastForward = !_isFastForward;
  try {
    if (typeof gm.toggleFastForward === 'function') {
      gm.toggleFastForward();
    } else if (typeof gm.setSpeed === 'function') {
      gm.setSpeed(_isFastForward ? 2.0 : 1.0);
    } else if (window.EJS_emulator?.setSpeed) {
      window.EJS_emulator.setSpeed(_isFastForward ? 2.0 : 1.0);
    }
  } catch (e) {
    dbg('FF ERR: ' + e.message);
  }

  _setSaveStatus(_isFastForward ? 'FFWD: 2X' : 'FFWD: 1X', _isFastForward ? 'active' : '');
  _clearSaveStatus(1500);
}

// ══════════════════════════════════════════════════════════════
// CHEAT ENGINE
// ══════════════════════════════════════════════════════════════
let _cheatsOpen = false;
let _cheatsMode = 'list';
let _cheatsIndex = 0;
let _cheatsTarget = -1;
let _cheatsItems = [];

function _getCheatStore() {
  if (!_cache.romIndex) return {};
  if (!_cache.romIndex.cheats) _cache.romIndex.cheats = {};
  return _cache.romIndex.cheats;
}

function _activeTargetRom() {
  return _inGameMenuOpen ? _currentRom : _filteredRoms[_romIndex];
}

function _cheatsForRom(rom) {
  return _cache.romIndex?.cheats?.[rom?.file] || [];
}

function _setCheatsStatus(msg, isErr = false) {
  const el = document.getElementById('cheats-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'cheats-status' + (isErr ? ' err' : ' ok');
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 2500);
}

function _openCheats() {
  const rom = _activeTargetRom();
  if (!rom) return;

  if (_inGameMenuOpen) {
    document.getElementById('rom-options-overlay')?.classList.remove('visible');
  }

  _cheatsMode = 'list';
  _cheatsIndex = 0;
  _cheatsTarget = -1;
  _cheatsOpen = true;
  _renderCheats();

  const overlay = document.getElementById('cheats-overlay');
  if (overlay) {
    overlay.classList.add('visible');
    const list = document.getElementById('cheats-list');
    if (list) list.scrollTop = 0;
  }
}

function _closeCheats() {
  _cheatsOpen = false;
  document.getElementById('cheats-overlay')?.classList.remove('visible');
  if (_inGameMenuOpen) {
    document.getElementById('rom-options-overlay')?.classList.add('visible');
  }
}

function _buildCheatItems(rom) {
  const items = [{ type: 'add', label: '+ ADD CHEAT' }];
  _cheatsForRom(rom).forEach((c, i) => {
    items.push({
      type: 'cheat',
      index: i,
      label: c.code + (c.desc ? ' — ' + c.desc : ''),
      enabled: !!c.enabled,
    });
  });
  return items;
}

function _renderCheats() {
  const rom = _activeTargetRom();
  const list = document.getElementById('cheats-list');
  const title = document.getElementById('cheats-title');
  if (!list || !rom) return;

  if (_cheatsMode === 'confirm') {
    const c = _cheatsForRom(rom)[_cheatsTarget];
    const label = c ? c.code : '';
    _cheatsItems = [
      { action: 'toggle', label: (c?.enabled ? 'DISABLE' : 'ENABLE') + ' — ' + label },
      { action: 'delete', label: 'DELETE — ' + label },
      { action: 'cancel', label: 'CANCEL' },
    ];
    if (title) title.textContent = 'CHEAT OPTIONS';
  } else {
    _cheatsItems = _buildCheatItems(rom);
    if (title) title.textContent = 'CHEATS — ' + rom.name.toUpperCase();
  }

  _cheatsIndex = Math.max(0, Math.min(_cheatsIndex, _cheatsItems.length - 1));
  list.innerHTML = '';

  _cheatsItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'cheat-item' + (i === _cheatsIndex ? ' selected' : '');
    if (item.type === 'cheat') {
      el.innerHTML =
        '<span class="cheat-code">' + item.label + '</span>' +
        '<span class="cheat-state ' + (item.enabled ? 'on' : 'off') + '">' +
        (item.enabled ? 'ON' : 'OFF') + '</span>';
    } else {
      el.textContent = item.label;
    }
    list.appendChild(el);
  });

  requestAnimationFrame(() => {
    document.querySelectorAll('.cheat-item')[_cheatsIndex]?.scrollIntoView({ block: 'nearest' });
  });
}

function _navigateCheats(dir) {
  if (!_cheatsItems.length) return;
  _cheatsIndex = (_cheatsIndex + dir + _cheatsItems.length) % _cheatsItems.length;
  _renderCheats();
}

async function _confirmCheatAction() {
  const rom = _activeTargetRom();
  if (!rom) { _closeCheats(); return; }
  const item = _cheatsItems[_cheatsIndex];
  if (!item) return;

  if (_cheatsMode === 'confirm') {
    if (item.action === 'cancel') {
      _cheatsMode = 'list';
      _cheatsIndex = 0;
      _renderCheats();
      return;
    }

    const cheats = _cheatsForRom(rom);
    const target = cheats[_cheatsTarget];
    if (!target) { _cheatsMode = 'list'; _renderCheats(); return; }

    if (item.action === 'toggle') {
      target.enabled = !target.enabled;
      await _saveRomIndex();
      if (target.enabled && _currentRom?.file === rom.file && window.EJS_emulator) {
        _applyCheat(target);
      }
      _setCheatsStatus(target.enabled ? 'CHEAT ENABLED' : 'CHEAT DISABLED', false);
    } else if (item.action === 'delete') {
      cheats.splice(_cheatsTarget, 1);
      await _saveRomIndex();
      _setCheatsStatus('CHEAT DELETED', false);
    }

    _cheatsMode = 'list';
    _cheatsIndex = 0;
    _renderCheats();
    return;
  }

  if (item.type === 'add') {
    let raw = null;
    try { raw = prompt('CHEAT CODE\nGameShark / Action Replay hex:'); } catch { raw = null; }
    if (raw === null || raw === undefined) return;

    const clean = raw.trim().toUpperCase().replace(/\s+/g, '+').replace(/[^0-9A-F+]/g, '');
    if (clean.replace(/\+/g, '').length < 6) {
      _setCheatsStatus('INVALID HEX CODE', true);
      return;
    }

    let desc = '';
    try { desc = (prompt('DESCRIPTION (optional):') || '').trim().slice(0, 24); } catch {}

    const store = _getCheatStore();
    if (!store[rom.file]) store[rom.file] = [];
    const newCheat = { code: clean, desc, enabled: true, addedAt: Date.now() };
    store[rom.file].push(newCheat);

    await _saveRomIndex();
    if (_currentRom?.file === rom.file && window.EJS_emulator) _applyCheat(newCheat);

    _setCheatsStatus('CHEAT ADDED', false);
    _cheatsIndex = store[rom.file].length;
    _renderCheats();
    return;
  }

  if (item.type === 'cheat') {
    _cheatsTarget = item.index;
    _cheatsMode = 'confirm';
    _cheatsIndex = 0;
    _renderCheats();
  }
}

function _applyCheat(cheat) {
  const gm = window.EJS_emulator?.gameManager;
  if (!gm) return false;
  const codes = String(cheat.code).split('+').map(s => s.trim()).filter(Boolean);
  let ok = false;

  for (const code of codes) {
    try {
      if (typeof gm.loadCheat === 'function') {
        gm.loadCheat(code);
        ok = true;
      } else if (gm.cheatManager?.loadCheat) {
        gm.cheatManager.loadCheat(code);
        ok = true;
      }
    } catch (err) {
      dbg('Cheat ERR: ' + err.message);
    }
  }
  return ok;
}

function _applyEnabledCheats(rom) {
  const enabled = _cheatsForRom(rom).filter(c => c.enabled);
  if (!enabled.length || !window.EJS_emulator?.gameManager) return;

  let applied = 0;
  for (const c of enabled) if (_applyCheat(c)) applied++;
  if (applied > 0) {
    _setSaveStatus('CHEATS: ' + applied, 'active');
    _clearSaveStatus(2500);
  }
}

// ══════════════════════════════════════════════════════════════
// IN-GAME & SELECTOR OPTIONS OVERLAYS
// ══════════════════════════════════════════════════════════════
function _showInGameMenu() {
  if (!_currentRom) return;
  _inGameMenuOpen = true;
  try { window.EJS_emulator?.gameManager?.pause(); } catch {}

  _romOptionsIndex = 0;
  _buildInGameMenuOptions();

  const overlay = document.getElementById('rom-options-overlay');
  if (!overlay) return;

  document.getElementById('rom-options-title').textContent = _currentRom.name.toUpperCase();
  _renderRomOptions();
  overlay.classList.add('visible');
  const list = document.getElementById('rom-options-list');
  if (list) list.scrollTop = 0;
}

function _buildInGameMenuOptions() {
  _romOptions = [
    'RESUME',
    'AUDIO: ' + (_audioEnabled ? 'ON' : 'OFF'),
    'VOL UP (' + Math.round(_audioVolume * 100) + '%)',
    'VOL DOWN (' + Math.round(_audioVolume * 100) + '%)',
    'CHEATS',
    'RESTART GAME',
    'EXIT GAME'
  ];
}

function _closeInGameMenu() {
  _inGameMenuOpen = false;
  document.getElementById('rom-options-overlay')?.classList.remove('visible');
  try { window.EJS_emulator?.gameManager?.resume(); } catch {}
  _resumeAudio();
}

function _toggleInGameMenu() {
  if (_inGameMenuOpen) _closeInGameMenu();
  else _showInGameMenu();
}

function _getRomOptions(rom) {
  const entry = rom ? _getSaveEntry(rom.file) : null;
  const cheatCount = rom ? _cheatsForRom(rom).length : 0;
  const opts = ['LAUNCH', 'IMPORT SAVE'];

  if (entry?.backupId) opts.push('RESTORE BACKUP');
  if (entry) opts.push('EXPORT SAVE');
  if (entry) opts.push('DELETE SAVE');

  opts.push(cheatCount ? `CHEATS (${cheatCount})` : 'CHEATS');
  opts.push('AUDIO: ' + (_audioEnabled ? 'ON' : 'OFF'));
  opts.push('VOL UP (' + Math.round(_audioVolume * 100) + '%)');
  opts.push('VOL DOWN (' + Math.round(_audioVolume * 100) + '%)');
  opts.push('REMOVE FROM LIST');
  return opts;
}

function _showRomOptions() {
  const rom = _filteredRoms[_romIndex];
  if (!rom) return;

  _inGameMenuOpen = false;
  _romOptionsIndex = 0;
  _romOptions = _getRomOptions(rom);

  const overlay = document.getElementById('rom-options-overlay');
  if (!overlay) return;

  document.getElementById('rom-options-title').textContent = rom.name.toUpperCase();
  _renderRomOptions();
  overlay.classList.add('visible');
  const list = document.getElementById('rom-options-list');
  if (list) list.scrollTop = 0;
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
  document.querySelectorAll('.rom-option-item')[_romOptionsIndex]?.scrollIntoView({ block: 'nearest' });
}

async function _confirmRomOption() {
  if (_inGameMenuOpen) {
    const choice = _romOptions[_romOptionsIndex];
    if (choice === 'RESUME') {
      _closeInGameMenu();
    } else if (choice === 'CHEATS') {
      _openCheats();
    } else if (choice.startsWith('AUDIO:')) {
      _toggleAudio();
      _buildInGameMenuOptions();
      _renderRomOptions();
    } else if (choice.startsWith('VOL UP')) {
      _adjustVolume(0.25);
      _buildInGameMenuOptions();
      _renderRomOptions();
    } else if (choice.startsWith('VOL DOWN')) {
      _adjustVolume(-0.25);
      _buildInGameMenuOptions();
      _renderRomOptions();
    } else if (choice === 'RESTART GAME') {
      _closeInGameMenu();
      try { window.EJS_emulator?.gameManager?.restart(); } catch {}
    } else if (choice === 'EXIT GAME') {
      _closeInGameMenu();
      exitRom();
    }
    return;
  }

  const rom = _filteredRoms[_romIndex];
  if (!rom) { _closeRomOptions(); return; }
  const choice = _romOptions[_romOptionsIndex];

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

  if (choice.startsWith('AUDIO:')) {
    _toggleAudio();
    _romOptions = _getRomOptions(rom);
    _renderRomOptions();
    _setSelectorStatus('AUDIO ' + (_audioEnabled ? 'ON' : 'OFF'), 1200);
    return;
  }

  if (choice.startsWith('VOL UP')) {
    _adjustVolume(0.25);
    _romOptions = _getRomOptions(rom);
    _renderRomOptions();
    _setSelectorStatus('VOL: ' + Math.round(_audioVolume * 100) + '%', 1200);
    return;
  }

  if (choice.startsWith('VOL DOWN')) {
    _adjustVolume(-0.25);
    _romOptions = _getRomOptions(rom);
    _renderRomOptions();
    _setSelectorStatus('VOL: ' + Math.round(_audioVolume * 100) + '%', 1200);
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
  } else if (choice.startsWith('CHEATS')) {
    _openCheats();
  } else if (choice === 'REMOVE FROM LIST') {
    if (!_cache.romIndex) return;
    _setSelectorStatus('REMOVING...', 4000);
    _cache.romIndex.roms = _cache.romIndex.roms.filter(r => r.id !== rom.fileId);
    await _gcRomArtifacts(rom);
    await _saveRomIndex();
    _rebuildRomsFromIndex();
    if (ROMS.length === 0) _showEmptyState();
    else _buildRomList();
    _romIndex = Math.min(_romIndex, Math.max(0, _filteredRoms.length - 1));
    _setSelectorStatus('REMOVED: ' + rom.name.toUpperCase());
  }
}

// ══════════════════════════════════════════════════════════════
// CATEGORY SYSTEM & LIST RENDERING
// ══════════════════════════════════════════════════════════════
function _buildCategoryBar() {
  const bar = document.getElementById('category-bar');
  if (!bar) return;
  bar.innerHTML = '';

  const counts = {};
  ROMS.forEach(r => { counts[r.system] = (counts[r.system] || 0) + 1; });

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
  document.querySelector('.cat-btn.active')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function _cycleCategory(direction) {
  const buttons = [...(document.querySelectorAll('.cat-btn') || [])];
  if (!buttons.length) return;
  const cur = buttons.findIndex(b => b.dataset.cat === _activeCategory);
  let n = (cur + direction + buttons.length) % buttons.length;
  const cat = buttons[n]?.dataset.cat;
  if (cat && cat !== _activeCategory) _setCategory(cat);
}

function _buildFilteredList() {
  const list = document.getElementById('rom-list');
  list.innerHTML = '';

  if (!_filteredRoms.length) {
    const label = _activeCategory === 'all' ? null : SYSTEMS[_activeCategory]?.label;
    list.innerHTML = label
      ? `<div class="rom-list-msg">NO ${label} ROMS<br><br>Press <span class="msg-gold">+</span> to pick files</div>`
      : `<div class="rom-list-msg">NO ROMS<br><br>Press <span class="msg-gold">+</span> to import ROMs</div>`;
    return;
  }

  _filteredRoms.forEach((rom, i) => {
    const btn = document.createElement('button');
    btn.className = 'rom-item' + (i === 0 ? ' selected' : '');
    btn.dataset.sys = rom.system;
    btn.style.setProperty('--sys-color', SYS_COLORS[rom.system] || '#00ff41');

    const hasSave = !!(_cache.romIndex?.saves.some(s => s.romFile === rom.file));
    const saveDot = hasSave ? '<span class="rom-save-dot"></span>' : '';

    btn.innerHTML = `<span class="rom-name">${rom.name}</span>${saveDot}<span class="rom-badge ${rom.cls}">${rom.label}</span>`;
    btn.addEventListener('click', () => launchRom(i));
    list.appendChild(btn);
  });

  _romIndex = 0;
}

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

function _showEmptyState() {
  const bar = document.getElementById('category-bar');
  if (bar) bar.innerHTML = '';
  const list = document.getElementById('rom-list');
  if (list) {
    list.innerHTML = `<div class="rom-list-msg">NO ROMS YET<br><br>Press <span class="msg-gold">+</span> to pick ROM files from Drive.</div>`;
  }
}

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
  if (addBtn?.offsetParent !== null) { addBtn.focus(); return; }
  document.getElementById('sign-out-btn')?.focus();
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
    ['#', 'FFWD'],
    ['*', 'MENU'],
    ['0', 'HELP'],
    ['RSK', 'EXIT']
  ]
    .map(([k, a]) => `<div class="hint-row"><span class="hint-key">${k}</span><span class="hint-action">${a}</span></div>`)
    .join('');
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
  loadMsg.innerHTML = '<div class="loading-spinner"></div><span>LOADING <span class="loading-dot">_</span></span>';
  loadMsg.style.cssText =
    'position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;color:#00ff41;font-family:"Press Start 2P",monospace;font-size:8px;letter-spacing:2px;flex-direction:column;gap:12px;z-index:10;text-align:center;padding:16px;';
  return loadMsg;
}

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
// LIFECYCLE PERSISTENCE & EXIT
// ══════════════════════════════════════════════════════════════
function _flushBatteryOnHide(reason) {
  if (!_currentRom || !window.EJS_emulator) return;
  dbg('Lifecycle flush (' + reason + ')');
  _extractAndUploadBattery(_currentRom);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') _flushBatteryOnHide('visibilitychange');
});
window.addEventListener('pagehide', () => _flushBatteryOnHide('pagehide'));

async function exitRom() {
  _dismissSaveConfirm();
  _closeInGameMenu();
  _closeCheats();
  document.getElementById('keybinds-overlay')?.classList.remove('visible');

  delete window.EJS_biosUrl;

  if (window._batteryAutoSave) {
    clearInterval(window._batteryAutoSave);
    window._batteryAutoSave = null;
  }

  if (window.EJS_emulator && _currentRom) {
    _setSaveStatus('SAVING...', 'saving');
    await _extractAndUploadBattery(_currentRom);
  }

  _lastSramSnapshot = null;
  _isFastForward = false;

  if (window.EJS_emulator) {
    try { window.EJS_emulator.gameManager?.pause(); } catch {}
  }
  delete window.EJS_emulator;

  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';

  for (const url of Object.values(_cache.romBlobs)) URL.revokeObjectURL(url);
  _cache.romBlobs = {};

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
// LAUNCH & BOOT
// ══════════════════════════════════════════════════════════════
async function launchRom(index) {
  const rom = _filteredRoms[index];
  if (!rom || !window.currentUser) return;

  _unlockAudioContext();

  _currentRom = rom;
  _saveConfirmPending = false;
  _isFastForward = false;

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
      _setSelectorStatus('REMOVED (NOT IN DRIVE)');
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

async function _bootEJS(rom, romUrl) {
  dbg('_bootEJS: "' + rom.name + '" core=' + rom.core);
  if (window.EJS_emulator) {
    try { window.EJS_emulator.gameManager?.pause(); } catch {}
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

  window.EJS_disableDatabases = true;
  window.EJS_core_options = { video_filter: 'none' };

  const biosLoaded = await _loadBios(rom.core);
  if (!biosLoaded) dbg('Starting ' + rom.name + ' without BIOS (HLE mode)');

  const onGameStart = () => {
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.style.display = 'none';

    _applyAudioSettings();
    _resumeAudio();

    _setSaveStatus('READY', 'active');
    _clearSaveStatus();

    let attempts = 0;
    const findCanvas = setInterval(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.imageRendering = 'pixelated';
        canvas.style.transform = 'translateZ(0)';
        clearInterval(findCanvas);
      } else if (attempts++ > 50) {
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
      await _extractAndUploadBattery(_currentRom);
    }, 5 * 60 * 1000);

    setTimeout(() => _applyEnabledCheats(rom), 2500);
  };

  const buttons = {
    playPause: false, restart: false, mute: false, settings: false, fullscreen: false,
    saveState: false, loadState: false, screenRecord: false, gamepad: false, cheat: false,
    volume: false, saveSavFiles: false, loadSavFiles: false, quickSave: false, quickLoad: false,
  };

  const defaultControls = {
    0: getControls(rom.core, rom.landscape),
    1: {}, 2: {}, 3: {}
  };

  _injectBatterySave(rom);

  const effectiveVol = _audioEnabled ? _audioVolume : 0;

  if (typeof window.EJS === 'function') {
    const playerEl = document.getElementById('emulator-wrapper');
    if (!playerEl) return;

    const config = {
      gameUrl: romUrl,
      core: rom.core,
      gameName: rom.file,
      startOnLoad: true,
      muted: !_audioEnabled,
      volume: effectiveVol,
      color: '#00ff41',
      backgroundColor: '#000000',
      defaultControls,
      buttons,
      onGameStart,
    };
    if (window.EJS_biosUrl) config.biosUrl = window.EJS_biosUrl;

    try {
      new window.EJS(playerEl, config);
    } catch (e) {
      dbg('EJS constructor ERR: ' + e.message);
    }
  } else {
    window.EJS_player = '#emulator-wrapper';
    window.EJS_gameUrl = romUrl;
    window.EJS_gameName = rom.file;
    window.EJS_core = rom.core;
    window.EJS_startOnLoaded = true;
    window.EJS_muted = !_audioEnabled;
    window.EJS_volume = effectiveVol;
    window.EJS_color = '#00ff41';
    window.EJS_backgroundColor = '#000000';
    window.EJS_onGameStart = onGameStart;
    window.EJS_defaultControls = defaultControls;
    window.EJS_Buttons = buttons;

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.className = 'ejs-script';
    script.onerror = () => {
      const lm = document.getElementById('loading-msg');
      if (lm) lm.innerHTML = 'LOAD FAILED<br><span style="font-size:8px;color:#555">Check connection</span>';
    };
    document.body.appendChild(script);
  }
}

// ══════════════════════════════════════════════════════════════
// KEYBOARD & CLOUDPHONE BACK EVENT
// ══════════════════════════════════════════════════════════════
window.addEventListener('back', (e) => {
  const inEmu = document.getElementById('emulator-screen').style.display !== 'none';
  if (inEmu) {
    e.preventDefault();
    if (_cheatsOpen) {
      if (_cheatsMode === 'confirm') {
        _cheatsMode = 'list';
        _cheatsIndex = 0;
        _renderCheats();
      } else {
        _closeCheats();
      }
      return;
    }
    if (_inGameMenuOpen) {
      _closeInGameMenu();
      return;
    }
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
    if (_cheatsOpen) {
      e.preventDefault();
      if (_cheatsMode === 'confirm') {
        _cheatsMode = 'list';
        _cheatsIndex = 0;
        _renderCheats();
      } else {
        _closeCheats();
      }
      return;
    }
    if (document.getElementById('rom-options-overlay')?.classList.contains('visible')) {
      e.preventDefault();
      _closeRomOptions();
    }
  }
});

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
    if (_cheatsOpen) {
      if (e.key === 'ArrowUp')   { e.preventDefault(); _navigateCheats(-1); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateCheats(1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); _confirmCheatAction(); return; }
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        if (_cheatsMode === 'confirm') { _cheatsMode = 'list'; _cheatsIndex = 0; _renderCheats(); }
        else { _closeCheats(); }
        return;
      }
      return;
    }

    if (romOptionsOpen) {
      if (e.key === 'ArrowUp')   { e.preventDefault(); _navigateRomOptions(-1); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateRomOptions(1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); _confirmRomOption(); return; }
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
      if (_filteredRoms.length === 0) { _focusHeaderButton(); return; }
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
      _cycleCategory(-1);
      if (isCatBtn) _focusActiveCategory();
      else _focusRomItem(0);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      _cycleCategory(1);
      if (isCatBtn) _focusActiveCategory();
      else _focusRomItem(0);
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
    _resumeAudio();

    if (_cheatsOpen) {
      if (e.key === 'ArrowUp')   { e.preventDefault(); _navigateCheats(-1); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateCheats(1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); _confirmCheatAction(); return; }
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        if (_cheatsMode === 'confirm') { _cheatsMode = 'list'; _cheatsIndex = 0; _renderCheats(); }
        else { _closeCheats(); }
        return;
      }
      return;
    }

    if (romOptionsOpen) {
      if (e.key === 'ArrowUp')   { e.preventDefault(); _navigateRomOptions(-1); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateRomOptions(1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); _confirmRomOption(); return; }
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        _closeInGameMenu();
        return;
      }
      return;
    }

    if (e.key === '#') {
      e.preventDefault();
      _toggleFastForward();
      return;
    }

    if (e.key === '*') {
      e.preventDefault();
      _toggleInGameMenu();
      return;
    }

    if (e.key === '7') {
      e.preventDefault();
      manualLoad();
      return;
    }

    if (e.key === '8') {
      e.preventDefault();
      toggleDebug();
      return;
    }

    if (e.key === '9') {
      e.preventDefault();
      manualSave();
      return;
    }

    if (e.key === '0') {
      e.preventDefault();
      toggleKeybinds();
      return;
    }

    if (_saveConfirmPending && !['7', '8', '9', '0'].includes(e.key)) {
      _dismissSaveConfirm();
    }
  }
});

// ══════════════════════════════════════════════════════════════
// INIT & AUTH SUCCESS
// ══════════════════════════════════════════════════════════════
_initFocusSync();

document.getElementById('add-roms-btn')?.addEventListener('click', () => {
  if (!window.currentUser) return;
  openPicker('roms');
});

document.getElementById('rom-refresh-btn')?.addEventListener('click', () => {
  if (!window.currentUser) return;
  _cache.romIndex = null;
  _cache.indexFileId = null;
  _loadRomIndex();
});

window.onAuthSuccess = function(user) {
  _markTokenFresh();
  dbg('Auth success: ' + user.name + ' | screen: ' + SCREEN.toString());

  document.getElementById('selector').style.display = 'flex';
  _loadGis().catch(() => {});
  _loadGapi().catch(() => {});
  _loadRomIndex();
};
