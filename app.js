'use strict';
// ── app.js — RetroEmu CloudPhone Edition ─────────────────────────────────────
// Drive-backed ROM discovery + save states. No ROMs ever touch the server.

// ══════════════════════════════════════════════════════════════
// SCREEN CLASS DETECTION
// Runs once at startup. Uses physical screen pixels (screen.width/height)
// not CSS pixels, so it's unaffected by browser zoom or scaling.
//
// Classes:
//   standard  — 240×320 and above  (CloudPhone HMD 101/105 4G, etc.)
//   small     — anything ≤ 160px on either axis (128×160, 120×160, etc.)
// ══════════════════════════════════════════════════════════════
const _SW = window.screen.width;
const _SH = window.screen.height;
const SCREEN = {
  w:        _SW,
  h:        _SH,
  isSmall:  Math.min(_SW, _SH) <= 160,   // true for 128×160 / 120×160
  // Expose for debug
  toString() { return `${_SW}×${_SH} (${this.isSmall ? 'small' : 'standard'})`; },
};

// ══════════════════════════════════════════════════════════════
// SYSTEM REGISTRY
// ══════════════════════════════════════════════════════════════
// landscape     — default orientation for standard screens
// smallLandscape— override for small screens (omit = same as landscape)
// ejsSystem     — passed as EJS_system for multi-system cores
//
// Orientation rules:
//   GBA          → landscape on ALL screens (native 240×160 = wide)
//   GB/GBC/GG/SMS→ portrait on standard, landscape on small
//                  (native 160×144 fits perfectly in small landscape)
//   Everything else already landscape → no change needed
// ══════════════════════════════════════════════════════════════
const SYSTEMS = {
  gb:      { core: 'gambatte',         exts: ['.gb'],                  label: 'GB',  cls: 'gb',  landscape: false, smallLandscape: true },
  gbc:     { core: 'gambatte',         exts: ['.gbc'],                 label: 'GBC', cls: 'gbc', landscape: false, smallLandscape: true },
  gba:     { core: 'mgba',             exts: ['.gba'],                 label: 'GBA', cls: 'gba', landscape: true,  smallLandscape: true },
  nes:     { core: 'nestopia',         exts: ['.nes'],                 label: 'NES', cls: 'nes', landscape: true,  smallLandscape: true },
  snes:    { core: 'snes9x',           exts: ['.sfc', '.smc'],         label: 'SNES',cls: 'snes',landscape: true,  smallLandscape: true },
  psx:     { core: 'pcsx_rearmed',     exts: ['.chd'],                 label: 'PS1', cls: 'ps1', landscape: true,  smallLandscape: true },
  gg:      { core: 'segaGG',           exts: ['.gg'],                  label: 'GG',  cls: 'gg',  landscape: false, smallLandscape: true },
  sms:     { core: 'segaMS',           exts: ['.sms'],                 label: 'SMS', cls: 'sms', landscape: false, smallLandscape: true },
  genesis: { core: 'segaMD',           exts: ['.md', '.bin', '.gen'],  label: 'GEN', cls: 'gen', landscape: true,  smallLandscape: true },
  n64:     { core: 'mupen64plus_next', exts: ['.z64', '.n64', '.v64'], label: 'N64', cls: 'n64', landscape: true,  smallLandscape: true },
};

// Resolve the actual landscape value for the current screen
function _resolveLandscape(sys) {
  if (SCREEN.isSmall) {
    return sys.smallLandscape !== undefined ? sys.smallLandscape : sys.landscape;
  }
  return sys.landscape;
}

// ══════════════════════════════════════════════════════════════
// BIOS REGISTRY
// ══════════════════════════════════════════════════════════════
const BIOS_REGISTRY = {
  pcsx_rearmed: [
    { file: 'scph1001.bin',    ejsVar: 'EJS_biosUrl',  required: true  },
  ],
  // genesis_plus_gx (GG/SMS/Genesis), mgba, nestopia,
  // snes9x, mupen64plus_next — no BIOS needed
};

// ══════════════════════════════════════════════════════════════
// CONTROLS
// ══════════════════════════════════════════════════════════════
// EJS defaultControls button index (RetroArch pad layout):
//   0=B  1=Y  2=Select  3=Start  4=Up  5=Down  6=Left  7=Right
//   8=A  9=X  10=L  11=R  12=L2  13=R2

