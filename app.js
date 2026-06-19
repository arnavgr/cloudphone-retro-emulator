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
function _genesisControls(dpad) {
  return {
    0:{ value: '1' }, 1:{ value: '4' }, 2:{ value: '3' }, 3:{ value: '' },
    4:{ value: dpad[0] }, 5:{ value: dpad[1] }, 6:{ value: dpad[2] }, 7:{ value: dpad[3] },
    8:{ value: 'enter' }, 9:{ value: 'escape' }, 10:{ value: '5' }, 11:{ value: '6' },
    12:{ value: '' }, 13:{ value: '' }, 14:{ value: '' }, 15:{ value: '' },
    24:{ value: '' }, 25:{ value: '' }, 26:{ value: '' }, 27:{ value: '' },
    28:{ value: '' }, 29:{ value: '' },
  };
}
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
const DRIVE_ROOT = 'cloudphone-emulator';
const DRIVE_BIOS = 'bios';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const _cache = { rootId: null, biosId: null, biosFiles: {}, romBlobs: {}, biosBlobs: {} };

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

// ══════════════════════════════════════════════════════════════
// ROM DISCOVERY
// ══════════════════════════════════════════════════════════════
async function discoverRoms() {
  if (_isScanning) return;
  _isScanning = true;
  _setRomListMsg('SCANNING DRIVE...');
  dbg('discoverRoms: start — screen ' + SCREEN.toString());
  try {
    _cache.rootId = _cache.rootId || await driveFindFolder(DRIVE_ROOT, null);
    if (!_cache.rootId) { _setRomListMsg('FOLDER NOT FOUND — create "cloudphone-emulator" in your Google Drive'); _showSetupHint(true); return; }
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
    if (ROMS.length === 0) { _setRomListMsg('NO ROMS FOUND — add ROM files to your cloudphone-emulator subfolders'); _showSetupHint(true); return; }
    _prefetchBios();
    _buildRomList();
  } catch (err) {
    dbg('discoverRoms ERR: ' + err.message);
    _setRomListMsg(err.message === 'INSUFFICIENT_PERMISSIONS' ? 'DRIVE PERMISSION ERROR — sign out and sign in again' : 'DRIVE ERROR: ' + err.message);
  } finally { _isScanning = false; }
}

async function _prefetchBios() {
  if (_cache.biosId !== null) return;
  try {
    _cache.biosId = await driveFindFolder(DRIVE_BIOS, _cache.rootId) || '';
    if (_cache.biosId) { const files = await driveListChildren(_cache.biosId, false); for (const f of files) _cache.biosFiles[f.name.toLowerCase()] = f.id; dbg('BIOS indexed: ' + Object.keys(_cache.biosFiles).join(', ')); }
    else dbg('No bios/ folder found');
  } catch (err) { _cache.biosId = ''; dbg('_prefetchBios ERR: ' + err.message); }
}

