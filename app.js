'use strict';
// ── app.js — RetroEmu CloudPhone Edition ─────────────────────────────────────

// ══════════════════════════════════════════════════════════════
// SCREEN CLASS DETECTION
// ══════════════════════════════════════════════════════════════
const _SW = window.screen.width;
const _SH = window.screen.height;
const SCREEN = {
  w: _SW, h: _SH,
  isSmall: Math.min(_SW, _SH) <= 160,
  toString() { return `${_SW}×${_SH} (${this.isSmall ? 'small' : 'standard'})`; },
};

// ══════════════════════════════════════════════════════════════
// SYSTEM REGISTRY
// ══════════════════════════════════════════════════════════════
const SYSTEMS = {
  gb:      { core: 'gambatte',     exts: ['.gb'],          label: 'GB',   cls: 'gb',   landscape: false, smallLandscape: true },
  gbc:     { core: 'gambatte',     exts: ['.gbc'],         label: 'GBC',  cls: 'gbc',  landscape: false, smallLandscape: true },
  gba:     { core: 'mgba',         exts: ['.gba'],         label: 'GBA',  cls: 'gba',  landscape: false, smallLandscape: true },
  nes:     { core: 'nestopia',     exts: ['.nes'],         label: 'NES',  cls: 'nes',  landscape: true,  smallLandscape: true },
  snes:    { core: 'snes9x',       exts: ['.sfc', '.smc'], label: 'SNES', cls: 'snes', landscape: true,  smallLandscape: true },
  psx:     { core: 'pcsx_rearmed', exts: ['.chd'],         label: 'PS1',  cls: 'ps1',  landscape: true,  smallLandscape: true },
  gg:      { core: 'segaGG',       exts: ['.gg'],          label: 'GG',   cls: 'gg',   landscape: false, smallLandscape: true },
  sms:     { core: 'segaMS',       exts: ['.sms'],         label: 'SMS',  cls: 'sms',  landscape: true,  smallLandscape: true },
  genesis: { core: 'segaMD',       exts: ['.md', '.bin', '.gen'], label: 'GEN', cls: 'gen', landscape: true, smallLandscape: true },
};

const SYS_COLORS = {
  gb: '#00ff41', gbc: '#7cfc00', gba: '#ffd700', nes: '#ff6b6b',
  snes: '#a78bfa', psx: '#60a5fa', gg: '#fb923c', sms: '#f87171', genesis: '#e879f9',
};
const SYS_ORDER = ['gb', 'gbc', 'gba', 'nes', 'snes', 'psx', 'gg', 'sms', 'genesis'];

function _resolveLandscape(sys) {
  if (SCREEN.isSmall) return sys.smallLandscape !== undefined ? sys.smallLandscape : sys.landscape;
  return sys.landscape;
}

// ══════════════════════════════════════════════════════════════
// BIOS REGISTRY
// ══════════════════════════════════════════════════════════════
const BIOS_REGISTRY = {
  pcsx_rearmed: [{ file: 'scph1001.bin', ejsVar: 'EJS_biosUrl', required: true }],
};