function _pad(dpad, { a, b, x = '', y = '', start, select, l = '', r = '', l2 = '', r2 = '' }) {
  return {
    0:  { value: b },       1:  { value: y },       2:  { value: select }, 3: { value: start },
    4:  { value: dpad[0] }, 5:  { value: dpad[1] }, 6:  { value: dpad[2] },7: { value: dpad[3] },
    8:  { value: a },       9:  { value: x },       10: { value: l },      11:{ value: r },
    12: { value: l2 },     13: { value: r2 },       14: { value: '' },     15:{ value: '' },
    24: { value: '' },     25: { value: '' },       26: { value: '' },     27:{ value: '' },
    28: { value: '' },     29: { value: '' },
  };
}

// Portrait d-pad
const _P = ['up arrow', 'down arrow', 'left arrow', 'right arrow'];

// Landscape d-pad — screen rotated 90° CW, game top is on RIGHT of phone.
// Physical: UP→game RIGHT | DOWN→game LEFT | LEFT→game UP | RIGHT→game DOWN
const _L = ['right arrow', 'left arrow', 'up arrow', 'down arrow'];

const _BTNS     = { a: 'enter', b: '1', start: 'escape', select: '3' };
const _BTNS_EXT = { ..._BTNS, x: '4', y: '2', l: '5', r: '6' };
const _BTNS_N64 = { ..._BTNS_EXT, l2: '7', r2: '9' };

// genesis_plus_gx has a non-standard button index layout:
//   0=B  1=C  2=Mode  3=(unused)  8=A  9=Start (NOT index 3)
function _genesisControls(dpad) {
  return {
    0:  { value: '1'      }, // B
    1:  { value: '4'      }, // C
    2:  { value: '3'      }, // Mode
    3:  { value: ''       }, // unused
    4:  { value: dpad[0] }, 5: { value: dpad[1] },
    6:  { value: dpad[2] }, 7: { value: dpad[3] },
    8:  { value: 'enter'  }, // A
    9:  { value: 'escape' }, // Start ← index 9
    10: { value: '5' },      // X
    11: { value: '6' },      // Y/Z
    12: { value: '' }, 13: { value: '' }, 14: { value: '' }, 15: { value: '' },
    24: { value: '' }, 25: { value: '' }, 26: { value: '' }, 27: { value: '' },
    28: { value: '' }, 29: { value: '' },
  };
}

const CONTROLS = {
  gambatte:         { portrait: _pad(_P, _BTNS),      landscape: _pad(_L, _BTNS)      },
  mgba:             { portrait: _pad(_P, _BTNS_EXT),  landscape: _pad(_L, _BTNS_EXT)  },
  nestopia:         { portrait: _pad(_P, _BTNS),      landscape: _pad(_L, _BTNS)      },
  snes9x:           { portrait: _pad(_P, _BTNS_EXT),  landscape: _pad(_L, _BTNS_EXT)  },
  pcsx_rearmed:     { portrait: _pad(_P, _BTNS_EXT),  landscape: _pad(_L, _BTNS_EXT)  },
  gearsystem:       { portrait: _pad(_P, _BTNS),      landscape: _pad(_L, _BTNS)      },
  segaMS:           { portrait: _pad(_P, _BTNS),      landscape: _pad(_L, _BTNS)      },
  segaMD:           { portrait: _pad(_P, _BTNS_EXT),  landscape: _pad(_L, _BTNS_EXT)  },
  mupen64plus_next: { portrait: _pad(_P, _BTNS_N64),  landscape: _pad(_L, _BTNS_N64)  },
};

function getControls(core, landscape) {
  const set = CONTROLS[core] || CONTROLS['gambatte'];
  return landscape ? set.landscape : set.portrait;
}

