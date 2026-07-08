# cloudphone-retro-emulator

A lightweight, retro-emulator made for keypad devices that support [Cloudmosa CloudPhone](https://www.cloudphone.tech).

This project runs entirely in the browser, leveraging **EmulatorJS** for hardware emulation, **Google Drive** for zero-server ROM storage, and **Supabase** for secure Google OAuth integration.

## ✨ Features

*   **Zero-Server Architecture & Bring Your Own ROM (BYOR):** ROMs are streamed directly from your personal Google Drive using Google Picker. No game files are ever hosted or stored on application servers.
*   **Keypad Optimized UI:** Custom control mappings designed for physical T9/feature-phone keypads, bypassing the need for touch screens or external gamepads.
*   **Dynamic Screen Support:** Auto-detects screen resolution to handle both standard (240×320) and small (128×160) displays, dynamically switching rendering orientations.
*   **Picker-Based ROM Management:** Select ROMs and BIOS files directly from your Drive using Google Picker. The app remembers every file you pick — no re-selection needed on future visits.
*   **Visible In-Game Saves:** In-game saves (SRAM/battery saves) are stored as `.sav` files in a `cloudphone-emulator-saves/` folder the app creates in your Drive. You can see them, back them up, and replace them with saves from other emulators at any time.
*   **Cloud Save States:** Save states (full emulator snapshots) are synced to a hidden `appDataFolder` in Google Drive, allowing you to pick up exactly where you left off.
*   **Save Indicators:** Green dots next to ROM names show which games have an in-game save file.
*   **ROM Options Menu:** Press `*` on any ROM to access LAUNCH, IMPORT SAVE, and REMOVE FROM LIST without leaving the selector.
*   **Persistent Drive Access:** Google OAuth tokens are silently refreshed in the background via a serverless function, so Drive access never expires mid-session.

## 🎮 Supported Systems

*   **Nintendo:** GB/GBC, GBA, NES, SNES.
*   **Sega:** Game Gear (GG), Master System (SMS), Genesis/Mega Drive (MD).
*   **Sony:** PlayStation 1 (PS1/PSX).

## 🚀 Setup

### First Time

1. Sign in with your Google Account and grant Drive access when prompted.
2. Press the **`+`** button in the top-right corner of the ROM selector.
3. Google Picker opens (you may briefly see a Google consent popup first; this is required to allow the Picker to function securely within the CloudPhone environment). Navigate to your ROM files and select them. You can select multiple files at once.
4. The app classifies each file by extension, adds them to the ROM list, and saves the index. Done.

The app never touches your Drive except to read the files you pick and write saves to its own folder.

### Adding More ROMs Later

Press **`+`** at any time to open Picker again. Files you've already added are deduplicated automatically — picking the same file twice just updates the reference.

### Adding BIOS Files

BIOS files are picked the same way as ROMs — just press **`+`** and select the BIOS file (e.g. `scph1001.bin` for PS1). The app recognises known BIOS filenames automatically and stores them separately from ROMs. If you launch a system that needs a BIOS and none is found, the app will prompt you.

### Supported File Extensions

| System | Extensions |
| :--- | :--- |
| Game Boy Color | `.gb`, `.gbc` |
| Game Boy Advance | `.gba` |
| NES | `.nes` |
| SNES | `.sfc`, `.smc` |
| PlayStation 1 | `.chd` |
| Game Gear | `.gg` |
| Master System | `.sms` |
| Genesis / Mega Drive | `.md`, `.gen`, `.bin`* |

*`.bin` files are classified as Genesis ROMs unless the filename matches a known BIOS name (e.g. `scph1001.bin`), in which case they are treated as BIOS files.

---

## 💾 How Saves Work

The app has two independent save systems:

### In-Game Saves (SRAM / Battery Saves)

These are saves created from **inside the game** — e.g. Pokémon's "Save" option, Zelda's save menu. Without these, progress is lost when you exit.

*   **Stored as:** `.sav` files in `cloudphone-emulator-saves/` in your Drive (visible, user-manageable)
*   **Auto-saved:** On exit and every 5 minutes while playing
*   **Green dot:** A green dot next to a ROM's name means an in-game save exists for it
*   **Importing from other emulators:** Press `*` on a ROM → **IMPORT SAVE** → pick your `.sav` or `.srm` file from Drive via Picker. The app gains write access to that exact file and will update it in-place on every save going forward.

### Save States (Snapshots)

Full emulator state snapshots — like a suspend/resume feature. Essential for games without in-game saves (most NES/SNES games).

*   **Stored in:** Google Drive's hidden `appDataFolder` (not visible in normal Drive browsing)
*   **Manual:** Press `9` to save, `7` to load
*   **Slots:** Press the **Call** key to cycle through 4 independent save slots
*   **Per-user:** Each Google account has its own isolated save states

---

## ⌨️ Controls

Press `0` in-game to open the full controls reference. Default mappings:

| Key | Action |
| :--- | :--- |
| **D-Pad / Arrows** | D-Pad |
| **ENTER** | A |
| **1** | B |
| **2** | Y |
| **4** | X |
| **5** | L |
| **6** | R |
| **LSK** | Start |
| **3** | Select |
| **7** | Load State |
| **9** | Save State |
| **Call** | Cycle save slot |
| **8** | Debug overlay |
| **0** | Controls help |
| **RSK** | Exit ROM |

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3.
*   **Hosting:** Cloudflare Pages (configured with `Cross-Origin-Opener-Policy: unsafe-none` to allow proxy popup communication).
*   **Emulation:** [EmulatorJS](https://emulatorjs.org/).
*   **Auth:** Supabase (Google OAuth provider).
*   **Token Refresh:** Cloudflare Worker (holds Google client secret server-side).
*   **File Selection:** Google Picker API.
*   **Storage:** Google Drive API v3 — ROM streaming by file ID, Picker-indexed BIOS, visible battery saves, hidden AppData save states.
*   **ROM Index:** JSON blob in `appDataFolder` mapping Drive file IDs to ROM metadata. No folder scanning at runtime.

---

## 🔒 Security & Privacy

### Google Drive permissions

The app requests two scopes:

| Scope | Why |
| :--- | :--- |
| `drive.file` | Grants access to files the app creates (battery saves) and files the user explicitly opens through Google Picker (ROMs, BIOS, imported saves). No access to any other Drive files. |
| `drive.appdata` | Used to store the ROM index and save states in a hidden, app-only folder. No other app can access this folder. |

### Why `drive.file` is the right scope

`drive.file` is Google's **non-sensitive** scope for per-file Drive access. By using Google Picker, you explicitly grant the app read and write access only to the exact files you choose. It is the official, secure scope recommended by Google for apps that let users bring their own files, completely avoiding the need for broad, sensitive Drive permissions.

The key property: when a user selects a file through Google Picker, the app gains permanent read/write access to that specific file. This means:

*   ROMs you pick can be streamed on every future visit without re-picking.
*   A `.sav` file you import via Picker can be read on launch and written back on exit — the full round-trip — because you explicitly opened it through Picker.
*   The app can never access any Drive file the user did not deliberately select.

### What the app writes to Drive

*   **Battery saves** (`.sav`) — created in `cloudphone-emulator-saves/`, updated in-place on exit and every 5 minutes during play.
*   **ROM index** — a small JSON file in `appDataFolder` containing Drive file IDs and ROM metadata. No ROM content is copied.
*   **Save states** — binary snapshots in `appDataFolder`.

The app **never deletes** any Drive file. The app **never reads or writes** any file it did not create or that the user did not open through Picker.

### Privacy

*   ROMs, BIOS files, and in-game saves remain in your private Google Drive at all times.
*   No game files are uploaded to or stored on any application server.
*   Save states and the ROM index are stored in `appDataFolder`, which is hidden from normal Drive browsing and inaccessible to other apps.
*   Supabase is used only for authentication. All data queries are protected by Row Level Security (RLS).

**📝 Official Policy:** For our formal compliance documentation, please read the full [Privacy Policy](privacy.html) and [Terms of Service](terms.html).

---

## 🛠️ Planned Improvements

*   **Button Remapping:** Open an issue if the default keypad layout doesn't fit your device.
*   **System Requests:** Additional EmulatorJS-supported systems can be added on request.
*   **Performance:** Feedback on frame rate, input lag, or stutter welcome, especially on non-standard Cloudphone configurations.
*   **Save Edge Cases:** If saves fail to load or sync after network interruptions or token refreshes, open an issue and include the debug log (press `8` in-game).

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/your-feature`.
3.  Commit and push your changes.
4.  Open a Pull Request. For significant changes, open an issue to discuss first.

---

### ⚠️ Disclaimer

This project is an experimental emulator interface. Performance may vary depending on the CloudPhone server's proximity and your device's hardware capabilities.

## 📄 License

This project is licensed under the **GPLv3 License**. See the `LICENSE` file for details.
