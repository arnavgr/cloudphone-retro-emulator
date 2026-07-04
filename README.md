# cloudphone-retro-emulator

A lightweight, retro-emulator made for keypad devices that support [Cloudmosa CloudPhone](https://www.cloudphone.tech).

This project runs entirely in the browser, leveraging **EmulatorJS** for hardware emulation, **Google Drive** for zero-server ROM storage, and **Supabase** for secure Google OAuth integration.

## ✨ Features

*   **Zero-Server Architecture & Bring Your Own ROM (BYOR):** ROMs are read directly from your personal Google Drive. No game files are ever hosted or stored on application servers.
*   **Keypad Optimized UI:** Custom control mappings designed for physical T9/feature-phone keypads, bypassing the need for touch screens or external gamepads.
*   **Dynamic Screen Support:** Auto-detects screen resolution to handle both standard (240×320) and small (128×160) displays, dynamically switching rendering orientations.
*   **Auto-Setup:** On first sign-in, the app automatically creates the required folder structure in your Google Drive. No manual setup needed.
*   **Visible In-Game Saves:** In-game saves (SRAM/battery saves — the kind you make from the game's own save menu, e.g. Pokémon's "Save" option) are stored as normal `.sav` files inside a `saves/` folder in your Drive. You can see them, back them up, move them between devices, or replace them with saves from other emulators.
*   **Cloud Save States:** Save states (full emulator snapshots) are synced to a hidden `appDataFolder` in Google Drive, allowing you to pick up exactly where you left off.
*   **Save Indicators:** Green dots next to ROM names in the list show which games have in-game save files.
*   **Persistent Drive Access:** Google OAuth tokens are silently refreshed in the background via a serverless function, so Drive access never expires mid-session.

## 🚀 Setup

### ⚠️ Important Notice: "Unverified App" Warning & User Limits
Because this emulator requires the ability to read your imported ROMs and write save files directly back to your Drive, it requires Google's "Full Drive" access scope. 

Google classifies this as a "Restricted Scope." Because this is a free, hobby project, it has not gone through Google's expensive $10,000+ annual third-party security audit (CASA) required to "verify" the app. As a result:

1. **The Warning Screen:** When you sign in for the first time, Google will display a scary **"Google hasn't verified this app"** warning. This is normal. To proceed, click **Advanced**, and then click **Go to cloudphone-retro-emulator (unsafe)**.
2. **The 100-User Limit:** Google enforces a strict, permanent lifetime cap of **100 distinct users** for unverified apps. Once 100 different Google accounts have authorized this app, no new users will be able to sign in. If you are reading this and can sign in, you are one of the 100!

### First Time

1. Sign in with your Google Account. (Read the warning note above!).
2. The app automatically creates a `cloudphone-emulator` folder in your Google Drive with all required subfolders.
3. Open Google Drive (on any device) and add your *legally* acquired ROM files to the system folders inside `cloudphone-emulator/`.
4. Come back to the app and press **refresh**.

That's it. No manual folder creation required.

### Folder Structure

After first sign-in, your Drive will have:

cloudphone-emulator/
 ├─ gb/       (.gb)
 ├─ gbc/      (.gbc)
 ├─ gba/      (.gba)
 ├─ nes/      (.nes)
 ├─ snes/     (.sfc / .smc)
 ├─ psx/      (.chd)
 ├─ gg/       (.gg)
 ├─ sms/      (.sms)
 ├─ genesis/  (.md / .bin)
 ├─ bios/     (Required BIOS files → scph1001.bin for PSX, etc.)
 └─ saves/    (Auto-managed. In-game saves appear here.)

### Adding ROMs

Just drop ROM files into the matching system folder. The file extension must match:

| Folder | Extensions |
| :--- | :--- |
| `gb/` | `.gb` |
| `gbc/` | `.gbc` |
| `gba/` | `.gba` |
| `nes/` | `.nes` |
| `snes/` | `.sfc`, `.smc` |
| `psx/` | `.chd` |
| `gg/` | `.gg` |
| `sms/` | `.sms` |
| `genesis/` | `.md`, `.bin`, `.gen` |

Press **refresh** in the app header after adding ROMs.

---

## 💾 How Saves Work

This app has **two separate save systems** that work independently:

### In-Game Saves (SRAM / Battery Saves)

These are the saves created from **inside the game itself** — for example, pressing Save in Pokémon, Final Fantasy, Zelda, etc. Without these, your progress is lost when you exit.

*   **Stored as:** `saves/{ROM filename}.sav` — e.g. `Pokemon FireRed.gba` → `saves/Pokemon FireRed.sav`
*   **Location:** Visible in your Google Drive inside `cloudphone-emulator/saves/`
*   **Auto-saved:** On exit and every 5 minutes while playing
*   **User-manageable:** You can freely copy, move, rename, or replace these files
*   **Importing from other emulators:** Drop your existing `.sav` or `.srm` file into the `saves/` folder. **The filename must match the ROM filename exactly** (minus the extension). For example, if your ROM is `Pokemon FireRed.gba`, name your save file `Pokemon FireRed.sav`
*   **Green dots:** On the ROM list, a green dot next to a game's name means a save file exists for it

### Save States (Snapshots)

These are full emulator state snapshots — like a suspend/resume feature. Essential for games without in-game saves (e.g. most NES/SNES games).

*   **Stored as:** Hidden files in Google Drive's `appDataFolder` (not visible in normal Drive browsing)
*   **Manual only:** Press `9` to save, `7` to load
*   **Per-user:** Each Google account has its own save states
*   **Slot system:** Press the Call button to cycle through 4 save slots

### Launch Priority (In-Game Saves)

When you launch a ROM, the app looks for an in-game save in this order:
1. `saves/{ROM name}.sav` — standard format
2. `saves/{ROM name}.srm` — fallback for saves from other emulators
3. No save found — starts fresh

---

## ⌨️ Controls

The emulator uses a custom keypad mapping tailored for physical keys. Press `0` ingame to open the Controls Help Menu.

| Keypad Button | Action |
| :--- | :--- |
| **D-Pad / Arrows** | Movement |
| **ENTER** | A Button |
| **1** | B Button |
| **2** | Y Button |
| **4** | X Button |
| **5** | L Bumper |
| **6** | R Bumper |
| **LSK** | Start |
| **3** | Select |
| **7** | Load State |
| **9** | Save State |
| **0** | Controls Help Menu |
| **RSK** | Exit Rom |

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3.
*   **Hosting:** Cloudflare Pages.
*   **Emulation:** [EmulatorJS](https://emulatorjs.org/).
*   **Auth & Backend:** Supabase (Google OAuth Provider).
*   **Token Refresh:** Cloudflare Worker (holds Google client secret server-side).
*   **Storage API:** Google Drive API v3 (streaming ROMs, folder-based saves, and AppData save states).

---

## 🔒 Security & Privacy

### What the app requests

The app requests two Google Drive permissions:

| Scope | Why |
| :--- | :--- |
| `drive` | Required to write in-game saves (`.sav` files) to the `saves/` folder. This is the only scope that allows the app to both read saves you import from other emulators **and** write updated saves back to the same file. |
| `drive.appdata` | Used to store save states in a hidden folder. This is a separate, restricted space that only this app can access. |

### Why `drive` and not a narrower scope

Google offers two narrower Drive scopes that might seem sufficient but aren't:

*   **`drive.readonly`** — Can read ROMs and imported saves, but **cannot write any files**. In-game saves would be lost on exit.
*   **`drive.file`** — Can create new files, but **only files the app itself created**. If you drop a `.sav` file from another emulator into the `saves/` folder, the app can read it but **cannot update it** after you play — because the app didn't create that file. Your progress would be lost.

The `drive` scope is the only one that supports the full round-trip: read a user-provided save → play → write the updated save back to the same file. This is the same scope used by other cloud-syncing emulator tools.

### What the app actually does with write access

All write operations to your visible Drive files go through a **safety gate** that enforces these rules:

*   **Writes are restricted to the `saves/` folder only.** Before every write, the app verifies the target file's parent folder. If it's not inside `saves/`, the write is blocked and logged.
*   **The app never deletes files.** There is no delete operation anywhere in the codebase. Even if a save file is blank or corrupted, it is overwritten in-place, never removed.
*   **The app never modifies ROMs, BIOS files, or any other files.** Only `.sav` files inside `saves/` are ever written to.
*   **Writes are content-only.** The app uses `PATCH` with `uploadType=media`, which replaces only the file's binary content without touching metadata (name, permissions, sharing settings).

### Privacy

*   No game files (ROMs) or save states are stored on Supabase or any application server.
*   ROMs and in-game saves remain in your private Google Drive.
*   Save states are stored in Google Drive's `appDataFolder`, which is hidden from normal Drive browsing and inaccessible to other apps.
*   All database interactions via Supabase are protected by Row Level Security (RLS).

---

## 🛠️ Planned Improvements & Feedback

This project is currently in active development and has not been fully stress-tested across all possible device configurations. I am actively looking for feedback in the following areas:

*   **Button Remapping:** The current controls are optimized for standard T9 keypads. If the default layout does not fit well for a specific console, please open an issue with your suggested mapping.
*   **System Requests:** Support for additional 8-bit and 16-bit consoles can be added upon request, provided they are supported by EmulatorJS cores and fit within 240×320 and/or 128×160.
*   **Performance Optimization:** Seeking feedback on frame rates, input lag, and stutter improvements.
*   **Save Sync Edge Cases:** If you notice saves not loading/saving correctly (especially after network interruptions, token refreshes, or rapid exit/re-launch), please report it with debug logs (press `8` during gameplay to open the debug overlay).

## 🤝 Contributing

Contributions are welcome! If you have a better control scheme for a specific console or want to help optimize the Drive synchronization logic:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewConsoleSupport`).
3.  Commit your changes.
4.  Push to the branch and open a Pull Request.

While I am open to direct Pull Requests, I recommend opening an issue first to discuss major changes before you start working on them.

---

### ⚠️ Disclaimer
This project is an experimental emulator interface. Performance may vary significantly depending on the Cloudphone server's proximity and your device's local hardware capabilities.

## 📄 License

This project is licensed under the **GPLv3 License**. See the `LICENSE` file for details.