// ══════════════════════════════════════════════════════════════
// KEYBIND DEFINITIONS (popup display)
// ══════════════════════════════════════════════════════════════
const _KP = [
  { key: '↑↓←→', action: 'D-PAD'  },
  { key: 'ENTER', action: 'A'      },
  { key: '1',     action: 'B'      },
  { key: 'ESC',   action: 'START'  },
  { key: '3',     action: 'SELECT' },
];
const _KP_EXT = [..._KP,
  { key: '2', action: 'Y' }, { key: '4', action: 'X' },
  { key: '5', action: 'L' }, { key: '6', action: 'R' },
];
const _KL = [
  { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT'  },
  { key: '←', action: '→ UP'    }, { key: '→', action: '→ DOWN'  },
  { key: 'ENTER', action: 'A'   }, { key: '1',  action: 'B'      },
  { key: 'ESC',   action: 'START'},{ key: '3',  action: 'SELECT' },
  { key: '2', action: 'Y' }, { key: '4', action: 'X' },
  { key: '5', action: 'L' }, { key: '6', action: 'R' },
];
const _KL_N64 = [..._KL,
  { key: '7', action: 'Z (L2)'   },
  { key: '9', action: 'C↓ (R2)'  },
];
const _KL_GEN = [
  { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT'  },
  { key: '←', action: '→ UP'    }, { key: '→', action: '→ DOWN'  },
  { key: 'ENTER', action: 'A'   }, { key: '1',  action: 'B'      },
  { key: '4',     action: 'C'   }, { key: '5',  action: 'X'      },
  { key: '6',     action: 'Y/Z' }, { key: 'ESC', action: 'START' },
  { key: '3',     action: 'MODE'},
];
const _KP_GEN = [
  { key: '↑↓←→', action: 'D-PAD' },
  { key: 'ENTER', action: 'A'    }, { key: '1', action: 'B'      },
  { key: '4',     action: 'C'    }, { key: '5', action: 'X'      },
  { key: '6',     action: 'Y/Z'  }, { key: 'ESC', action: 'START'},
  { key: '3',     action: 'MODE' },
];
const _KMETA = [
  { section: true, label: 'SYSTEM'   },
  { key: '7',   action: 'LOAD STATE' },
  { key: '9',   action: 'SAVE STATE' },
  { key: '0',   action: 'CONTROLS'   },
  { key: 'RSK', action: 'EXIT'       },
];

// Keybind lookup: folder name → binds array (resolved at popup time using rom.landscape)
// We can't precompute because landscape depends on screen size detected at runtime.
function getKeybinds(rom) {
  const ls = rom.landscape; // already resolved for this device
  switch (rom.folder) {
    case 'gb':
    case 'gbc':     return [...(ls ? _KL     : _KP),     ..._KMETA];
    case 'gba':     return [..._KL,                       ..._KMETA]; // always landscape
    case 'gg':
    case 'sms':     return [...(ls ? _KL_GEN : _KP_GEN), ..._KMETA];
    case 'genesis': return [..._KL_GEN,                   ..._KMETA]; // always landscape
    case 'n64':     return [..._KL_N64,                   ..._KMETA]; // always landscape
    case 'nes':
    case 'snes':
    case 'psx':
    default:        return [..._KP,                       ..._KMETA];
  }
}

function _genericKeybinds() {
  return [
    { section: true, label: 'PORTRAIT SYSTEMS' },
    { key: '↑↓←→', action: 'D-PAD'  }, { key: 'ENTER', action: 'A'      },
    { key: '1',     action: 'B'      }, { key: '2',     action: 'Y'      },
    { key: '4',     action: 'X'      }, { key: 'ESC',   action: 'START'  },
    { key: '3',     action: 'SELECT' }, { key: '5',     action: 'L'      },
    { key: '6',     action: 'R'      },
    { section: true, label: 'LANDSCAPE — D-PAD REMAPPED' },
    { key: '↑', action: '→ RIGHT' }, { key: '↓', action: '→ LEFT'  },
    { key: '←', action: '→ UP'    }, { key: '→', action: '→ DOWN'  },
    ..._KMETA,
  ];
}

// ══════════════════════════════════════════════════════════════
// DRIVE CONFIG
// ══════════════════════════════════════════════════════════════
const DRIVE_ROOT   = 'cloudphone-emulator';
const DRIVE_BIOS   = 'bios';
const DRIVE_API    = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

const _cache = {
  rootId:    null,
  biosId:    null,   // null=unchecked  ''=not found  string=found
  biosFiles: {},     // filename → fileId
  romBlobs:  {},     // fileId   → blobUrl (cleared on ROM exit)
  biosBlobs: {},     // fileId   → blobUrl (kept across launches)
};

// ══════════════════════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════════════════════
let ROMS                = [];
let _romIndex           = 0;
let _currentRom         = null;
let _saveConfirmPending = false;
let _isLandscape        = false;
const _log              = [];

// ══════════════════════════════════════════════════════════════
// LOGGING
// ══════════════════════════════════════════════════════════════
function dbg(msg) {
  const ts = new Date().toTimeString().slice(0, 8);
  _log.push('[' + ts + '] ' + msg);
  if (_log.length > 100) _log.shift();
  const el = document.getElementById('debug-log');
  if (el) el.textContent = _log.slice(-60).join('\n');
}

function toggleDebug() {
  let el = document.getElementById('debug-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'debug-overlay';
    el.style.cssText = [
      'position:fixed;top:0;left:0;z-index:999999;overflow-y:auto;',
      'background:rgba(0,0,0,0.94);border:1px solid #00ff41;',
      'padding:6px;font-family:monospace;color:#00ff41;',
      _isLandscape
        ? 'font-size:8px;width:100vh;height:100vw;transform:rotate(90deg);transform-origin:top left;margin-left:100vw;'
        : 'font-size:9px;width:100vw;max-height:100vh;',
    ].join('');
    el.innerHTML = '<div style="color:#ffd700;margin-bottom:4px;letter-spacing:2px;">DEBUG — press 8 to close</div>'
                 + '<pre id="debug-log" style="white-space:pre-wrap;word-break:break-all;"></pre>';
    document.body.appendChild(el);
  }
  const visible = el.style.display !== 'none';
  el.style.display = visible ? 'none' : 'block';
  if (!visible) document.getElementById('debug-log').textContent = _log.slice(-60).join('\n') || 'No logs yet.';
}

// ══════════════════════════════════════════════════════════════
// LANDSCAPE TOGGLE
// ══════════════════════════════════════════════════════════════
function setLandscape(on) {
  _isLandscape = on;
  document.body.classList.toggle('landscape', on);
  dbg('Landscape: ' + on);
}

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
  const q = encodeURIComponent(
    `name='${name}' and mimeType='application/vnd.google-apps.folder' and ${parent} and trashed=false`
  );
  const data = await _driveGet(`/files?q=${q}&fields=files(id)&pageSize=1`);
  return data.files?.[0]?.id || null;
}

async function driveListChildren(parentId, foldersOnly = false) {
  const mf = foldersOnly
    ? `and mimeType='application/vnd.google-apps.folder'`
    : `and mimeType!='application/vnd.google-apps.folder'`;
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
  const res = await window.driveApiFetch(
    `${DRIVE_API}/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function driveWriteAppFile(filename, bytes, existingId = null) {
  const blob     = new Blob([bytes], { type: 'application/octet-stream' });
  const boundary = 'emu_mp_boundary';

  if (existingId) {
    const res = await window.driveApiFetch(
      `${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/octet-stream' }, body: blob }
    );
    return res.ok;
  }

  const meta   = JSON.stringify({ name: filename, parents: ['appDataFolder'] });
  const pre    = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`
               + `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const close  = `\r\n--${boundary}--`;
  const preB   = new TextEncoder().encode(pre);
  const closeB = new TextEncoder().encode(close);
  const body   = new Uint8Array(preB.byteLength + bytes.byteLength + closeB.byteLength);
  body.set(preB, 0);
  body.set(bytes, preB.byteLength);
  body.set(closeB, preB.byteLength + bytes.byteLength);

  const res = await window.driveApiFetch(
    `${DRIVE_UPLOAD}/files?uploadType=multipart`,
    { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body }
  );
  return res.ok;
}

// ══════════════════════════════════════════════════════════════
// ROM DISCOVERY
// ══════════════════════════════════════════════════════════════
async function discoverRoms() {
  _setRomListMsg('SCANNING DRIVE...');
  dbg('discoverRoms: start — screen ' + SCREEN.toString());

  try {
    _cache.rootId = _cache.rootId || await driveFindFolder(DRIVE_ROOT, null);

    if (!_cache.rootId) {
      _setRomListMsg('FOLDER NOT FOUND — create "cloudphone-emulator" in your Google Drive');
      _showSetupHint(true);
      return;
    }
    _showSetupHint(false);

    const subfolders = await driveListChildren(_cache.rootId, true);
    dbg('Subfolders: ' + subfolders.map(f => f.name).join(', '));

    ROMS = [];
    for (const folder of subfolders) {
      const key = folder.name.toLowerCase();
      const sys = SYSTEMS[key];
      if (!sys) { dbg('Unknown folder, skipping: ' + folder.name); continue; }

      // Resolve landscape for this device at discovery time —
      // stored on each ROM object so the rest of the code is unaware of screen size
      const landscape = _resolveLandscape(sys);

      const files = await driveListChildren(folder.id, false);
      for (const file of files) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!sys.exts.includes(ext)) continue;
        ROMS.push({
          name:      file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          file:      file.name,
          fileId:    file.id,
          core:      sys.core,
          label:     sys.label,
          cls:       sys.cls,
          landscape,               // resolved for this device
          ejsSystem: sys.ejsSystem || null,
          folder:    key,
        });
      }
    }

    dbg('Total ROMs: ' + ROMS.length);

    if (ROMS.length === 0) {
      _setRomListMsg('NO ROMS FOUND — add ROM files to your cloudphone-emulator subfolders');
      _showSetupHint(true);
      return;
    }

    _prefetchBios(); // non-blocking background index
    _buildRomList();

  } catch (err) {
    dbg('discoverRoms ERR: ' + err.message);
    _setRomListMsg(
      err.message === 'INSUFFICIENT_PERMISSIONS'
        ? 'DRIVE PERMISSION ERROR — sign out and sign in again'
        : 'DRIVE ERROR: ' + err.message
    );
  }
}