// ══════════════════════════════════════════════════════════════
// CONTROLS
// ══════════════════════════════════════════════════════════════
function _pad(dpad, { a, b, x = '', y = '', start, select, l = '', r = '', l2 = '', r2 = '' }) {
  return {
    0:{ value: b }, 1:{ value: y }, 2:{ value: select }, 3:{ value: start },
    4:{ value: dpad[0] }, 5:{ value: dpad[1] }, 6:{ value: dpad[2] }, 7:{ value: dpad[3] },
    8:{ value: a }, 9:{ value: x }, 10:{ value: l }, 11:{ value: r },
    12:{ value: l2 }, 13:{ value: r2 }, 14:{ value: '' }, 15:{ value: '' },
    24:{ value: '' }, 25:{ value: '' }, 26:{ value: '' }, 27:{ value: '' },
    28:{ value: '' }, 29:{ value: '' },
  };
}
const _P = ['up arrow', 'down arrow', 'left arrow', 'right arrow'];
const _L = ['right arrow', 'left arrow', 'up arrow', 'down arrow'];
const _BTNS     = { a: 'enter', b: '1', start: 'escape', select: '3' };
const _BTNS_EXT = { ..._BTNS, x: '4', y: '2', l: '5', r: '6' };
const CONTROLS = {
  gambatte:     { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS)     },
  mgba:         { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  nestopia:     { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS)     },
  snes9x:       { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  pcsx_rearmed: { portrait: _pad(_P, _BTNS_EXT), landscape: _pad(_L, _BTNS_EXT) },
  gearsystem:   { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS)     },
  segaMS:       { portrait: _pad(_P, _BTNS),     landscape: _pad(_L, _BTNS)     },
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
  { key: '↑↓←→', action: 'D-PAD' }, { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' }, { key: 'ESC', action: 'START' }, { key: '3', action: 'SELECT' },
];
const _KP_EXT = [..._KP, { key: '2', action: 'Y' }, { key: '4', action: 'X' }, { key: '5', action: 'L' }, { key: '6', action: 'R' }];
const _KL = [
  { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT' },
  { key: '←', action: '→ UP' }, { key: '→', action: '→ DOWN' },
  { key: 'ENTER', action: 'A' }, { key: '1', action: 'B' },
  { key: 'ESC', action: 'START' }, { key: '3', action: 'SELECT' },
  { key: '2', action: 'Y' }, { key: '4', action: 'X' }, { key: '5', action: 'L' }, { key: '6', action: 'R' },
];
const _KL_GEN = [
  { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT' },
  { key: '←', action: '→ UP' }, { key: '→', action: '→ DOWN' },
  { key: 'ENTER', action: 'A' }, { key: '1', action: 'B' },
  { key: '4', action: 'C' }, { key: '5', action: 'X' },
  { key: '6', action: 'Y/Z' }, { key: 'ESC', action: 'START' }, { key: '3', action: 'MODE' },
];
const _KP_GEN = [
  { key: '↑↓←→', action: 'D-PAD' }, { key: 'ENTER', action: 'A' },
  { key: '1', action: 'B' }, { key: '4', action: 'C' }, { key: '5', action: 'X' },
  { key: '6', action: 'Y/Z' }, { key: 'ESC', action: 'START' }, { key: '3', action: 'MODE' },
];
const _KMETA = [
  { section: true, label: 'SYSTEM' },
  { key: '7', action: 'LOAD STATE' }, { key: '9', action: 'SAVE STATE' },
  { key: '0', action: 'CONTROLS' }, { key: 'RSK', action: 'EXIT' },
];
function getKeybinds(rom) {
  const ls = rom.landscape;
  switch (rom.folder) {
    case 'gb': case 'gbc': return [...(ls ? _KL : _KP), ..._KMETA];
    case 'gba':             return [..._KP, ..._KMETA];
    case 'gg':              return [...(ls ? _KL_GEN : _KP_GEN), ..._KMETA];
    case 'sms':             return [...(ls ? _KL : _KP), ..._KMETA];
    case 'genesis':         return [..._KL_GEN, ..._KMETA];
    case 'nes': case 'snes': case 'psx': return [..._KL, ..._KMETA];
    default:                return [..._KP, ..._KMETA];
  }
}
function _genericKeybinds() {
  return [
    { section: true, label: 'PORTRAIT SYSTEMS' },
    { key: '↑↓←→', action: 'D-PAD' }, { key: 'ENTER', action: 'A' },
    { key: '1', action: 'B' }, { key: '2', action: 'Y' }, { key: '4', action: 'X' },
    { key: 'ESC', action: 'START' }, { key: '3', action: 'SELECT' },
    { key: '5', action: 'L' }, { key: '6', action: 'R' },
    { section: true, label: 'LANDSCAPE — D-PAD REMAPPED' },
    { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT' },
    { key: '←', action: '→ UP' }, { key: '→', action: '→ DOWN' },
    ..._KMETA,
  ];
}

// ══════════════════════════════════════════════════════════════
// DRIVE CONFIG
// ══════════════════════════════════════════════════════════════
const DRIVE_ROOT  = 'cloudphone-emulator';
const DRIVE_BIOS  = 'bios';
const DRIVE_SAVES = 'saves';
const DRIVE_API    = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const REQUIRED_FOLDERS = ['gb', 'gbc', 'gba', 'nes', 'snes', 'psx', 'gg', 'sms', 'genesis', 'bios', 'saves'];

const _cache = {
  rootId: null,
  biosId: null, biosFiles: {}, biosIndexed: false,
  savesFolderId: null, savesFiles: {}, savesIndexed: false,
  romBlobs: {}, biosBlobs: {},
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
let _isScanning = false;
const _log = [];

// ══════════════════════════════════════════════════════════════
// LOGGING
// ══════════════════════════════════════════════════════════════
function dbg(msg) {
  const ts = new Date().toTimeString().slice(0, 8);
  _log.push('[' + ts + '] ' + msg);
  if (_log.length > 200) _log.shift();
  const el = document.getElementById('debug-log');
  if (el) { el.textContent = _log.join('\n'); el.scrollTop = el.scrollHeight; }
}
function toggleDebug() {
  let el = document.getElementById('debug-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'debug-overlay';
    el.style.cssText = 'position:fixed;top:0;left:0;z-index:999999;display:flex;flex-direction:column;background:rgba(4,4,8,0.97);border:1px solid #00ff41;padding:0;font-family:monospace;color:#00ff41;'
      + (_isLandscape ? 'width:100vh;height:100vw;transform:rotate(90deg);transform-origin:top left;margin-left:100vw;' : 'width:100vw;height:100vh;');
    el.innerHTML = '<div style="color:#ffd700;letter-spacing:2px;padding:6px 8px;border-bottom:1px solid #1a1a30;flex-shrink:0;font-size:9px;">DEBUG — press 8 to close</div>'
      + '<pre id="debug-log" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;white-space:pre-wrap;word-break:break-all;margin:0;'
      + (_isLandscape ? 'font-size:7px;' : 'font-size:9px;') + 'padding:6px 8px;"></pre>';
    document.body.appendChild(el);
  }
  const isVisible = el.style.display !== 'none';
  el.style.display = isVisible ? 'none' : 'flex';
  if (!isVisible) {
    const logEl = document.getElementById('debug-log');
    if (logEl) { logEl.textContent = _log.join('\n') || 'No logs yet.'; setTimeout(() => { logEl.scrollTop = logEl.scrollHeight; }, 0); }
  }
}

function setLandscape(on) { _isLandscape = on; document.body.classList.toggle('landscape', on); dbg('Landscape: ' + on); }

// ══════════════════════════════════════════════════════════════
// DRIVE API HELPERS
// ══════════════════════════════════════════════════════════════
async function _driveGet(path) {
  const res = await window.driveApiFetch(DRIVE_API + path);
  if (!res.ok) throw new Error('Drive GET ' + path + ' → ' + res.status);
  return res.json();
}
async function driveFindFolder(name, parentId) {
  const parent = parentId ? `'${parentId}' in parents` : `'root' in parents`;
  const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and ${parent} and trashed=false`);
  const data = await _driveGet(`/files?q=${q}&fields=files(id)&pageSize=1`);
  return data.files?.[0]?.id || null;
}
async function driveCreateFolder(name, parentId) {
  const res = await window.driveApiFetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : ['root'],
    }),
  });
  if (!res.ok) { dbg('driveCreateFolder ERR: ' + res.status); return null; }
  const data = await res.json();
  dbg('Created folder: ' + name + ' → ' + data.id);
  return data.id || null;
}
async function driveListChildren(parentId, foldersOnly = false) {
  const mf = foldersOnly ? `and mimeType='application/vnd.google-apps.folder'` : `and mimeType!='application/vnd.google-apps.folder'`;
  const q = encodeURIComponent(`'${parentId}' in parents ${mf} and trashed=false`);
  const data = await _driveGet(`/files?q=${q}&fields=files(id,name,size)&pageSize=200`);
  return data.files || [];
}
async function driveDownloadBlob(fileId, cacheMap) {
  if (cacheMap[fileId]) return cacheMap[fileId];
  const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
  if (!res.ok) throw new Error('Drive download ' + fileId + ' → ' + res.status);
  const buf = await res.arrayBuffer();
  dbg('Downloaded ' + fileId + ': ' + buf.byteLength + 'B');
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }));
  cacheMap[fileId] = url;
  return url;
}
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
    const res = await window.driveApiFetch(`${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/octet-stream' }, body: blob });
    return res.ok;
  }
  const meta = JSON.stringify({ name: filename, parents: ['appDataFolder'] });
  const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;
  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);
  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0); body.set(bytes, preB.byteLength); body.set(closeB, preB.byteLength + bytes.byteLength);
  const res = await window.driveApiFetch(`${DRIVE_UPLOAD}/files?uploadType=multipart`, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
  return res.ok;
}
async function driveFindFileInFolder(parentId, filename) {
  const q = encodeURIComponent(`name='${filename}' and '${parentId}' in parents and trashed=false`);
  try {
    const data = await _driveGet(`/files?q=${q}&fields=files(id)&pageSize=1`);
    return data.files?.[0]?.id || null;
  } catch (err) { return null; }
}

// ══════════════════════════════════════════════════════════════
// SAFETY GATE — all visible Drive writes go through here
// This is the ONLY function that writes to user-visible files.
// It REFUSES any write that isn't inside the saves/ folder.
// ══════════════════════════════════════════════════════════════
async function safeWriteSaveFile(filename, bytes, existingFileId = null) {
  if (!_cache.savesFolderId) {
    dbg('SAFETY BLOCK: no saves/ folder ID — write refused');
    return false;
  }
  if (existingFileId) {
    try {
      const data = await _driveGet(`/files/${existingFileId}?fields=parents`);
      const parents = data.parents || [];
      if (!parents.includes(_cache.savesFolderId)) {
        dbg('SAFETY BLOCK: file ' + existingFileId + ' not in saves/ — write refused');
        return false;
      }
    } catch (err) {
      dbg('SAFETY BLOCK: could not verify parent — write refused: ' + err.message);
      return false;
    }
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const res = await window.driveApiFetch(
      `${DRIVE_UPLOAD}/files/${existingFileId}?uploadType=media`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/octet-stream' }, body: blob }
    );
    dbg('SAFETY OK: updated ' + filename + ' (' + (res.ok ? 'ok' : 'HTTP ' + res.status) + ')');
    return res.ok;
  }
  const boundary = 'emu_mp_boundary';
  const meta = JSON.stringify({ name: filename, parents: [_cache.savesFolderId] });
  const pre = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close = `\r\n--${boundary}--`;
  const preB = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);
  const body = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0); body.set(bytes, preB.byteLength); body.set(closeB, preB.byteLength + bytes.byteLength);
  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files?uploadType=multipart`,
    { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body }
  );
  dbg('SAFETY OK: created ' + filename + ' (' + (res.ok ? 'ok' : 'HTTP ' + res.status) + ')');
  return res.ok;
}

// ══════════════════════════════════════════════════════════════
// AUTO-PROVISION DRIVE FOLDERS
// Creates the entire folder tree on first sign-in.
// ══════════════════════════════════════════════════════════════
async function _ensureDriveStructure() {
  let rootId = await driveFindFolder(DRIVE_ROOT, null);
  let rootCreated = false;

  if (!rootId) {
    dbg('First launch — creating ' + DRIVE_ROOT + '/');
    rootId = await driveCreateFolder(DRIVE_ROOT, null);
    if (!rootId) return 'error';
    rootCreated = true;
  }
  _cache.rootId = rootId;

  for (const name of REQUIRED_FOLDERS) {
    const existingId = await driveFindFolder(name, _cache.rootId);
    if (!existingId) {
      dbg('Creating subfolder: ' + name + '/');
      const newId = await driveCreateFolder(name, _cache.rootId);
      if (newId) {
        if (name === 'bios') _cache.biosId = newId;
        if (name === 'saves') _cache.savesFolderId = newId;
      }
    } else {
      if (name === 'bios') _cache.biosId = existingId;
      if (name === 'saves') _cache.savesFolderId = existingId;
    }
  }

  return rootCreated ? 'created' : 'exists';
}

// ══════════════════════════════════════════════════════════════
// ROM DISCOVERY
// ══════════════════════════════════════════════════════════════
async function discoverRoms() {
  if (_isScanning) return;
  _isScanning = true;
  _setRomListMsg('SETTING UP DRIVE...');
  dbg('discoverRoms: start — screen ' + SCREEN.toString());
  try {
    const setupResult = await _ensureDriveStructure();
    if (setupResult === 'error') {
      _setRomListMsg('DRIVE SETUP FAILED — check connection and try again');
      _isScanning = false;
      return;
    }

    _showSetupHint(false);
    const subfolders = await driveListChildren(_cache.rootId, true);
    dbg('Subfolders: ' + subfolders.map(f => f.name).join(', '));
    ROMS = [];
    const seenRoms = new Set();
    for (const folder of subfolders) {
      const key = folder.name.toLowerCase();
      const sys = SYSTEMS[key];
      if (!sys) { dbg('Unknown folder, skipping: ' + folder.name); continue; }
      const landscape = _resolveLandscape(sys);
      const files = await driveListChildren(folder.id, false);
      for (const file of files) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!sys.exts.includes(ext)) continue;
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        const dedupeKey = `${key}-${name}`;
        if (seenRoms.has(dedupeKey)) continue;
        seenRoms.add(dedupeKey);
        ROMS.push({ name, file: file.name, fileId: file.id, core: sys.core, label: sys.label, cls: sys.cls, landscape, ejsSystem: sys.ejsSystem || null, folder: key });
      }
    }
    dbg('Total ROMs: ' + ROMS.length);

    if (ROMS.length === 0) {
      const bar = document.getElementById('category-bar');
      if (bar) bar.innerHTML = '';
      const list = document.getElementById('rom-list');
      if (list) {
        if (setupResult === 'created') {
          list.innerHTML = `
            <div class="rom-list-msg" style="padding:12px 8px;">
              <div style="color:var(--green);font-family:var(--font-pixel);font-size:8px;letter-spacing:1px;margin-bottom:10px;">FOLDERS CREATED!</div>
              <div style="line-height:2.2;">
                A <span class="msg-highlight">cloudphone-emulator</span> folder<br>
                was added to your Google Drive.<br><br>
                Add your ROM files to the<br>
                system folders inside it, then<br>
                press <span class="msg-gold">refresh</span> to scan.
              </div>
            </div>`;
        } else {
          list.innerHTML = `
            <div class="rom-list-msg">
              NO ROMS FOUND<br><br>
              Add ROM files to your<br>
              <span class="msg-highlight">cloudphone-emulator</span> system folders,<br>
              then press <span class="msg-gold">refresh</span>
            </div>`;
        }
      }
      _isScanning = false;
      return;
    }

    _prefetchBios();
    _cache.savesIndexed = false;
    _prefetchSaves();
    _buildRomList();
  } catch (err) {
    dbg('discoverRoms ERR: ' + err.message);
    _setRomListMsg(err.message === 'INSUFFICIENT_PERMISSIONS' ? 'DRIVE PERMISSION ERROR — sign out and sign in again' : 'DRIVE ERROR: ' + err.message);
  } finally { _isScanning = false; }
}

async function _prefetchBios() {
  if (_cache.biosIndexed) return;
  if (!_cache.biosId) { _cache.biosIndexed = true; return; }
  try {
    const files = await driveListChildren(_cache.biosId, false);
    for (const f of files) _cache.biosFiles[f.name.toLowerCase()] = f.id;
    dbg('BIOS indexed: ' + Object.keys(_cache.biosFiles).join(', '));
  } catch (err) { dbg('_prefetchBios ERR: ' + err.message); }
  _cache.biosIndexed = true;
}

async function _loadBios(core) {
  const required = BIOS_REGISTRY[core];
  if (!required) return true;
  if (!_cache.biosId) { dbg('BIOS folder missing for ' + core); return false; }
  let allOk = true;
  for (const { file, ejsVar, required: req } of required) {
    const fileId = _cache.biosFiles[file.toLowerCase()];
    if (!fileId) { dbg((req ? 'REQUIRED' : 'optional') + ' BIOS missing: ' + file); if (req) allOk = false; continue; }
    try { window[ejsVar] = await driveDownloadBlob(fileId, _cache.biosBlobs); dbg('BIOS set ' + ejsVar + ' ← ' + file); }
    catch (err) { dbg('BIOS DL ERR ' + file + ': ' + err.message); if (req) allOk = false; }
  }
  return allOk;
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
  if (token) { _tokenLastRefreshed = Date.now(); dbg('Proactive refresh OK'); }
  else dbg('Proactive refresh FAILED');
}
function _markTokenFresh() { _tokenLastRefreshed = Date.now(); }
const _origOnAuthSuccess = window.onAuthSuccess;
window.onAuthSuccess = function(user) { _markTokenFresh(); if (typeof _origOnAuthSuccess === 'function') _origOnAuthSuccess(user); };

// ══════════════════════════════════════════════════════════════
// SAVE STATE — CLOUD (appDataFolder — unchanged)
// ══════════════════════════════════════════════════════════════
function _saveKey(gameName) {
  const uid = window.currentUser?.id || 'anon';
  const base = gameName.replace(/\.[^.]+$/, '');
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  const slotSuffix = _currentSlot === 0 ? '' : `_slot${_currentSlot}`;
  return uid + '_' + safe + slotSuffix + '.state';
}
async function _cloudSaveExists(gameName) { try { return !!(await driveFindAppFile(_saveKey(gameName))); } catch { return false; } }
async function _cloudDownload(gameName) {
  const filename = _saveKey(gameName);
  dbg('DL save: ' + filename);
  try {
    const fileId = await driveFindAppFile(filename);
    if (!fileId) { dbg('No cloud save'); return null; }
    const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
    if (!res.ok) { dbg('DL HTTP ' + res.status); return null; }
    const buf = await res.arrayBuffer();
    dbg('DL save: ' + buf.byteLength + 'B');
    return new Uint8Array(buf);
  } catch (err) { dbg('DL save ERR: ' + err.message); return null; }
}
async function _cloudUpload(gameName, bytes) {
  const filename = _saveKey(gameName);
  dbg('UL save: ' + filename + ' (' + bytes.byteLength + 'B)');
  await _ensureFreshToken();
  try {
    const existingId = await driveFindAppFile(filename);
    const ok = await driveWriteAppFile(filename, bytes, existingId);
    if (ok) { _tokenLastRefreshed = Date.now(); dbg('UL save: OK'); } else dbg('UL save: FAILED');
    return ok;
  } catch (err) { dbg('UL save ERR: ' + err.message); return false; }
}

// ══════════════════════════════════════════════════════════════
// BATTERY SAVE — VISIBLE DRIVE FOLDER
//
// All in-game saves live in cloudphone-emulator/saves/
// Naming: {ROM name}.sav (matches ROM filename exactly)
// On launch: reads .sav then .srm (backward compat)
// On exit + every 5min: SRAM → uploads to saves/
// Users can see, move, replace, backup these files in Drive.
// ══════════════════════════════════════════════════════════════

function _saveFileName(romFile) {
  return romFile.replace(/\.[^.]+$/, '') + '.sav';
}

async function _prefetchSaves() {
  if (_cache.savesIndexed) return;
  if (!_cache.savesFolderId) { _cache.savesIndexed = true; return; }
  try {
    const files = await driveListChildren(_cache.savesFolderId, false);
    for (const f of files) _cache.savesFiles[f.name.toLowerCase()] = f.id;
    dbg('Saves indexed: ' + Object.keys(_cache.savesFiles).join(', '));
  } catch (err) { dbg('_prefetchSaves ERR: ' + err.message); }
  _cache.savesIndexed = true;
}

async function _cloudBatteryDownload(romFile) {
  if (!_cache.savesFolderId) { dbg('No saves/ folder for battery DL'); return null; }
  const romBase = romFile.replace(/\.[^.]+$/, '');
  const candidates = [romBase + '.sav', romBase + '.srm', romFile + '.sav', romFile + '.srm'];
  for (const name of candidates) {
    const fileId = _cache.savesFiles[name.toLowerCase()];
    if (!fileId) continue;
    try {
      const res = await window.driveApiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        dbg('Battery DL: ' + name + ' (' + buf.byteLength + 'B)');
        return new Uint8Array(buf);
      }
    } catch (err) { dbg('Battery DL ERR ' + name + ': ' + err.message); }
  }
  dbg('No battery save found for: ' + romFile);
  return null;
}

async function _cloudBatteryUpload(romFile, bytes) {
  if (!_cache.savesFolderId) { dbg('No saves/ folder for battery UL'); return false; }
  const filename = _saveFileName(romFile);
  dbg('Battery UL: ' + filename + ' (' + bytes.byteLength + 'B)');
  await _ensureFreshToken();
  try {
    const existingId = _cache.savesFiles[filename.toLowerCase()] || null;
    const ok = await safeWriteSaveFile(filename, bytes, existingId);
    if (ok) {
      if (!existingId) {
        const freshId = await driveFindFileInFolder(_cache.savesFolderId, filename);
        if (freshId) _cache.savesFiles[filename.toLowerCase()] = freshId;
      }
      dbg('Battery UL: OK');
    } else {
      dbg('Battery UL: FAILED');
    }
    return ok;
  } catch (err) { dbg('Battery UL ERR: ' + err.message); return false; }
}

async function _extractAndUploadBattery(rom) {
  if (!window.EJS_emulator || !rom) return;
  try {
    const gm = window.EJS_emulator.gameManager;
    const FS = window.EJS_emulator.Module?.FS;
    if (!gm || !FS || typeof gm.getSaveFilePath !== 'function') return;
    try { gm.saveSaveFiles(); } catch (_) {}
    await new Promise(r => setTimeout(r, 100));
    const savePath = gm.getSaveFilePath();
    if (!savePath) return;
    const srm = FS.readFile(savePath);
    if (!srm?.byteLength) return;
    const isBlank = [...srm.slice(0, 64)].every(b => b === 0x00 || b === 0xFF);
    if (isBlank) { dbg('Battery extract: blank SRAM, skipping'); return; }
    await _cloudBatteryUpload(rom.file, srm);
  } catch (err) { dbg('_extractAndUploadBattery ERR: ' + err.message); }
}

function _injectBatterySave(rom) {
  let done = false;
  const deadline = Date.now() + 120_000;
  const poll = setInterval(async () => {
    if (done || Date.now() > deadline) { clearInterval(poll); return; }
    const FS = window.EJS_emulator?.Module?.FS;
    const gm = window.EJS_emulator?.gameManager;
    if (!FS || !gm || typeof gm.getSaveFilePath !== 'function') return;
    done = true;
    clearInterval(poll);
    const bytes = await _cloudBatteryDownload(rom.file);
    if (!bytes?.byteLength) { dbg('No battery save to inject for: ' + rom.file); return; }
    const savePath = gm.getSaveFilePath();
    dbg('Injecting battery save → ' + savePath);
    const parts = savePath.split('/').filter(Boolean);
    let built = '';
    for (let i = 0; i < parts.length - 1; i++) { built += '/' + parts[i]; try { FS.mkdir(built); } catch (_) {} }
    FS.writeFile(savePath, bytes);
    try { gm.loadSaveFiles(); } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
    const live = gm.getSaveFile?.();
    const isEmpty = !live || [...live.slice(0, 32)].every(b => b === 0x00 || b === 0xFF);
    if (isEmpty) {
      dbg('SRAM still empty — restarting core to re-read save');
      setTimeout(() => { try { gm.restart(); } catch (_) {} }, 200);
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
  ROMS.forEach(r => { counts[r.folder] = (counts[r.folder] || 0) + 1; });
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
  if (_activeCategory === 'all') { _filteredRoms = [...ROMS]; }
  else { _filteredRoms = ROMS.filter(r => r.folder === _activeCategory); }
}
function _setCategory(cat) {
  _activeCategory = cat;
  _filterRoms();
  _buildCategoryBar();
  _buildFilteredList();
  _romIndex = 0;
  const activeBtn = document.querySelector('.cat-btn.active');
  activeBtn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}
function _cycleCategory(direction) {
  const buttons = [...(document.querySelectorAll('.cat-btn') || [])];
  if (buttons.length === 0) return;
  const currentIndex = buttons.findIndex(b => b.dataset.cat === _activeCategory);
  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = buttons.length - 1;
  if (newIndex >= buttons.length) newIndex = 0;
  const newCat = buttons[newIndex]?.dataset.cat;
  if (newCat && newCat !== _activeCategory) _setCategory(newCat);
}
function _buildFilteredList() {
  const list = document.getElementById('rom-list');
  list.innerHTML = '';
  if (_filteredRoms.length === 0) {
    if (_activeCategory === 'all') {
      list.innerHTML = `<div class="rom-list-msg">NO ROMS FOUND<br><br>Add ROM files to your<br><span class="msg-highlight">cloudphone-emulator</span> system folders,<br>then press <span class="msg-gold">refresh</span></div>`;
    } else {
      const label = SYSTEMS[_activeCategory]?.label || _activeCategory.toUpperCase();
      const ext = _activeCategory === 'psx' ? '.chd' : '.' + _activeCategory;
      list.innerHTML = `<div class="rom-list-msg">NO ${label} ROMS<br><br>Add <span class="msg-highlight">${ext}</span> files to the<br>${_activeCategory}/ folder in Drive</div>`;
    }
    return;
  }
  _filteredRoms.forEach((rom, i) => {
    const btn = document.createElement('button');
    btn.className = 'rom-item' + (i === 0 ? ' selected' : '');
    btn.dataset.sys = rom.folder;
    btn.style.setProperty('--sys-color', SYS_COLORS[rom.folder] || '#00ff41');
    btn.style.setProperty('--rom-delay', i < 8 ? `${i * 20}ms` : '0ms');
    const saveName = _saveFileName(rom.file).toLowerCase();
    const hasSave = !!(_cache.savesFolderId && _cache.savesFiles[saveName]);
    const saveDot = hasSave ? '<span class="rom-save-dot"></span>' : '';
    btn.innerHTML = `<span class="rom-name">${rom.name}</span>${saveDot}<span class="rom-badge ${rom.cls}">${rom.label}</span>`;
    btn.addEventListener('click', () => launchRom(i));
    list.appendChild(btn);
  });
  _romIndex = 0;
}

// ══════════════════════════════════════════════════════════════
// FOCUS MANAGEMENT
// ══════════════════════════════════════════════════════════════
function _focusRomItem(index) {
  const items = document.querySelectorAll('.rom-item');
  if (items[index]) { items[index].focus(); items[index].scrollIntoView({ block: 'nearest' }); }
}
function _focusActiveCategory() {
  const activeCat = document.querySelector('.cat-btn.active');
  if (activeCat) { activeCat.focus(); activeCat.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
}
function _focusHeaderButton() {
  const refreshBtn = document.getElementById('rom-refresh-btn');
  if (refreshBtn && refreshBtn.offsetParent !== null) { refreshBtn.focus(); return; }
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn && signOutBtn.offsetParent !== null) { signOutBtn.focus(); return; }
}
function _focusPrevHeaderBtn() { if (document.activeElement?.id === 'sign-out-btn') { const b = document.getElementById('rom-refresh-btn'); if (b) b.focus(); } }
function _focusNextHeaderBtn() { if (document.activeElement?.id === 'rom-refresh-btn') { const b = document.getElementById('sign-out-btn'); if (b) b.focus(); } }
function _initFocusSync() {
  document.getElementById('rom-list')?.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('rom-item')) {
      const items = [...document.querySelectorAll('.rom-item')];
      const index = items.indexOf(e.target);
      if (index >= 0 && index !== _romIndex) { _romIndex = index; items.forEach((el, i) => el.classList.toggle('selected', i === index)); }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════
function _setSaveStatus(text, cls) { const el = document.getElementById('save-status'); if (!el) return; el.textContent = text; el.className = 'save-status' + (cls ? ' ' + cls : ''); }
function _clearSaveStatus(delay = 2000) { setTimeout(() => _setSaveStatus('SAV:ON', 'active'), delay); }
function _setRomListMsg(msg) { const el = document.getElementById('rom-list'); if (el) el.innerHTML = `<div class="rom-list-msg">${msg}</div>`; const bar = document.getElementById('category-bar'); if (bar) bar.innerHTML = ''; }
function _showSetupHint(show) { const el = document.getElementById('drive-setup-hint'); if (el) el.style.display = show ? 'block' : 'none'; }

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
  if (item) { item.scrollIntoView({ block: 'nearest' }); item.focus(); }
}

function _renderPortraitHints() {
  const el = document.getElementById('key-hints');
  if (!el) return;
  el.innerHTML = [['7','LOAD'],['9','SAVE'],['0','HELP'],['RSK','EXIT']].map(([k,a]) =>
    `<div class="hint-row"><span class="hint-key">${k}</span><span class="hint-action">${a}</span></div>`
  ).join('');
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
  loadMsg.innerHTML = '<div class="loading-spinner"></div><span>LOADING<span class="loading-dot">_</span></span>';
  loadMsg.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;color:#00ff41;font-family:"Press Start 2P",monospace;font-size:8px;letter-spacing:2px;flex-direction:column;gap:14px;z-index:10;text-align:center;padding:16px;';
  return loadMsg;
}

// ══════════════════════════════════════════════════════════════
// KEYBINDS POPUP
// ══════════════════════════════════════════════════════════════
function toggleKeybinds() {
  const overlay = document.getElementById('keybinds-overlay');
  if (!overlay) return;
  if (overlay.classList.contains('visible')) { overlay.classList.remove('visible'); }
  else { _renderKeybindsGrid(_currentRom ? getKeybinds(_currentRom) : _genericKeybinds()); overlay.classList.add('visible'); }
}
function _renderKeybindsGrid(binds) {
  const grid = document.getElementById('keybinds-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const entry of binds) {
    if (entry.section) { const el = document.createElement('div'); el.className = 'keybinds-section'; el.textContent = entry.label; grid.appendChild(el); }
    else { const el = document.createElement('div'); el.className = 'keybinds-row'; el.innerHTML = `<span class="keybinds-key">${entry.key}</span><span class="keybinds-action">${entry.action}</span>`; grid.appendChild(el); }
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
  _saveConfirmTimer = setTimeout(() => { if (_saveConfirmPending) _dismissSaveConfirm(); }, 5000);
}
function _dismissSaveConfirm() {
  clearTimeout(_saveConfirmTimer);
  document.getElementById('save-confirm')?.classList.remove('visible');
  _saveConfirmPending = false;
  _setSaveStatus('SAV:ON', 'active');
}

// ══════════════════════════════════════════════════════════════
// SAVE / LOAD (save states — appDataFolder)
// ══════════════════════════════════════════════════════════════
async function manualSave() {
  if (!_saveConfirmPending) { if (await _cloudSaveExists(window.EJS_gameName)) { _showSaveConfirm(); return; } await _doSave(); return; }
  _dismissSaveConfirm(); await _doSave();
}
async function _doSave() {
  _setSaveStatus('SAVING...', 'saving');
  try {
    const gm = window.EJS_emulator?.gameManager;
    if (!gm || typeof gm.getState !== 'function') { _setSaveStatus('NO EMU', ''); _clearSaveStatus(); return; }
    const data = gm.getState();
    if (!data?.byteLength) { _setSaveStatus('NO DATA', ''); _clearSaveStatus(); return; }
    _setSaveStatus('UPLOADING...', 'saving');
    const ok = await _cloudUpload(window.EJS_gameName, data);
    _setSaveStatus(ok ? 'SAVED!' : 'UL ERR', ok ? 'active' : '');
  } catch (err) { dbg('_doSave ERR: ' + err.message); _setSaveStatus('ERR', ''); }
  _clearSaveStatus();
}
async function manualLoad() {
  _setSaveStatus('LOADING...', 'saving');
  try {
    const gm = window.EJS_emulator?.gameManager;
    if (!gm || typeof gm.loadState !== 'function') { _setSaveStatus('NO EMU', ''); _clearSaveStatus(); return; }
    const bytes = await _cloudDownload(window.EJS_gameName);
    if (!bytes?.byteLength) { _setSaveStatus('NO SAVE', ''); _clearSaveStatus(); return; }
    gm.loadState(bytes);
    _setSaveStatus('LOADED!', 'active');
  } catch (err) { dbg('manualLoad ERR: ' + err.message); _setSaveStatus('LOAD ERR', ''); }
  _clearSaveStatus();
}

// ══════════════════════════════════════════════════════════════
// EXIT
// ══════════════════════════════════════════════════════════════
async function exitRom() {
  _dismissSaveConfirm();
  document.getElementById('keybinds-overlay')?.classList.remove('visible');
  if (window._batteryAutoSave) { clearInterval(window._batteryAutoSave); window._batteryAutoSave = null; }
  if (window.EJS_emulator && _currentRom) {
    _setSaveStatus('SAVING...', 'saving');
    await _extractAndUploadBattery(_currentRom);
  }
  if (window.EJS_emulator) { try { window.EJS_emulator.gameManager?.pause(); } catch (e) {} }
  delete window.EJS_emulator;
  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';
  for (const url of Object.values(_cache.romBlobs)) URL.revokeObjectURL(url);
  _cache.romBlobs = {};
  if (window._lastStateBlobUrl) { URL.revokeObjectURL(window._lastStateBlobUrl); window._lastStateBlobUrl = null; }
  setLandscape(false);
  _currentRom = null;
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
  try { romUrl = await driveDownloadBlob(rom.fileId, _cache.romBlobs); }
  catch (err) {
    dbg('ROM DL ERR: ' + err.message);
    const lm = document.getElementById('loading-msg');
    if (lm) lm.innerHTML = 'ROM DOWNLOAD FAILED<br><span style="font-size:8px;color:#555">Press RSK to exit</span>';
    _setSaveStatus('ROM ERR', '');
    return;
  }
  _bootEJS(rom, romUrl);
}

// ══════════════════════════════════════════════════════════════
// EMULATORJS BOOT
// ══════════════════════════════════════════════════════════════
async function _bootEJS(rom, romUrl) {
  dbg('_bootEJS: "' + rom.name + '" core=' + rom.core + ' EJS=' + typeof window.EJS);
  if (window.EJS_emulator) { try { window.EJS_emulator.gameManager?.pause(); } catch (e) {} }
  delete window.EJS_emulator;
  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';
  const loadMsg = _ensureLoadingMsg();
  if (loadMsg) loadMsg.style.display = 'flex';
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_canvasWidth     = _isLandscape ? SCREEN.h : SCREEN.w;
  window.EJS_canvasHeight    = _isLandscape ? SCREEN.w : SCREEN.h;
  window.EJS_disableDatabases = true;
  window.EJS_core_options    = { video_filter: 'none' };
  await _loadBios(rom.core);

  const onGameStart = () => {
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.style.display = 'none';
    _setSaveStatus('NEW GAME', 'active');
    _clearSaveStatus();
    dbg('EJS_onGameStart fired');
    let attempts = 0;
    const findCanvas = setInterval(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) { canvas.style.imageRendering = 'pixelated'; canvas.style.transform = 'translateZ(0)'; dbg('Canvas isolated'); clearInterval(findCanvas); }
      else if (attempts++ > 50) { dbg('Canvas not found'); clearInterval(findCanvas); }
    }, 100);
    if (window._batteryAutoSave) clearInterval(window._batteryAutoSave);
    window._batteryAutoSave = setInterval(async () => {
      if (!_currentRom || document.getElementById('emulator-screen')?.style.display === 'none') {
        clearInterval(window._batteryAutoSave); window._batteryAutoSave = null; return;
      }
      dbg('Battery auto-save...');
      await _extractAndUploadBattery(_currentRom);
    }, 5 * 60 * 1000);
  };

  const buttons = {
    playPause: false, restart: false, mute: false, settings: false,
    fullscreen: false, saveState: false, loadState: false,
    screenRecord: false, gamepad: false, cheat: false, volume: false,
    saveSavFiles: false, loadSavFiles: false, quickSave: false, quickLoad: false,
  };
  const defaultControls = { 0: getControls(rom.core, rom.landscape), 1: {}, 2: {}, 3: {} };
  _injectBatterySave(rom);

  if (typeof window.EJS === 'function') {
    dbg('_bootEJS: calling new EJS(element, config)');
    const playerEl = document.getElementById('emulator-wrapper');
    if (!playerEl) { dbg('ERROR: #emulator-wrapper not found'); return; }
    const config = {
      gameUrl: romUrl, core: rom.core, gameName: rom.file,
      startOnLoad: true, muted: true, color: '#00ff41', backgroundColor: '#000000',
      defaultControls, buttons, onGameStart,
    };
    if (window.EJS_biosUrl) config.biosUrl = window.EJS_biosUrl;
    try { new window.EJS(playerEl, config); dbg('EJS instance created'); }
    catch (e) { dbg('EJS constructor ERR: ' + e.message); }
  } else {
    dbg('_bootEJS: loading loader.js (first launch)');
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
      dbg('EJS loader.js load FAILED');
      const loadingMsg = document.getElementById('loading-msg');
      if (loadingMsg) loadingMsg.innerHTML = 'EMULATOR LOAD FAILED<br><span style="font-size:8px;color:#555">Check your connection</span>';
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
    if (document.getElementById('keybinds-overlay')?.classList.contains('visible')) { toggleKeybinds(); return; }
    if (_saveConfirmPending) { _dismissSaveConfirm(); return; }
    if (document.getElementById('debug-overlay')?.style.display === 'flex') { toggleDebug(); return; }
    exitRom();
  }
});

// ══════════════════════════════════════════════════════════════
// KEYBOARD HANDLER
// ══════════════════════════════════════════════════════════════
window.addEventListener('keydown', (e) => {
  if (e.key === 'Call') {
    e.stopImmediatePropagation(); e.preventDefault();
    const inEmu = document.getElementById('emulator-screen').style.display !== 'none';
    if (inEmu) { _currentSlot = (_currentSlot + 1) % MAX_SLOTS; _setSaveStatus(`SLOT ${_currentSlot}`, 'active'); _clearSaveStatus(1500); }
  }
}, true);
window.addEventListener('keyup', (e) => { if (e.key === 'Call') { e.stopImmediatePropagation(); e.preventDefault(); } }, true);

document.addEventListener('keydown', (e) => {
  const inSel = document.getElementById('selector').style.display !== 'none';
  const inEmu = document.getElementById('emulator-screen').style.display !== 'none';

  if (inSel) {
    const f = document.activeElement;
    const isCatBtn = f?.classList.contains('cat-btn');
    const isRomItem = f?.classList.contains('rom-item');
    const isHeaderBtn = f?.closest('.selector-header') !== null;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isCatBtn || isHeaderBtn) _focusRomItem(_romIndex);
      else if (isRomItem && _romIndex < _filteredRoms.length - 1) _updateSelection(_romIndex + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isRomItem) { if (_romIndex > 0) _updateSelection(_romIndex - 1); else _focusActiveCategory(); }
      else if (isCatBtn) _focusHeaderButton();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isHeaderBtn) _focusPrevHeaderBtn();
      else { _cycleCategory(-1); if (isCatBtn) _focusActiveCategory(); else _focusRomItem(0); }
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isHeaderBtn) _focusNextHeaderBtn();
      else { _cycleCategory(1); if (isCatBtn) _focusActiveCategory(); else _focusRomItem(0); }
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); if (isRomItem || isCatBtn || isHeaderBtn) f.click(); else if (_filteredRoms.length > 0) launchRom(_romIndex); return; }
    if (e.key === '0') { e.preventDefault(); _currentRom = null; toggleKeybinds(); return; }
  }

  if (inEmu) {
    if (e.key === 'Call') { e.preventDefault(); _currentSlot = (_currentSlot + 1) % MAX_SLOTS; _setSaveStatus(`SLOT ${_currentSlot}`, 'active'); _clearSaveStatus(1500); }
    if (e.key === '7') { e.preventDefault(); manualLoad(); }
    if (e.key === '8') { e.preventDefault(); toggleDebug(); }
    if (e.key === '9') { e.preventDefault(); manualSave(); }
    if (e.key === '0') { e.preventDefault(); toggleKeybinds(); }
    if (_saveConfirmPending && !['7','8','9','0'].includes(e.key)) _dismissSaveConfirm();
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
  discoverRoms();
};

if (window.currentUser) window.onAuthSuccess(window.currentUser);
