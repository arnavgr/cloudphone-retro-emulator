# cloudphone-retro-emulator

A lightweight, retro-emulator that is made for keypad devices that support [cloudmosa cloudphone](https://www.cloudphone.tech) 

This project runs entirely in the browser, leveraging **EmulatorJS** for hardware emulation, **Google Drive** for zero-server ROM storage, and **Supabase** for secure Google OAuth integration.

## ✨ Features

*   **Zero-Server Architecture & Bring Your Own Rom(BYOR):** ROMs and save states are read directly from the user's personal Google Drive. No game files are ever hosted or stored on application servers.
*   **Keypad Optimized UI:** Custom control mappings designed for physical T9/feature-phone keypads, bypassing the need for touch screens or external gamepads.
*   **Dynamic Screen Support:** Auto-detects screen resolution to handle both standard (240x320) and small (128x160) displays, dynamically switching rendering orientations.
*   **Cloud Save States:** Game states are synced automatically to a hidden `appDataFolder` in Google Drive, allowing users to pick up exactly where they left off.
*   **Auto-Save Protection:** Built-in token monitoring automatically forces a cloud save before the 1-hour Google OAuth token expires to prevent data loss.

## 🎮 Supported Systems

*   **Nintendo:** GB, GBC, GBA, NES, SNES, N64.
*   **Sega:** Game Gear (GG), Master System (SMS), Genesis/Mega Drive (MD).
*   **Sony:** PlayStation 1 (PSX).

## 🚀 Setup & Installation

Since this application reads ROMs from your personal Google Drive, you must set up your folder structure before playing.

1. Sign in to the application using your Google Account.
2. Open your Google Drive and create a root folder named exactly `cloudphone-emulator`.
3. Inside that folder, create subfolders for the systems you want to play and add your *legally* acquired ROMs.

**Required Folder Structure:**
```text
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
 ├─ n64/      (.z64 / .n64 / .v64)
 └─ bios/     (Required BIOS files --> scph1001.bin for PSX,etc)
 ```

 ## ⌨️ Controls

The emulator uses a custom keypad mapping tailored for physical keys. Use can use 0 ingame to open the Controls Help Menu

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
| **0** | Conrols Help Menu |
| **RSK** | Exit Rom |

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** Vanilla JavaScript, HTML5, CSS3.
*   **Hosting:** Cloudflare Pages.
*   **Emulation:** [EmulatorJS](https://emulatorjs.org/).
*   **Auth & Backend:** Supabase (Google OAuth Provider).
*   **Storage API:** Google Drive API v3 (streaming ROMs and AppData saves).

---

## 🔒 Security & Privacy

*   **Row Level Security (RLS):** All database interactions via Supabase are protected by RLS, ensuring users can only access their own metadata.
*   **OAuth Scopes:** The app requests `drive.readonly` (to stream ROMs) and `drive.appdata` (to store saves in a hidden, restricted folder).
*   **Privacy:** No game files (ROMs) or save states are stored on Supabase or our servers. Everything remains within your private Google Drive ecosystem.

---

## 🛠️ Planned Improvements & Feedback

This project is currently in active development and has not been fully stress-tested across all possible device configurations. I am actively looking for feedback in the following areas:

*   **Button Remapping:** The current controls are optimized for standard T9 keypads. If the default layout does not fit well for a specific console, please open an issue with your suggested mapping.
*   **System Requests:** Support for additional 8-bit and 16-bit consoles can be added upon request, provided they are supported by EmulatorJS cores compatible and fit the within 240x320 and/or 120x160.
*   **Performance Optimization:** Seeking feedback on frame rates/input lag/stutter improvements.

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