async function _prefetchBios() {
  if (_cache.biosId !== null) return;
  try {
    _cache.biosId = await driveFindFolder(DRIVE_BIOS, _cache.rootId) || '';
    if (_cache.biosId) {
      const files = await driveListChildren(_cache.biosId, false);
      for (const f of files) _cache.biosFiles[f.name.toLowerCase()] = f.id;
      dbg('BIOS indexed: ' + Object.keys(_cache.biosFiles).join(', '));
    } else {
      dbg('No bios/ folder found');
    }
  } catch (err) {
    _cache.biosId = '';
    dbg('_prefetchBios ERR: ' + err.message);
  }
}

async function _loadBios(core) {
  const required = BIOS_REGISTRY[core];
  if (!required) return true;

  if (!_cache.biosId) await _prefetchBios();
  if (!_cache.biosId) { dbg('BIOS folder missing for ' + core); return false; }

  let allOk = true;
  for (const { file, ejsVar, required: req } of required) {
    const fileId = _cache.biosFiles[file.toLowerCase()];
    if (!fileId) {
      dbg((req ? 'REQUIRED' : 'optional') + ' BIOS missing: ' + file);
      if (req) allOk = false;
      continue;
    }
    try {
      window[ejsVar] = await driveDownloadBlob(fileId, _cache.biosBlobs);
      dbg('BIOS set ' + ejsVar + ' ← ' + file);
    } catch (err) {
      dbg('BIOS DL ERR ' + file + ': ' + err.message);
      if (req) allOk = false;
    }
  }
  return allOk;
}