async function _loadBios(core) {
  const required = BIOS_REGISTRY[core];
  if (!required) return true;
  if (!_cache.biosId) await _prefetchBios();
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
// SAVE STATE — CLOUD
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
  else { _filteredRoms = ROMS.filter(r => r.folder === _activeCategory); if (_filteredRoms.length === 0) { _activeCategory = 'all'; _filteredRoms = [...ROMS]; } }
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
  if (_filteredRoms.length === 0) { list.innerHTML = '<div class="rom-list-msg">NO ROMS IN THIS CATEGORY</div>'; return; }
  _filteredRoms.forEach((rom, i) => {
    const btn = document.createElement('button');
    btn.className = 'rom-item' + (i === 0 ? ' selected' : '');
    btn.dataset.sys = rom.folder;
    btn.style.setProperty('--sys-color', SYS_COLORS[rom.folder] || '#00ff41');
    btn.style.setProperty('--rom-delay', i < 8 ? `${i * 20}ms` : '0ms');
    btn.innerHTML = `<span class="rom-name">${rom.name}</span><span class="rom-badge ${rom.cls}">${rom.label}</span>`;
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
// FULL EMULATORJS CLEANUP
// ══════════════════════════════════════════════════════════════
// This is the KEY fix for the "2nd rom downloads but never starts" bug.
//
// Root cause (confirmed against EmulatorJS's actual source): loader.js
// itself has NO check that skips re-initialization — it always creates a
// fresh `new EmulatorJS(...)` instance. The real problem is that the
// PREVIOUS instance was never properly shut down. EmulatorJS's GameManager
// mounts its save data in an IndexedDB-backed filesystem (IDBFS) on
// "/data/saves" and only unmounts/releases that connection when its
// internal "exit" event fires (this is exactly what EmulatorJS's own
// built-in Exit button triggers). We were never firing it, so:
//   - the old core's WASM main loop kept running in the background
//   - the old IndexedDB connection for /data/saves was never closed
// The next rom's GameManager then tries to open that same IndexedDB
// database and gets queued behind the still-open old connection — which
// never closes — so it hangs forever with no error, right after the ROM
// itself finishes downloading.
//
// We also still scrub EJS_* globals and remove old script tags as good
// hygiene (loader.js reads these fresh each run anyway since we reassign
// them before every boot, but stale callbacks like EJS_onGameStart
// shouldn't be left dangling).
// ══════════════════════════════════════════════════════════════
function _fullEJSCleanup() {
  // 1. Properly shut down the running core.
  //    NOTE: EmulatorJS has no destroy()/gameManager.pause() method — those
  //    calls below were silent no-ops. The real teardown path (what EJS's
  //    own built-in "Exit" button uses internally) is firing the "exit"
  //    event. GameManager listens for it and:
  //      - stops the WASM core's main loop (toggleMainLoop(0))
  //      - unmounts the IndexedDB-backed save filesystem (/data/saves)
  //      - aborts the Module
  //    Without this, the previous core keeps running in the background and
  //    — critically — keeps its IndexedDB connection for /data/saves open.
  //    The NEXT rom's GameManager tries to open that same IndexedDB database
  //    on mount and gets queued behind the still-open old connection, which
  //    never closes. That's why a second rom downloads fine but then hangs
  //    forever with no error: it's stuck waiting on a DB handle that the
  //    previous (never-exited) instance is still holding.
  try {
    if (window.EJS_emulator && typeof window.EJS_emulator.callEvent === 'function') {
      window.EJS_emulator.callEvent('exit');
      dbg('EJS exit event fired (proper core/IDBFS teardown)');
    }
  } catch (e) { dbg('EJS exit event ERR: ' + e.message); }

  // Legacy best-effort calls kept as a harmless fallback in case a future
  // EmulatorJS version adds real destroy()/pause() methods.
  try {
    if (window.EJS_emulator) {
      try { window.EJS_emulator.gameManager?.pause(); } catch (e) {}
      try { if (typeof window.EJS_emulator.destroy === 'function') window.EJS_emulator.destroy(); } catch (e) {}
    }
  } catch (e) {}

  // 2. Delete ALL EJS-related globals (good hygiene — these get
  //    reassigned fresh before every boot anyway, but this avoids
  //    leaving stale callbacks/config lying around between sessions)
  const ejsKeys = [];
  try {
    for (const key of Object.keys(window)) {
      if (key.startsWith('EJS')) ejsKeys.push(key);
    }
  } catch (e) {}
  ejsKeys.forEach(k => { try { delete window[k]; } catch (e) {} });

  // 3. Remove ALL EmulatorJS CDN scripts from the DOM
  //    This includes loader.js AND the dynamically loaded core
  //    scripts (gambatte.js, mgba.js, nestopia.js, etc.)
  document.querySelectorAll('script[src*="emulatorjs.org"]').forEach(s => s.remove());
  document.querySelectorAll('.ejs-script').forEach(s => s.remove());

  // 4. Clean the wrapper DOM completely
  const wrapper = document.getElementById('emulator-wrapper');
  if (wrapper) wrapper.innerHTML = '';

  // 5. Clean up stale state blob
  if (window._lastStateBlobUrl) {
    URL.revokeObjectURL(window._lastStateBlobUrl);
    window._lastStateBlobUrl = null;
  }
}

// Recreate the loading message element inside the wrapper
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
// SAVE / LOAD
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
function exitRom() {
  _dismissSaveConfirm();
  document.getElementById('keybinds-overlay')?.classList.remove('visible');

  // Full EmulatorJS cleanup — destroys instance, deletes window.EJS,
  // removes all CDN scripts, clears wrapper DOM
  _fullEJSCleanup();

  // Re-add the loading message so launchRom() can show it next time
  _ensureLoadingMsg();

  // Revoke ROM blob URLs
  for (const url of Object.values(_cache.romBlobs)) URL.revokeObjectURL(url);
  _cache.romBlobs = {};

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

  // Ensure loading message exists and is visible
  const loadMsg = _ensureLoadingMsg();
  if (loadMsg) loadMsg.style.display = 'flex';

  if (!rom.landscape) _renderPortraitHints();

  let romUrl;
  try {
    romUrl = await driveDownloadBlob(rom.fileId, _cache.romBlobs);
  } catch (err) {
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
  // Full cleanup of any previous EmulatorJS state.
  // This ensures window.EJS is deleted so loader.js re-initializes.
  _fullEJSCleanup();

  // Re-add the loading message in the now-empty wrapper
  const loadMsg = _ensureLoadingMsg();
  if (loadMsg) loadMsg.style.display = 'flex';

  // Set EJS configuration globals
  window.EJS_player          = '#emulator-wrapper';
  window.EJS_gameName        = rom.file;
  window.EJS_gameUrl         = romUrl;
  window.EJS_core            = rom.core;
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_muted           = true;
  window.EJS_color           = '#00ff41';
  window.EJS_backgroundColor = '#000000';
  window.EJS_canvasWidth     = _isLandscape ? SCREEN.h : SCREEN.w;
  window.EJS_canvasHeight    = _isLandscape ? SCREEN.w : SCREEN.h;
  window.EJS_disableDatabases = true;
  window.EJS_core_options     = { video_filter: 'none' };
  window.EJS_Buttons = {
    playPause: false, restart: false, mute: false, settings: false,
    fullscreen: false, saveState: false, loadState: false,
    screenRecord: false, gamepad: false, cheat: false, volume: false,
    saveSavFiles: false, loadSavFiles: false, quickSave: false, quickLoad: false,
  };
  window.EJS_defaultControls = { 0: getControls(rom.core, rom.landscape), 1: {}, 2: {}, 3: {} };

  await _loadBios(rom.core);

  window.EJS_onGameStart = () => {
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.style.display = 'none';
    _setSaveStatus('NEW GAME', 'active');
    _clearSaveStatus();
    dbg('EJS_onGameStart fired');
    let attempts = 0;
    const findCanvas = setInterval(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) { canvas.style.imageRendering = 'pixelated'; canvas.style.transform = 'translateZ(0)'; dbg('Hack 4: Canvas isolated'); clearInterval(findCanvas); }
      else if (attempts++ > 50) { dbg('Hack 4 ERR: Canvas not found'); clearInterval(findCanvas); }
    }, 100);
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.className = 'ejs-script';
  script.onerror = () => {
    dbg('EJS loader.js failed');
    const loadingMsg = document.getElementById('loading-msg');
    if (loadingMsg) loadingMsg.innerHTML = 'EMULATOR LOAD FAILED<br><span style="font-size:8px;color:#555">Check your connection</span>';
  };
  document.body.appendChild(script);
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
