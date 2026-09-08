# cloudphone-retro-emulator

A lightweight, retro-emulator made for keypad devices that support [Cloudmosa CloudPhone](https://www.cloudphone.tech).

This project runs entirely in the browser, leveraging EmulatorJS for hardware emulation, Google Drive for zero-server ROM storage, and Supabase for secure Google OAuth integration.

## ✨ Features

**Zero-Server Architecture & Bring Your Own ROM (BYOR):**
ROMs are streamed directly from your personal Google Drive using Google Picker. No game files are ever hosted or stored on application servers.

**Keypad Optimized UI:**
Custom control mappings designed for physical T9/feature-phone keypads, bypassing the need for touch screens or external gamepads.

**T9 A–Z ROM Navigation:**
On the selector screen, digits `2–9` jump straight to titles by letter group (2 = A/B/C … 9 = W/X/Y/Z). Repeated presses cycle through matches — no more scrolling past 30 entries one keypress at a time.

**Dynamic Screen Support:**
Auto-detects screen resolution to handle both standard (240×320) and small (128×160) displays. Landscape games are rotated natively inside EmulatorJS' render loop (`EJS_videoRotation`) instead of via a CSS transform on the canvas, avoiding per-frame compositing overhead over CloudPhone's remote rendering proxy.

**Picker-Based ROM Management:**
Select ROMs and BIOS files directly from your Drive using Google Picker. The app remembers every file you pick — no re-selection needed on future visits.

**Safe In-Game Saves:**
In-game saves are handled safely. When you import a `.sav`, the app copies it into a private working save area and leaves your original file untouched. This prevents a corrupted emulator save from overwriting your original file.

**Save Backup & Recovery Options:**
Imported saves are backed up automatically inside the app's private Drive storage. If your active save becomes corrupted, you can restore the imported backup from the ROM options menu.

**Manual Save Export:**
You can manually export your current active in-game save to a visible folder in your Drive whenever you want a user-visible backup.

**Cloud Save States (Indexed):**
Save states (full emulator snapshots) are synced to a hidden `appDataFolder` in Google Drive. State metadata (file IDs, slots, timestamps) is stored in the ROM index, so slot presence checks happen locally without extra Drive API calls.

**Lifecycle Save Guard:**
Battery saves are flushed the moment the page is hidden (`visibilitychange` / `pagehide`), so CloudPhone container recycling or sudden network drops can't discard progress made between the 5-minute auto-save intervals.

**Efficient Sync (Dirty Checking):**
Auto-saves compare SRAM against the last committed snapshot in memory. If nothing changed, the upload is skipped entirely — conserving Drive API quota and bandwidth when a game is idle.

**Automatic Cleanup:**
Removing a game from the list also deletes its linked private artifacts (battery save copies, imported-save backups, save states, and cheat entries). Your original Drive files are never touched.

**Save Indicators:**
Green dots next to ROM names show which games have an in-game save entry.

**Fast Forward:**
Press `#` in-game to toggle fast forward (EmulatorJS action 27) — ideal for turn-based RPGs on GBC/GBA.

**Audio Toggle:**
Audio is muted by default to avoid buffer lag over the CloudPhone stream. Enable it per-session from the `*` options menu (`AUDIO: ON/OFF`). When enabled, audio buffers are initialized with a conservative latency hint to absorb network jitter.

**Cheat Engine:**
Per-ROM GameShark / Action Replay codes can be added from the `*` options menu (`CHEATS`) and are injected into the running core via `gameManager.loadCheat` shortly after boot — no pre-patched ROMs needed.

**ROM Options Menu:**
Press `*` on any ROM to access contextual options such as:
- `LAUNCH`
- `IMPORT SAVE`
- `RESTORE BACKUP`
- `EXPORT SAVE`
- `DELETE SAVE`
- `CHEATS`
- `AUDIO: ON/OFF`
- `REMOVE FROM LIST`

**Persistent Drive Access:**
Google OAuth tokens are silently refreshed in the background via a serverless function, so Drive access never expires mid-session.

## 🎮 Supported Systems

- **Nintendo:** GB/GBC, GBA, NES, SNES.
- **Sega:** Game Gear (GG), Master System (SMS), Genesis/Mega Drive (MD).
- **Sony:** PlayStation 1 (PS1/PSX).

## 🚀 Setup

### First Time
1. Sign in with your Google Account and grant Drive access when prompted.
2. Press the `+` button in the top-right corner of the ROM selector.
3. Google Picker opens. You may briefly see a Google consent popup first; this is required to allow the Picker to function securely within the CloudPhone environment.
4. Navigate to your ROM files and select them. You can select multiple files at once.
5. The app classifies each file by extension, adds them to the ROM list, and saves the index.

The app never touches your Drive except to:
- read the files you explicitly pick,
- store private app data such as save states and save backups,
- create manual exports when you explicitly choose `EXPORT SAVE`.

### Adding More ROMs Later
Press `+` at any time to open Picker again. Files you've already added are deduplicated automatically — picking the same file twice just updates the reference.

### Adding BIOS Files
While most systems can run using High-Level Emulation (HLE), adding official BIOS files is strongly recommended for maximum compatibility and stability.

**PlayStation (PSX):** A valid BIOS is required for PSX to prevent potential save file corruption. While games may still boot using HLE fallback, using a BIOS is strongly advised.

**Supported PSX BIOS Filenames** — the app automatically recognizes and classifies any of the following files:
- `scph1001.bin` (US - Recommended)
- `scph5501.bin` (US)
- `scph7001.bin` (US)
- `scph5502.bin` (Europe)
- `scph5500.bin` (Japan)
- `psxonpsp660.bin` (PSP PSX BIOS)

**How to Add**
1. Press the `+` button in the app.
2. Select your BIOS file.
3. The app will automatically detect known BIOS filenames and store them separately from your ROM library.

### Supported File Extensions

| System | Extensions |
| --- | --- |
| Game Boy Color | `.gb`, `.gbc` |
| Game Boy Advance | `.gba` |
| NES | `.nes` |
| SNES | `.sfc`, `.smc` |
| PlayStation 1 | `.chd` |
| Game Gear | `.gg` |
| Master System | `.sms` |
| Genesis / Mega Drive | `.md`, `.gen`, `.bin` * |

\* `.bin` files are classified as Genesis ROMs unless the filename matches a known BIOS name, in which case they are treated as BIOS files.

## 💾 How Saves Work

The app has two independent save systems:

### 1. In-Game Saves (SRAM / Battery Saves)
These are saves created from inside the game — for example:
- Pokémon's "Save" option
- Zelda's save menu

Without these, progress is lost when you exit.

**Where they are stored**

Active in-game saves are stored as private working copies inside Google Drive's hidden `appDataFolder`. This folder:
- is hidden from normal Drive browsing,
- is accessible only to this app,
- is used for app-managed save data.

**What happens when you import a save**

When you use `*` → `IMPORT SAVE`, the app:
1. Downloads the `.sav` file you selected from Drive
2. Creates a private active working copy
3. Creates a private backup copy of the imported file
4. Leaves your original selected file untouched

**Auto-saving & dirty checking**

Active in-game saves are automatically written:
- on exit
- every 5 minutes while playing
- immediately when the page is hidden (backgrounded or disconnected)

Each auto-save first compares the SRAM buffer against the last committed snapshot; if nothing mutated, the Drive upload is skipped entirely.

**Green dot indicator**

A green dot next to a ROM's name means the app currently has a save entry for that ROM.

### 2. Save Backup, Export, and Delete
Press `*` on a ROM to open its options. Depending on whether a save exists, you may see `IMPORT SAVE`, `RESTORE BACKUP`, `EXPORT SAVE`, and `DELETE SAVE`.

- **`IMPORT SAVE`** — brings in a `.sav` from Drive. The selected file is copied into the app's private save area and is never modified automatically.
- **`RESTORE BACKUP`** — restores the active save from the backup copy made when you imported it.
- **`EXPORT SAVE`** — creates a visible backup in `cloudphone-emulator-saves/`, named `gamename.export-YYYY-MM-DDTHH-MM-SS.sav`.
- **`DELETE SAVE`** — removes the app-managed active and backup copies. It does **not** delete the original file you imported, your ROM, your BIOS, or manual exports.

### 3. Save States (Snapshots)
Full emulator state snapshots — like a suspend/resume feature. Especially useful for games without in-game saves.

- **Stored in:** Google Drive's hidden `appDataFolder`
- **Indexed:** state file IDs and timestamps live in the ROM index, so presence checks don't poll the Drive API
- **Manual controls:** press `9` to save, `7` to load
- **Slots:** press the **Call** key to cycle through 4 independent save slots
- **Per-user:** each Google account has its own isolated save states

### 4. Automatic Cleanup
`*` → `REMOVE FROM LIST` deletes the ROM entry **and** garbage-collects its linked private artifacts: battery save copies, imported-save backups, all save-state slots, and cheat entries. Original Drive files (ROM, BIOS, imported `.sav`, manual exports) are never deleted.

## 🎯 Cheats

1. Press `*` on a ROM → `CHEATS`.
2. Select `+ ADD CHEAT` and enter a GameShark / Action Replay hex code in the prompt (e.g. `01FF16D0`). Multiple codes can be joined with `+`.
3. Optionally add a description.
4. Codes are stored per-ROM in your private index and applied automatically shortly after the game boots.
5. Select any saved cheat to `ENABLE`/`DISABLE` or `DELETE` it.

Cheats are applied via EmulatorJS' `gameManager.loadCheat`. If a core doesn't expose the cheat API, the status bar reports `CHEAT ENGINE N/A`. Cheat codes can crash or corrupt saves on some cores — use at your own risk and keep an exported save backup.

## ⌨️ Controls

Press `0` in-game to open the full controls reference.

### In-Game

| Key | Action |
| --- | --- |
| D-Pad / Arrows | D-Pad |
| ENTER | A |
| 1 | B |
| 2 | Y |
| 4 | X |
| 5 | L |
| 6 | R |
| LSK | Start |
| 3 | Select |
| # | Fast Forward |
| 7 | Load State |
| 9 | Save State |
| Call | Cycle save slot |
| 8 | Debug overlay |
| 0 | Controls help |
| RSK | Exit ROM |

### ROM Selector

| Key | Action |
| --- | --- |
| ↑↓ | Navigate ROM list |
| ←→ | Switch category |
| 2–9 | T9 A–Z jump (repeated presses cycle matches) |
| ENTER | Launch |
| * | ROM options menu |
| 0 | Controls help |

## 🛠️ Architecture & Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3.
- **Hosting:** Cloudflare Pages.
- **Emulation:** [EmulatorJS](https://emulatorjs.org/).
- **Auth:** Supabase (Google OAuth provider).
- **Token Refresh:** Cloudflare Worker.
- **File Selection:** Google Picker API.
- **Storage:** Google Drive API v3.
- **ROM Index:** JSON blob in `appDataFolder` mapping Drive file IDs to ROM metadata, save-state metadata, and cheat entries.

## 🔒 Security & Privacy

### Google Drive permissions
The app requests two scopes:

| Scope | Why |
| --- | --- |
| `drive.file` | Grants access to files the app creates and files the user explicitly opens through Google Picker. This includes ROMs, BIOS files, imported saves, and manual save exports. |
| `drive.appdata` | Used to store the ROM index, save states, active battery saves, and imported save backups in a hidden, app-only folder. |

### Why `drive.file` is the right scope
`drive.file` is Google's non-sensitive scope for per-file Drive access. By using Google Picker, you explicitly grant the app access only to the exact files you choose. This means:
- ROMs you pick can be streamed on future visits without re-picking
- BIOS files you pick can be reused
- A `.sav` you import can be read and copied safely
- The app can create manual export files in its own folder
- The app cannot access any Drive file you did not deliberately select

### What the app writes to Drive

| Data | Location | When |
| --- | --- | --- |
| ROM index (incl. state metadata & cheats) | appDataFolder | When ROMs/BIOS/saves/states/cheats are added or changed |
| Save states | appDataFolder | When you manually save state |
| Active battery saves | appDataFolder | On exit, on hide, and every 5 minutes (only when SRAM changed) |
| Imported save backups | appDataFolder | When you import a `.sav` |
| Manual save exports | cloudphone-emulator-saves/ | Only when you choose `EXPORT SAVE` |

The app does not automatically modify the original `.sav` file you selected through Picker.

### What the app does not do
The app does not:
- upload ROMs to a server
- store ROM contents remotely outside your Drive
- scan your entire Drive
- automatically overwrite your original imported save files
- delete your original imported save file
- delete ROMs or BIOS files you picked

`DELETE SAVE` and `REMOVE FROM LIST` remove only app-managed copies and metadata.

## 🛠️ Planned Improvements

- **Button Remapping:** Open an issue if the default keypad layout doesn't fit your device.
- **System Requests:** Additional EmulatorJS-supported systems can be added on request.
- **Performance:** Feedback on frame rate, input lag, or stutter welcome.
- **Save Edge Cases:** If saves fail to load or sync after network interruptions or token refreshes, open an issue and include the debug log (press `8` in-game).

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit and push your changes.
4. Open a Pull Request.

For significant changes, open an issue to discuss first.

## ⚠️ Disclaimer

This project is an experimental emulator interface. Performance may vary depending on:
- the CloudPhone server's proximity
- your device's hardware capabilities
- network conditions
- emulator core behavior

## 📄 License

This project is licensed under the GPLv3 License. See the `LICENSE` file for details.