// ══════════════════════════════════════════════════════════════
// SAVE STATE — CLOUD (Drive appDataFolder)
// ══════════════════════════════════════════════════════════════
function _saveKey(gameName) {
  const uid  = window.currentUser?.id || 'anon';
  const base = gameName.replace(/\.[^.]+$/, ''); // Strip the extension for the save file
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return uid + '_' + safe + '.state';
}

async function _cloudSaveExists(gameName) {
  try { return !!(await driveFindAppFile(_saveKey(gameName))); }
  catch { return false; }
}

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
  } catch (err) {
    dbg('DL save ERR: ' + err.message);
    return null;
  }
}

async function _cloudUpload(gameName, bytes) {
  const filename = _saveKey(gameName);
  dbg('UL save: ' + filename + ' (' + bytes.byteLength + 'B)');
  try {
    const existingId = await driveFindAppFile(filename);
    const ok = await driveWriteAppFile(filename, bytes, existingId);
    dbg('UL save: ' + (ok ? 'OK' : 'FAILED'));
    return ok;
  } catch (err) {
    dbg('UL save ERR: ' + err.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════
function _setSaveStatus(text, cls) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = text;
  el.className   = 'save-status' + (cls ? ' ' + cls : '');
}

function _clearSaveStatus(delay = 2000) {
  setTimeout(() => _setSaveStatus('SAV:ON', 'active'), delay);
}

function _setRomListMsg(msg) {
  const el = document.getElementById('rom-list');
  if (el) el.innerHTML = `<div class="rom-list-msg">${msg}</div>`;
}

function _showSetupHint(show) {
  const el = document.getElementById('drive-setup-hint');
  if (el) el.style.display = show ? 'block' : 'none';
}

function _buildRomList() {
  const list = document.getElementById('rom-list');
  list.innerHTML = '';
  ROMS.forEach((rom, i) => {
    const btn = document.createElement('button');
    btn.className = 'rom-item' + (i === 0 ? ' selected' : '');
    btn.innerHTML = `<span class="rom-name">${rom.name}</span><span class="rom-badge ${rom.cls}">${rom.label}</span>`;
    btn.addEventListener('click', () => launchRom(i));
    list.appendChild(btn);
  });
  _romIndex = 0;
}

function _updateSelection(n) {
  n = Math.max(0, Math.min(n, ROMS.length - 1));
  document.querySelectorAll('.rom-item').forEach((el, i) => el.classList.toggle('selected', i === n));
  _romIndex = n;
  document.querySelectorAll('.rom-item')[n]?.scrollIntoView({ block: 'nearest' });
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
  if (!_saveConfirmPending) {
    if (await _cloudSaveExists(window.EJS_gameName)) { _showSaveConfirm(); return; }
    await _doSave(); return;
  }
  _dismissSaveConfirm();
  await _doSave();
}

async function _doSave() {
  _setSaveStatus('SAVING...', 'saving');
  try {
    const gm = window.EJS_emulator?.gameManager;
    if (!gm || typeof gm.getState !== 'function') {
      _setSaveStatus('NO EMU', ''); _clearSaveStatus(); return;
    }
    const data = gm.getState();
    if (!data?.byteLength) { _setSaveStatus('NO DATA', ''); _clearSaveStatus(); return; }
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
      _setSaveStatus('NO EMU', ''); _clearSaveStatus(); return;
    }
    const bytes = await _cloudDownload(window.EJS_gameName);
    if (!bytes?.byteLength) { _setSaveStatus('NO SAVE', ''); _clearSaveStatus(); return; }
    gm.loadState(bytes);
    _setSaveStatus('LOADED!', 'active');
  } catch (err) {
    dbg('manualLoad ERR: ' + err.message);
    _setSaveStatus('LOAD ERR', '');
  }
  _clearSaveStatus();
}

// ══════════════════════════════════════════════════════════════
// EXIT — RSK only, no auto-save
// ══════════════════════════════════════════════════════════════
function exitRom() {
  _dismissSaveConfirm();
  document.getElementById('keybinds-overlay')?.classList.remove('visible');
  for (const url of Object.values(_cache.romBlobs)) URL.revokeObjectURL(url);
  _cache.romBlobs = {};
  if (window._lastStateBlobUrl) {
    URL.revokeObjectURL(window._lastStateBlobUrl);
    window._lastStateBlobUrl = null;
  }
  setLandscape(false);
  _currentRom = null;
  window.location.reload();
}

// ══════════════════════════════════════════════════════════════
// LAUNCH
// ══════════════════════════════════════════════════════════════
async function launchRom(index) {
  const rom = ROMS[index];
  if (!rom || !window.currentUser) return;

  _currentRom        = rom;
  _saveConfirmPending = false;

  setLandscape(rom.landscape);
  document.getElementById('selector').style.display        = 'none';
  document.getElementById('emulator-screen').style.display = 'flex';
  document.getElementById('emu-title').textContent          = rom.name.toUpperCase();
  document.getElementById('loading-msg').style.display      = 'flex';
  _setSaveStatus('ROM DL...', 'saving');

  if (!rom.landscape) _renderPortraitHints();

  let romUrl;
  try {
    romUrl = await driveDownloadBlob(rom.fileId, _cache.romBlobs);
  } catch (err) {
    dbg('ROM DL ERR: ' + err.message);
    document.getElementById('loading-msg').innerHTML =
      'ROM DOWNLOAD FAILED<br><span style="font-size:8px;color:#555">Press RSK to exit</span>';
    _setSaveStatus('ROM ERR', '');
    return;
  }

  _bootEJS(rom, romUrl);
}

// ══════════════════════════════════════════════════════════════
// EMULATORJS BOOT
// ══════════════════════════════════════════════════════════════
async function _bootEJS(rom, romUrl) {
  document.querySelectorAll('.ejs-script').forEach(s => s.remove());
  const wrapper = document.getElementById('emulator-wrapper');
  [...wrapper.children].forEach(c => { if (c.id !== 'loading-msg') c.remove(); });
  delete window.EJS_emulator;

  ['EJS_loadStateURL','EJS_biosUrl','EJS_bios2Url','EJS_bios3Url'].forEach(v => delete window[v]);
  if (window._lastStateBlobUrl) {
    URL.revokeObjectURL(window._lastStateBlobUrl);
    window._lastStateBlobUrl = null;
  }

  window.EJS_player          = '#emulator-wrapper';
  window.EJS_gameName        = rom.file;
  window.EJS_gameUrl         = romUrl;
  window.EJS_core            = rom.core;
  window.EJS_pathtodata      = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded   = true;
  window.EJS_muted           = true;
  window.EJS_color           = '#00ff41';
  window.EJS_backgroundColor = '#000000';

  window.EJS_VirtualGamepadSettings = { disabled: true };
  window.EJS_Buttons = {
    playPause: false, restart: false, mute: false, settings: false,
    fullscreen: false, saveState: false, loadState: false,
    screenRecord: false, gamepad: false, cheat: false, volume: false,
    saveSavFiles: false, loadSavFiles: false, quickSave: false, quickLoad: false,
  };

  window.EJS_defaultControls = { 0: getControls(rom.core, rom.landscape), 1: {}, 2: {}, 3: {} };

  await _loadBios(rom.core);

  _setSaveStatus('CLOUD CHECK...', 'saving');
  let stateBytes = null;
  try { stateBytes = await _cloudDownload(window.EJS_gameName); }
  catch (err) { dbg('Cloud check ERR: ' + err.message); }

  if (stateBytes?.byteLength) {
    const blob = new Blob([stateBytes], { type: 'application/octet-stream' });
    window._lastStateBlobUrl = URL.createObjectURL(blob);
    window.EJS_loadStateURL  = window._lastStateBlobUrl;
    dbg('State ready: ' + stateBytes.byteLength + 'B');
  } else {
    dbg('No cloud save — fresh boot');
  }

  window.EJS_onGameStart = () => {
    document.getElementById('loading-msg').style.display = 'none';
    _setSaveStatus(window.EJS_loadStateURL ? 'LOADED!' : 'NEW GAME', 'active');
    _clearSaveStatus();
    dbg('EJS_onGameStart fired');
  };

  const script     = document.createElement('script');
  script.src       = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.className = 'ejs-script';
  script.onerror   = () => {
    dbg('EJS loader.js failed');
    document.getElementById('loading-msg').innerHTML =
      'EMULATOR LOAD FAILED<br><span style="font-size:8px;color:#555">Check your connection</span>';
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
    if (document.getElementById('debug-overlay')?.style.display === 'block') { toggleDebug(); return; }
    exitRom();
  }
  // Selector / auth: let RSK close the widget naturally
});

