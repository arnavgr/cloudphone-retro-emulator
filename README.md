# cloudphone-retro-emulator

A lightweight, retro-emulator made for keypad devices that support [Cloudmosa CloudPhone](https://www.cloudphone.tech).

This project runs entirely in the browser, leveraging EmulatorJS for hardware emulation, Google Drive for zero-server ROM storage, and Supabase for secure Google OAuth integration.

---

## ✨ Features

- **Zero-Server Architecture & Bring Your Own ROM (BYOR):**  
  ROMs are streamed directly from your personal Google Drive using Google Picker. No game files are ever hosted or stored on application servers.

- **Keypad Optimized UI:**  
  Custom control mappings designed for physical T9/feature-phone keypads, bypassing the need for touch screens or external gamepads.

- **Dynamic Screen Support:**  
  Auto-detects screen resolution to handle both standard (240×320) and small (128×160) displays, dynamically switching rendering orientations.

- **Picker-Based ROM Management:**  
  Select ROMs and BIOS files directly from your Drive using Google Picker. The app remembers every file you pick — no re-selection needed on future visits.

- **Safe In-Game Saves:**  
  In-game saves are now handled safely. When you import a `.sav`, the app copies it into a private working save area and leaves your original file untouched. This prevents a corrupted emulator save from overwriting your original file.

- **Save Backup & Recovery Options:**  
  Imported saves are backed up automatically inside the app’s private Drive storage. If your active save becomes corrupted, you can restore the imported backup from the ROM options menu.

- **Manual Save Export:**  
  You can manually export your current active in-game save to a visible folder in your Drive whenever you want a user-visible backup.

- **Cloud Save States:**  
  Save states (full emulator snapshots) are synced to a hidden `appDataFolder` in Google Drive, allowing you to pick up exactly where you left off.

- **Save Indicators:**  
  Green dots next to ROM names show which games have an in-game save entry.

- **ROM Options Menu:**  
  Press `*` on any ROM to access contextual options such as:
  - `LAUNCH`
  - `IMPORT SAVE`
  - `RESTORE BACKUP`
  - `EXPORT SAVE`
  - `DELETE SAVE`
  - `REMOVE FROM LIST`

- **Persistent Drive Access:**  
  Google OAuth tokens are silently refreshed in the background via a serverless function, so Drive access never expires mid-session.

---

## 🎮 Supported Systems

- **Nintendo:** GB/GBC, GBA, NES, SNES.
- **Sega:** Game Gear (GG), Master System (SMS), Genesis/Mega Drive (MD).
- **Sony:** PlayStation 1 (PS1/PSX).

---

## 🚀 Setup

### First Time

1. Sign in with your Google Account and grant Drive access when prompted.
2. Press the `+` button in the top-right corner of the ROM selector.
3. Google Picker opens.  
   You may briefly see a Google consent popup first; this is required to allow the Picker to function securely within the CloudPhone environment.
4. Navigate to your ROM files and select them. You can select multiple files at once.
5. The app classifies each file by extension, adds them to the ROM list, and saves the index.

The app never touches your Drive except to:
- read the files you explicitly pick,
- store private app data such as save states and save backups,
- create manual exports when you explicitly choose `EXPORT SAVE`.

---

### Adding More ROMs Later

Press `+` at any time to open Picker again.

Files you've already added are deduplicated automatically — picking the same file twice just updates the reference.

---

### Adding BIOS Files

While most systems can run using High-Level Emulation (HLE), adding official BIOS files is strongly recommended for maximum compatibility and stability.

> **PlayStation (PSX):** A valid BIOS is required for PSX to prevent potential save file corruption. While games may still boot using HLE fallback, using a BIOS is strongly advised.

#### Supported PSX BIOS Filenames
The app automatically recognizes and classifies any of the following files:

* `scph1001.bin` (US - Recommended)
* `scph5501.bin` (US)
* `scph7001.bin` (US)
* `scph5502.bin` (Europe)
* `scph5500.bin` (Japan)
* `psxonpsp660.bin` (PSP PSX BIOS)

#### How to Add
1. Press the **`+`** button in the app.
2. Select your BIOS file.
3. The app will automatically detect known BIOS filenames and store them separately from your ROM library.

---

### Supported File Extensions

| System | Extensions |
|---|---|
| Game Boy Color | `.gb`, `.gbc` |
| Game Boy Advance | `.gba` |
| NES | `.nes` |
| SNES | `.sfc`, `.smc` |
| PlayStation 1 | `.chd` |
| Game Gear | `.gg` |
| Master System | `.sms` |
| Genesis / Mega Drive | `.md`, `.gen`, `.bin` * |

\* `.bin` files are classified as Genesis ROMs unless the filename matches a known BIOS name, in which case they are treated as BIOS files.

---

## 💾 How Saves Work

The app has two independent save systems:

---

## 1. In-Game Saves (SRAM / Battery Saves)

These are saves created from inside the game — for example:
- Pokémon’s “Save” option
- Zelda’s save menu

Without these, progress is lost when you exit.

### Where they are stored now

Active in-game saves are stored as **private working copies** inside Google Drive’s hidden `appDataFolder`.

This folder:
- is hidden from normal Drive browsing,
- is accessible only to this app,
- is used for app-managed save data.

### What happens when you import a save

When you use:

- `*` → `IMPORT SAVE`

the app does this:

1. Downloads the `.sav` file you selected from Drive
2. Creates a private **active working copy**
3. Creates a private **backup copy** of the imported file
4. Leaves your original selected file untouched

This is the important safety change:

> The app no longer automatically overwrites the original `.sav` file you picked from Drive.

### Auto-saving

Active in-game saves are automatically written:
- on exit
- every 5 minutes while playing

These automatic writes go only to the app-managed active working copy.

### Green dot indicator

A green dot next to a ROM’s name means the app currently has a save entry for that ROM.

---

## 2. Save Backup, Export, and Delete

Press `*` on a ROM to open its options.

Depending on whether a save exists, you may see:

- `IMPORT SAVE`
- `RESTORE BACKUP`
- `EXPORT SAVE`
- `DELETE SAVE`

### `IMPORT SAVE`

Use this to bring in a `.sav` from Drive.

The selected file is copied into the app’s private save area and is not modified automatically.

### `RESTORE BACKUP`

Use this if your current active save becomes corrupted or unwanted.

This restores the active save from the backup copy that was made when you imported the save.

### `EXPORT SAVE`

Use this to create a visible backup in your Drive.

Exports are written to:

- `cloudphone-emulator-saves/`

The exported file is named like:

- `gamename.export-YYYY-MM-DDTHH-MM-SS.sav`

This is useful if you want:
- a user-visible backup,
- a file you can move elsewhere,
- a copy you can inspect from normal Drive browsing.

### `DELETE SAVE`

Use this to remove a corrupted or unwanted save entry.

This deletes:
- the active app-managed save copy
- the app-managed backup copy

It does **not** delete:
- the original file you imported through Picker
- your ROM
- your BIOS
- manually exported save files

---

## 3. Save States (Snapshots)

Full emulator state snapshots — like a suspend/resume feature.

These are especially useful for games without in-game saves.

### Stored in

- Google Drive’s hidden `appDataFolder`

### Manual controls

- Press `9` to save
- Press `7` to load

### Slots

- Press the **Call** key to cycle through 4 independent save slots

### Per-user

Each Google account has its own isolated save states.

---

## ⌨️ Controls

Press `0` in-game to open the full controls reference.

Default mappings:

| Key | Action |
|---|---|
| D-Pad / Arrows | D-Pad |
| ENTER | A |
| 1 | B |
| 2 | Y |
| 4 | X |
| 5 | L |
| 6 | R |
| LSK | Start |
| 3 | Select |
| 7 | Load State |
| 9 | Save State |
| Call | Cycle save slot |
| 8 | Debug overlay |
| 0 | Controls help |
| RSK | Exit ROM |

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3.
- **Hosting:** Cloudflare Pages.
- **Emulation:** [EmulatorJS](https://emulatorjs.org/).
- **Auth:** Supabase (Google OAuth provider).
- **Token Refresh:** Cloudflare Worker.
- **File Selection:** Google Picker API.
- **Storage:** Google Drive API v3.
- **ROM Index:** JSON blob in `appDataFolder` mapping Drive file IDs to ROM metadata.

---

## 🔒 Security & Privacy

### Google Drive permissions

The app requests two scopes:

| Scope | Why |
|---|---|
| `drive.file` | Grants access to files the app creates and files the user explicitly opens through Google Picker. This includes ROMs, BIOS files, imported saves, and manual save exports. |
| `drive.appdata` | Used to store the ROM index, save states, active battery saves, and imported save backups in a hidden, app-only folder. |

---

## Why `drive.file` is the right scope

`drive.file` is Google’s non-sensitive scope for per-file Drive access.

By using Google Picker, you explicitly grant the app access only to the exact files you choose.

This means:

- ROMs you pick can be streamed on future visits without re-picking
- BIOS files you pick can be reused
- A `.sav` you import can be read and copied safely
- The app can create manual export files in its own folder
- The app cannot access any Drive file you did not deliberately select

---

## What the app writes to Drive

The app writes only the following:

| Data | Location | When |
|---|---|---|
| ROM index | `appDataFolder` | When ROMs/BIOS/saves are added or changed |
| Save states | `appDataFolder` | When you manually save state |
| Active battery saves | `appDataFolder` | On exit and every 5 minutes while playing |
| Imported save backups | `appDataFolder` | When you import a `.sav` |
| Manual save exports | `cloudphone-emulator-saves/` | Only when you choose `EXPORT SAVE` |

The app does **not** automatically modify the original `.sav` file you selected through Picker.

---

## What the app does not do

The app does **not**:

- upload ROMs to a server
- store ROM contents remotely outside your Drive
- scan your entire Drive
- automatically overwrite your original imported save files
- delete your original imported save file
- delete ROMs or BIOS files you picked

`DELETE SAVE` removes only the app-managed active save and backup copies.

---

## 🛠️ Planned Improvements

- **Button Remapping:** Open an issue if the default keypad layout doesn’t fit your device.
- **System Requests:** Additional EmulatorJS-supported systems can be added on request.
- **Performance:** Feedback on frame rate, input lag, or stutter welcome.
- **Save Edge Cases:** If saves fail to load or sync after network interruptions or token refreshes, open an issue and include the debug log.

To open the debug log:
- press `8` in-game

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:  
   `git checkout -b feature/your-feature`
3. Commit and push your changes.
4. Open a Pull Request.

For significant changes, open an issue to discuss first.

---

## ⚠️ Disclaimer

This project is an experimental emulator interface.

Performance may vary depending on:
- the CloudPhone server’s proximity
- your device’s hardware capabilities
- network conditions
- emulator core behavior

---

## 📄 License

This project is licensed under the GPLv3 License.

See the `LICENSE` file for details.