// ══════════════════════════════════════════════════════════════
// KEYBOARD HANDLER
// ══════════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  const inSel = document.getElementById('selector').style.display        !== 'none';
  const inEmu = document.getElementById('emulator-screen').style.display !== 'none';

  if (inSel) {
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      if (_romIndex < ROMS.length - 1) {
        _updateSelection(_romIndex + 1);
      } else {
        // At the bottom of the ROM list: manually push the scrollbar down
        document.getElementById('selector').scrollTop += 60;
      }
    }
    if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      if (_romIndex > 0) {
        _updateSelection(_romIndex - 1);
      } else {
        // At the top of the ROM list: manually push the scrollbar up
        document.getElementById('selector').scrollTop -= 60;
      }
    }
    if (e.key === 'Enter')     { e.preventDefault(); launchRom(_romIndex); }
    if (e.key === '0')         { e.preventDefault(); _currentRom = null; toggleKeybinds(); }
  }

  if (inEmu) {
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
let _authTimer = null;

window.onAuthSuccess = function(user) {
  dbg('Auth success: ' + user.name + ' | screen: ' + SCREEN.toString());
  document.getElementById('selector').style.display = 'flex';
  discoverRoms();
  
  // 55-Minute Timer for Drive Token Expiration (3300000 milliseconds)
  if (_authTimer) clearTimeout(_authTimer);
  _authTimer = setTimeout(async () => {
    _setSaveStatus('TOKEN EXPIRING!', 'warning');
    
    if (_currentRom && window.EJS_emulator) {
      dbg('Auto-saving before token expiration...');
      await _doSave(); 
      _setSaveStatus('RE-AUTH NEEDED', 'warning');
    }
  }, 3300000); 
};

if (window.currentUser) window.onAuthSuccess(window.currentUser);
